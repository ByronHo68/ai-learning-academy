import hmac
import sqlite3
import threading
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from uuid import UUID
from fastapi import Depends, FastAPI, Header, HTTPException
from .bank import TOOLS
from .config import Settings
from .engine import Agent
from .evals import cases, create_report, evaluate
from .models import ApprovalRequest, EvalIndex, EvalReport, EvalRequest, Health, Run, RunIndex, RunRequest
from .store import Store


def create_app(settings: Settings | None = None):
    config = settings or Settings()
    store = Store(config.agent_data_dir / "lab.sqlite")
    store.recover()
    agent = Agent(config, store)
    pool = ThreadPoolExecutor(max_workers=3)
    run_slots = threading.BoundedSemaphore(2)
    eval_slot = threading.Lock()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        yield
        pool.shutdown(wait=True)
        agent.close()

    def session(authorization: str = Header(default=""), x_lab_session: UUID = Header()):
        if not hmac.compare_digest(authorization, f"Bearer {config.lab_auth_token}"):
            raise HTTPException(401, "Authentication required")
        return str(x_lab_session)

    app = FastAPI(title="Academy Agent Lab", version="1.0.0", lifespan=lifespan,
                  docs_url=None, redoc_url=None, openapi_url=None)

    @app.get("/health", response_model=Health)
    def health(_: str = Depends(session)):
        try:
            tools = agent.bank.list_tools()
        except Exception:
            tools = []
        return Health(bank_connected=TOOLS.issubset(tools), tools=tools, live_configured=config.live_configured,
                      model=config.model_name or None, langfuse_configured=config.tracing_configured)

    @app.get("/runs", response_model=RunIndex)
    def history(owner: str = Depends(session)):
        return RunIndex(runs=store.runs(owner))

    def execute_and_release(run: Run, decision: bool | None = None):
        try:
            agent.execute(run, decision)
        finally:
            run_slots.release()

    @app.post("/runs", response_model=Run, status_code=202)
    def run(request: RunRequest, owner: str = Depends(session)):
        if not request.question.strip():
            raise HTTPException(422, "Enter a question")
        if not run_slots.acquire(blocking=False):
            raise HTTPException(429, "Two runs are already active. Try again shortly.")
        try:
            created = agent.create(request, owner)
        except (ValueError, sqlite3.IntegrityError) as error:
            run_slots.release()
            raise HTTPException(409, "Finish the pending run first." if isinstance(error, sqlite3.IntegrityError) else str(error)) from None
        pool.submit(execute_and_release, created)
        return created

    @app.get("/runs/{run_id}", response_model=Run)
    def get_run(run_id: UUID, owner: str = Depends(session)):
        found = store.get_run(str(run_id), owner)
        if found is None:
            raise HTTPException(404, "Run not found")
        return found

    @app.post("/runs/{run_id}/approval", response_model=Run, status_code=202)
    def approval(run_id: UUID, request: ApprovalRequest, owner: str = Depends(session)):
        found = get_run(run_id, owner)
        if found.status != "awaiting_approval":
            raise HTTPException(409, "Run is not awaiting approval")
        if not run_slots.acquire(blocking=False):
            raise HTTPException(429, "Try again shortly")
        if not store.claim_approval(found):
            run_slots.release()
            raise HTTPException(409, "Decision has already been submitted")
        pool.submit(execute_and_release, found, request.approved)
        return found

    @app.get("/evals", response_model=EvalIndex)
    def eval_index(owner: str = Depends(session)):
        return EvalIndex(cases=cases(), reports=store.reports(owner))

    def evaluate_and_release(report: EvalReport):
        try:
            evaluate(agent, report)
        finally:
            eval_slot.release()

    @app.post("/evals", response_model=EvalReport, status_code=202)
    def start_eval(request: EvalRequest, owner: str = Depends(session)):
        if request.engine == "live" and not config.live_configured:
            raise HTTPException(409, "Configure a live model first")
        if not eval_slot.acquire(blocking=False):
            raise HTTPException(409, "An evaluation is already running")
        report = create_report(request, owner, model_name=config.model_name)
        store.save_report(report)
        pool.submit(evaluate_and_release, report)
        return report

    return app
