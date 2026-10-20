"""Exercise real provider and Langfuse SDKs against a local protocol fixture, not a live model."""
import gzip
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import threading
from uuid import uuid4

import pytest
from opentelemetry.proto.collector.trace.v1.trace_service_pb2 import ExportTraceServiceRequest

from academy.config import Settings
from academy.engine import Agent
from academy.models import RunRequest
from academy.store import Store


def test_structured_provider_calls_usage_cost_and_langfuse_export(tmp_path):
    requests = []
    spans = []
    invalid_plan = [False]

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def respond(self, body):
            data = json.dumps(body).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            self.respond({"data": [{"id": "test-project", "name": "Test", "metadata": {},
                                    "organization": {"id": "test-org", "name": "Test"}}]})

        def do_POST(self):
            body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
            if self.headers.get("Content-Encoding") == "gzip":
                body = gzip.decompress(body)
            if "traces" in self.path:
                trace = ExportTraceServiceRequest.FromString(body)
                for resource in trace.resource_spans:
                    for scope in resource.scope_spans:
                        spans.extend(scope.spans)
                self.respond({})
                return
            request = json.loads(body)
            requests.append(request)
            name = request["response_format"]["json_schema"]["name"]
            answer = {
                "Plan": {"intent": "balance", "account_id": "HK-001", "reason": ""},
                "HelperNote": {"summary": "Evidence and restrictions reviewed."},
                "AnswerText": {"answer": "The demo balance is HKD 12,850.75."},
            }[name]
            if invalid_plan[0]:
                answer = {"intent": "transfer_all_money"}
            self.respond({"id": "chat-test", "object": "chat.completion", "created": 1, "model": "protocol-fixture",
                          "choices": [{"index": 0, "finish_reason": "stop", "message": {"role": "assistant", "content": json.dumps(answer)}}],
                          "usage": {"prompt_tokens": 100, "completion_tokens": 20, "total_tokens": 120}})

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_port}"
    settings = Settings(agent_data_dir=tmp_path, model_api_key="local-protocol-fixture",
                        model_base_url=base + "/v1", model_name="protocol-fixture",
                        model_input_usd_per_million=2, model_output_usd_per_million=4,
                        langfuse_public_key="pk-lf-" + str(uuid4()), langfuse_secret_key="local-fixture",
                        langfuse_base_url=base)
    agent = Agent(settings, Store(tmp_path / "lab.sqlite"))
    try:
        run = agent.create(RunRequest(question="What is my balance?", engine="live", mode="supervisor"), str(uuid4()))
        agent.execute(run)
        agent.tracer.flush()
        assert run.status == "completed", run.error
        assert run.result.balance == 12850.75
        assert len(requests) == run.metrics.model_calls == 4
        assert run.metrics.input_tokens == 400
        assert run.metrics.output_tokens == 80
        assert run.metrics.cost_usd == pytest.approx(.00112)
        assert run.metrics.cost_basis == "configured_rates"
        assert run.metrics.trace_url == base + "/project/test-project/traces/" + run.id.replace("-", "")
        assert all(request["response_format"]["json_schema"]["strict"] for request in requests)
        assert {"agent_run", "supervisor", "account_helper", "policy_helper", "supervisor_answer", "get_account_summary"}.issubset({span.name for span in spans})
        assert {span.trace_id.hex() for span in spans} == {run.id.replace("-", "")}
        encoded = b"".join(span.SerializeToString() for span in spans)
        assert settings.bank_api_token.encode() not in encoded
        assert settings.bank_approval_secret.encode() not in encoded
        invalid_plan[0] = True
        failed = agent.create(RunRequest(question="What is my balance?", engine="live"), str(uuid4()))
        agent.execute(failed)
        assert failed.status == "failed"
        assert failed.metrics.model_calls == 1
        assert failed.metrics.cost_usd is None
        assert not any(event.kind == "tool" for event in failed.events)
    finally:
        agent.close()
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
