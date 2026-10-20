import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from .models import EvalReport, Run


class Store:
    def __init__(self, path: Path):
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as db:
            db.executescript("""
                PRAGMA journal_mode=WAL;
                CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY, session_id TEXT NOT NULL, status TEXT NOT NULL, body TEXT NOT NULL);
                CREATE UNIQUE INDEX IF NOT EXISTS active_session ON runs(session_id) WHERE status IN ('queued','running','awaiting_approval');
                CREATE TABLE IF NOT EXISTS memory(run_id TEXT PRIMARY KEY, session_id TEXT NOT NULL, question TEXT NOT NULL, answer TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS reports(id TEXT PRIMARY KEY, session_id TEXT NOT NULL, body TEXT NOT NULL);
            """)

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path, timeout=30)
        try:
            with db:
                yield db
        finally:
            db.close()

    def save_run(self, run: Run):
        with self.connect() as db:
            db.execute("INSERT INTO runs VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status, body=excluded.body",
                       (run.id, run.session_id, run.status, run.model_dump_json()))

    def get_run(self, run_id: str, session_id: str) -> Run | None:
        with self.connect() as db:
            row = db.execute("SELECT body FROM runs WHERE id=? AND session_id=?", (run_id, session_id)).fetchone()
        return Run.model_validate_json(row[0]) if row else None

    def runs(self, session_id: str) -> list[Run]:
        with self.connect() as db:
            rows = db.execute("SELECT body FROM runs WHERE session_id=? ORDER BY rowid DESC LIMIT 30", (session_id,)).fetchall()
        return [Run.model_validate_json(row[0]) for row in rows]

    def history(self, session_id: str) -> list[dict]:
        with self.connect() as db:
            rows = db.execute("SELECT question,answer FROM memory WHERE session_id=? ORDER BY rowid DESC LIMIT 6", (session_id,)).fetchall()
        return [{"question": q, "result": json.loads(a)} for q, a in reversed(rows)]

    def remember(self, run: Run):
        if run.result is None:
            return
        with self.connect() as db:
            db.execute("INSERT OR IGNORE INTO memory VALUES(?,?,?,?)",
                       (run.id, run.session_id, run.question, run.result.model_dump_json()))

    def claim_approval(self, run: Run) -> bool:
        run.status = "running"
        with self.connect() as db:
            return db.execute("UPDATE runs SET status=?,body=? WHERE id=? AND status='awaiting_approval'",
                              (run.status, run.model_dump_json(), run.id)).rowcount == 1

    def recover(self):
        # Pending approvals keep their checkpoint. Interrupted executions are explicit failures,
        # so we never silently repeat paid calls after process restart.
        with self.connect() as db:
            for (body,) in db.execute("SELECT body FROM runs WHERE status IN ('queued','running')").fetchall():
                run = Run.model_validate_json(body)
                run.status = "failed"
                run.error = "Backend restarted during execution. Start a new run; pending approvals are preserved."
                db.execute("UPDATE runs SET status=?,body=? WHERE id=?", (run.status, run.model_dump_json(), run.id))
            for (body,) in db.execute("SELECT body FROM reports").fetchall():
                report = EvalReport.model_validate_json(body)
                if report.status == "running":
                    report.status = "failed"
                    report.error = "Evaluation interrupted by backend restart."
                    db.execute("UPDATE reports SET body=? WHERE id=?", (report.model_dump_json(), report.id))

    def save_report(self, report: EvalReport):
        with self.connect() as db:
            db.execute("INSERT INTO reports VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body",
                       (report.id, report.session_id, report.model_dump_json()))

    def reports(self, session_id: str) -> list[EvalReport]:
        with self.connect() as db:
            rows = db.execute("SELECT body FROM reports WHERE session_id=? ORDER BY rowid DESC LIMIT 10", (session_id,)).fetchall()
        return [EvalReport.model_validate_json(row[0]) for row in rows]
