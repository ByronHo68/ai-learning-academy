// Complete offline programs. Live provider integration is deliberately a separate exercise.
export const juniorExamples = {
  python: `import json

def count_intents(raw):
    rows = json.loads(raw)
    if not isinstance(rows, list):
        raise ValueError("expected a list")
    counts = {}
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            raise ValueError(f"row {index}: expected an object")
        intent = row.get("intent")
        if not isinstance(intent, str) or not intent.strip():
            raise ValueError(f"row {index}: missing intent")
        intent = intent.strip().lower()
        counts[intent] = counts.get(intent, 0) + 1
    return counts

assert count_intents('[{"intent":"Refund"},{"intent":" refund "}]') == {"refund": 2}
assert count_intents('[]') == {}
for bad in ['{}', '[null]', '[{"intent":3}]', '[{"intent":" "}]', 'broken JSON']:
    try:
        count_intents(bad)
    except ValueError:
        pass
    else:
        raise AssertionError(f"accepted invalid input: {bad}")
print("python: 2 valid + 5 invalid cases passed")`,
  backend: `import json
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (id TEXT PRIMARY KEY, owner TEXT, status TEXT)")
with db:
    db.executemany("INSERT INTO orders VALUES (?, ?, ?)", [
        ("HK-1", "alice", "dispatched"), ("HK-2", "bob", "pending")])

# A transport-independent handler; not an HTTP server or login system.
# trusted_user must come from verified server-side authentication.
def handle(raw_body, trusted_user):
    if not trusted_user:
        return 401, {"error": "unauthenticated"}
    try:
        body = json.loads(raw_body)
    except (ValueError, TypeError):
        return 400, {"error": "invalid_json"}
    if (not isinstance(body, dict) or set(body) != {"order_id"}
            or not isinstance(body["order_id"], str)
            or not 1 <= len(body["order_id"]) <= 40):
        return 422, {"error": "invalid_order_id"}
    row = db.execute(
        "SELECT status FROM orders WHERE id = ? AND owner = ?",
        (body["order_id"], trusted_user)).fetchone()
    if row is None:
        return 404, {"error": "not_found"}
    return 200, {"order_id": body["order_id"], "status": row[0]}

assert handle('{"order_id":"HK-1"}', "alice")[0] == 200
assert handle('{"order_id":"HK-2"}', "alice")[0] == 404
assert handle('{"order_id":"missing"}', "alice")[0] == 404
assert handle('{"order_id":"HK-1"}', None)[0] == 401
assert handle('broken', "alice")[0] == 400
assert handle('{"order_id":"HK-2","user":"bob"}', "alice")[0] == 422
assert handle(json.dumps({"order_id": "' OR 1=1 --"}), "alice")[0] == 404
db.close()
print("backend: 7 contract and authorization checks passed")`,
  model: `import json

SCHEMA = {
    "type": "object", "additionalProperties": False,
    "properties": {
        "intent": {"type": "string", "enum": ["refund", "delivery", "other"]},
        "order_id": {"type": ["string", "null"]}
    },
    "required": ["intent", "order_id"]
}

# This builds an OpenRouter request body; it does not send it.
def request_body(model_id, message):
    return {
        "model": model_id,
        "messages": [
            {"role": "system", "content": "Classify the request. Never invent an order ID. Use null when absent."},
            {"role": "user", "content": message}
        ],
        "response_format": {"type": "json_schema", "json_schema": {
            "name": "support_intent", "strict": True, "schema": SCHEMA}},
        "provider": {"require_parameters": True},
        "max_tokens": 200
    }

def validate_text(text):
    value = json.loads(text)
    if not isinstance(value, dict) or set(value) != {"intent", "order_id"}:
        raise ValueError("wrong fields")
    if not isinstance(value["intent"], str) or value["intent"] not in {"refund", "delivery", "other"}:
        raise ValueError("unknown intent")
    order_id = value["order_id"]
    if order_id is not None and (not isinstance(order_id, str) or not order_id.strip()):
        raise ValueError("invalid order_id")
    return value

def parse_response(response):
    try:
        if not isinstance(response, dict) or not isinstance(response.get("choices"), list):
            return {"status": "handoff"}
        choice = response["choices"][0]
        if not isinstance(choice, dict) or not isinstance(choice.get("message"), dict):
            return {"status": "handoff"}
        message = choice["message"]
        if choice["finish_reason"] != "stop" or message.get("refusal"):
            return {"status": "handoff"}
        parsed = validate_text(message["content"])
    except (ValueError, TypeError, KeyError, IndexError):
        return {"status": "handoff"}
    return {"status": "proposal", "data": parsed}

good = {"choices": [{"finish_reason": "stop", "message": {
    "content": '{"intent":"refund","order_id":"HK-1"}'}}]}
assert parse_response(good)["status"] == "proposal"
for response in [{}, {"choices": []}, {"choices": [{"finish_reason": "length"}]},
                 {"choices": [{"finish_reason": "stop", "message": {"refusal": "no"}}]},
                 {"choices": [{"finish_reason": "stop", "message": {"content": "{}"}}]}]:
    assert parse_response(response) == {"status": "handoff"}
assert request_body("chosen-provider/model", "Where is HK-1?")["provider"]["require_parameters"]
print("model: proposal + 5 failure cases passed; no API request sent")`,
  retrieval: `import re

# Synthetic Hong Kong support documents. Tags are a lexical baseline, not embeddings.
DOCS = [
    {"id": "returns-v2", "tenant": "shop-a", "active": True,
     "tags": {"refund", "return", "退款", "退貨"}, "text": "Returns require a receipt. / 退貨須出示收據。"},
    {"id": "delivery-v1", "tenant": "shop-a", "active": True,
     "tags": {"delivery", "shipping", "送貨", "運送"}, "text": "Delivery normally takes 2 days. / 送貨一般需兩日。"},
    {"id": "returns-v1", "tenant": "shop-a", "active": False,
     "tags": {"refund", "退款"}, "text": "Obsolete policy"},
    {"id": "private-v1", "tenant": "shop-b", "active": True,
     "tags": {"refund", "退款"}, "text": "Another tenant's policy"},
]

def search(query, trusted_tenant, k=2):
    if not isinstance(query, str) or type(k) is not int or not 1 <= k <= 5:
        raise ValueError("invalid query or k")
    query = query.lower()
    # Permission and freshness filters happen before ranking.
    candidates = [d for d in DOCS if d["tenant"] == trusted_tenant and d["active"]]
    words = set(re.findall(r"[a-z]+", query))
    def score(doc):
        return sum(tag in words if tag.isascii() else tag in query for tag in doc["tags"])
    ranked = sorted(candidates, key=lambda d: (-score(d), d["id"]))
    return [d["id"] for d in ranked if score(d) > 0][:k]

cases = [
    ("refund receipt", "shop-a", {"returns-v2"}),
    ("點樣退款？", "shop-a", {"returns-v2"}),
    ("shipping", "shop-a", {"delivery-v1"}),
    ("refund and delivery", "shop-a", {"returns-v2", "delivery-v1"}),
]
recalls = []
for query, tenant, relevant in cases:
    found = set(search(query, tenant))
    recalls.append(len(found & relevant) / len(relevant))
    assert not found & {"returns-v1", "private-v1"}
assert sum(recalls) / len(recalls) == 1.0
assert search("refund", "unknown-tenant") == []
assert search("What is the weather?", "shop-a") == []
print("retrieval: Recall@2=1.00 on 4 toy cases; 2 empty-result checks passed")
print("This does not measure answer accuracy or real multilingual retrieval quality.")`,
  evaluation: `# Synthetic validation data, not a trained model or a final test result.
def metrics(labels, scores, threshold):
    if not labels or len(labels) != len(scores):
        raise ValueError("nonempty, paired observations required")
    if any(y not in (0, 1) for y in labels):
        raise ValueError("binary labels required")
    tp = fp = fn = tn = 0
    for truth, score in zip(labels, scores):
        predicted = score >= threshold
        if predicted and truth == 1: tp += 1
        elif predicted: fp += 1
        elif truth == 1: fn += 1
        else: tn += 1
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {"tp": tp, "fp": fp, "fn": fn, "tn": tn,
            "precision": precision, "recall": recall, "f1": f1}

labels, scores = [1, 1, 0, 0], [0.9, 0.4, 0.6, 0.1]
strict = metrics(labels, scores, 0.5)
assert strict == {"tp": 1, "fp": 1, "fn": 1, "tn": 1,
                  "precision": 0.5, "recall": 0.5, "f1": 0.5}
loose = metrics(labels, scores, 0.3)
assert loose["recall"] == 1.0 and abs(loose["f1"] - 0.8) < 1e-9
assert metrics([0, 0], [0.1, 0.2], 0.5)["f1"] == 0.0

def check_groups(train, validation, test):
    if train & validation or train & test or validation & test:
        raise ValueError("customer leakage between splits")

check_groups({"c1", "c2"}, {"c3"}, {"c4"})
try:
    check_groups({"c1", "c2"}, {"c2"}, {"c4"})
except ValueError:
    pass
else:
    raise AssertionError("missed leakage")
print("evaluation: threshold, zero-division and customer-leakage checks passed")`,
  agent: `# In-memory state machine with a scripted model and synthetic orders.
# No refunds, messages or external actions are performed.
orders = {"HK-1": {"owner": "alice", "version": 1}}
approvals = {}  # Trusted reviewer channel, never filled from model output.
executed = {}   # Local demonstration; not durable across process restarts.

def action_key(user, proposal):
    if (not isinstance(proposal, dict) or set(proposal) != {"tool", "order_id", "version"}
            or proposal["tool"] != "draft_case"
            or not isinstance(proposal["order_id"], str)
            or type(proposal["version"]) is not int):
        raise ValueError("tool contract denied")
    order = orders.get(proposal["order_id"])
    if not order or order["owner"] != user or order["version"] != proposal["version"]:
        raise PermissionError("ownership or version changed")
    return (user, proposal["tool"], proposal["order_id"], proposal["version"])

def run(scripted_proposals, user):
    for step, proposal in enumerate(scripted_proposals):
        if step >= 3:
            return "budget_exhausted"
        if proposal is None:  # scripted model asks for another reasoning step
            continue
        try:
            key = action_key(user, proposal)
        except (ValueError, PermissionError):
            return "denied"
        if approvals.get(key) != "approved":
            return "awaiting_approval"
        if key not in executed:
            executed[key] = {"case_id": f"CASE-{len(executed) + 1}"}
        return executed[key]["case_id"]
    return "handoff"

p = {"tool": "draft_case", "order_id": "HK-1", "version": 1}
assert run([p], "alice") == "awaiting_approval"
assert run([{**p, "approved": True}], "alice") == "denied"
assert run([p], "bob") == "denied"
assert run([{**p, "tool": "refund"}], "alice") == "denied"
assert run([None] * 4, "alice") == "budget_exhausted"
assert run([], "alice") == "handoff"
approvals[action_key("alice", p)] = "approved"  # simulated trusted reviewer
assert run([p], "alice") == run([p], "alice") == "CASE-1"
assert len(executed) == 1
orders["HK-1"]["version"] = 2
assert run([p], "alice") == "denied"
print("agent: approval, forgery, ownership, budget, replay and stale-state checks passed")`,
};
