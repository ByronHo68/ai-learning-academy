from pathlib import Path
from uuid import uuid4
import os
import time

import httpx
import pytest
from fastapi.testclient import TestClient

from academy.api import create_app
from academy.config import Settings
from academy.engine import Agent
from academy.evals import cases, create_report, evaluate, gate, score
from academy.models import EvalRequest, RunRequest
from academy.store import Store


@pytest.fixture
def settings(tmp_path):
    return Settings(agent_data_dir=tmp_path)


@pytest.fixture
def agent(settings):
    instance = Agent(settings, Store(settings.agent_data_dir / "lab.sqlite"))
    yield instance
    instance.close()


def test_real_mcp_tools_and_bank_authorization(agent, settings):
    assert set(agent.bank.list_tools()) == {"get_account_summary", "list_transactions", "open_review_case"}
    assert agent.bank.call("get_account_summary", {"accountId": "HK-001"})["balance"] == 12850.75
    headers = {"Authorization": f"Bearer {settings.bank_api_token}"}
    base = settings.bank_mcp_url.removesuffix("/mcp")
    assert httpx.get(f"{base}/api/accounts/HK-001").status_code == 401
    assert httpx.get(f"{base}/api/accounts/HK-002", headers=headers).status_code == 400
    denied = httpx.post(f"{base}/api/review-cases", headers=headers, json={
        "accountId": "HK-001", "runId": str(uuid4()), "reason": "unapproved",
        "approvalProof": "forged",
    })
    assert denied.status_code == 400


def test_approval_survives_restart_and_write_is_idempotent(settings):
    store = Store(settings.agent_data_dir / "lab.sqlite")
    session = str(uuid4())
    first = Agent(settings, store)
    run = first.create(RunRequest(question="Open a review case for the cafe charge.", mode="supervisor"), session)
    first.execute(run)
    assert run.status == "awaiting_approval"
    assert not any(event.step == "open_review_case" for event in run.events)
    pending = run.pending
    first.close()

    store.recover()
    restored = store.get_run(run.id, session)
    assert restored.status == "awaiting_approval"
    second = Agent(settings, store)
    try:
        second.execute(restored, True)
        assert restored.status == "completed"
        assert restored.result.case_id
        proof = second.bank.approval_proof(run_id=run.id, account_id="HK-001", reason=pending.reason)
        repeated = second.bank.call("open_review_case", {
            "accountId": "HK-001", "runId": run.id, "reason": pending.reason, "approvalProof": proof,
        })
        assert repeated["caseId"] == restored.result.case_id
        assert len(store.history(session)) == 1
        followup = second.create(RunRequest(question="What is my balance?"), session)
        second.execute(followup)
        assert followup.memory_turns == 1
    finally:
        second.close()


def test_reject_never_calls_write(agent):
    run = agent.create(RunRequest(question="Open a review case."), str(uuid4()))
    agent.execute(run)
    agent.execute(run, False)
    assert run.status == "completed"
    assert run.result.action == "rejected"
    assert run.result.case_id is None
    assert not any(event.step == "open_review_case" for event in run.events)


def test_http_session_isolation_and_approval_claim(settings):
    app = create_app(settings)
    owner = str(uuid4())
    headers = {"Authorization": f"Bearer {settings.lab_auth_token}", "X-Lab-Session": owner}
    with TestClient(app) as client:
        assert client.get("/health", headers={"X-Lab-Session": owner}).status_code == 401
        response = client.post("/runs", headers=headers, json={"question": "Open a review case."})
        assert response.status_code == 202
        run_id = response.json()["id"]
        for _ in range(100):
            run = client.get(f"/runs/{run_id}", headers=headers).json()
            if run["status"] == "awaiting_approval":
                break
            time.sleep(.03)
        assert run["status"] == "awaiting_approval"
        other = {**headers, "X-Lab-Session": str(uuid4())}
        assert client.get(f"/runs/{run_id}", headers=other).status_code == 404
        assert client.post(f"/runs/{run_id}/approval", headers=other, json={"approved": True}).status_code == 404
        assert client.post("/runs", headers=headers, json={"question": "What is my balance?"}).status_code == 409
        assert client.post(f"/runs/{run_id}/approval", headers=headers, json={"approved": False}).status_code == 202
        assert client.post(f"/runs/{run_id}/approval", headers=headers, json={"approved": True}).status_code == 409


def test_full_dataset_and_gate_detect_regression(agent):
    dataset = cases()
    assert len(dataset) == len({case.id for case in dataset}) == 50
    assert sum(case.category == "injection" for case in dataset) == 12
    report = evaluate(agent, create_report(EvalRequest(), str(uuid4())))
    if os.environ.get("EVAL_REPORT_PATH"):
        output = Path(os.environ["EVAL_REPORT_PATH"])
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(report.model_dump_json(indent=2))
    assert report.status == "completed"
    assert report.gate_passed, [(r.case_id, r.mode, r.error, [c.name for c in r.checks if not c.passed]) for r in report.rows if not r.passed]
    assert len(report.rows) == 100
    broken = [row.model_copy(deep=True) for row in report.rows]
    regression = agent.create(RunRequest(question=dataset[0].question), str(uuid4()))
    agent.execute(regression)
    regression.result.balance = 0
    regression.result.answer = "The balance is HKD 0."
    broken[0].checks = score(dataset[0], regression, False)
    broken[0].passed = all(check.passed for check in broken[0].checks)
    assert not broken[0].passed
    assert not gate(broken, ["single", "supervisor"], "offline")
    assert not gate(report.rows[:-1], ["single", "supervisor"], "offline")


def test_live_engine_does_not_silently_fall_back(settings):
    settings = settings.model_copy(update={"model_api_key": "", "model_name": ""})
    agent = Agent(settings, Store(settings.agent_data_dir / "lab.sqlite"))
    try:
        with pytest.raises(ValueError, match="MODEL_API_KEY"):
            agent.create(RunRequest(question="What is my balance?", engine="live"), str(uuid4()))
    finally:
        agent.close()
