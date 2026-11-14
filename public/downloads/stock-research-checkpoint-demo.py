"""Single-user checkpoint tutorial, separate from the proposed finance backend.
Requires Python 3.11+, LangGraph, langgraph-checkpoint-postgres, psycopg[binary].
Use a private, disposable tutorial database, never a production database.
The academy checks syntax; live PostgreSQL execution is NOT RUN.
"""
import argparse
import asyncio
import json
import os
from typing import TypedDict

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, interrupt

class State(TypedDict, total=False):
    company: str
    snapshot_id: str
    ranked_ids: list[str]
    selected_ids: list[str]
    result: str

async def prepare_fixture(state: State):
    # Fictional data: no Yahoo, Alpha Vantage, n8n, embeddings or LLM call.
    return {"snapshot_id": "fictional-snapshot-v1",
            "ranked_ids": ["demand-v1", "costs-v2"]}

def review(state: State):
    # This node starts again from the beginning on resume.
    # Do not fetch news, charge a budget or commit other side effects here.
    decision = interrupt({"question": "Choose ordered source IDs",
                          "allowed_ids": state["ranked_ids"],
                          "snapshot_id": state["snapshot_id"]})
    if not isinstance(decision, dict):
        raise ValueError("Expected a decision object")
    selected = decision.get("ordered_ids")
    if not isinstance(selected, list) or not selected:
        raise ValueError("Choose at least one source")
    if not all(isinstance(item, str) for item in selected):
        raise ValueError("Source IDs must be strings")
    if len(selected) != len(set(selected)) or not set(selected) <= set(state["ranked_ids"]):
        raise ValueError("Invalid or duplicate source IDs")
    return {"selected_ids": selected}

async def finish(state: State):
    # A selection receipt, not a financial report or evidence-support checker.
    return {"result": "Fictional selection recorded: " + ", ".join(state["selected_ids"])}

def build_graph(saver):
    builder = StateGraph(State)
    builder.add_node("prepare_fixture", prepare_fixture)
    builder.add_node("review", review)
    builder.add_node("finish", finish)
    builder.add_edge(START, "prepare_fixture")
    builder.add_edge("prepare_fixture", "review")
    builder.add_edge("review", "finish")
    builder.add_edge("finish", END)
    return builder.compile(checkpointer=saver)

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["setup", "start", "inspect", "resume", "recover"])
    parser.add_argument("--thread", default="tutorial-msft-001")
    parser.add_argument("--order", nargs="+", default=["costs-v2", "demand-v1"])
    args = parser.parse_args()
    database_url = os.environ.get("CHECKPOINT_DEMO_DATABASE_URL")
    if not database_url:
        raise SystemExit("Set private CHECKPOINT_DEMO_DATABASE_URL first")
    # Real finance API: authenticate owner and resolve this thread on the server.
    # This single-user CLI is not an authenticated, multi-user API.
    config = {"configurable": {"thread_id": args.thread}}
    async with AsyncPostgresSaver.from_conn_string(database_url) as saver:
        if args.action == "setup":
            await saver.setup()  # Controlled, one-time setup; not per request.
            print("Tutorial checkpoint tables ready")
            return
        graph = build_graph(saver)
        current = await graph.aget_state(config)
        waiting = any(task.interrupts for task in current.tasks)
        if args.action == "start":
            if current.values:
                raise SystemExit("Thread exists; inspect/resume it or use a NEW tutorial thread")
            await graph.ainvoke({"company": "MSFT"}, config, durability="sync")
        elif args.action == "resume":
            if not waiting:
                raise SystemExit("No pending review; inspect the thread first")
            allowed = set(current.values.get("ranked_ids", []))
            if len(args.order) != len(set(args.order)) or not set(args.order) <= allowed:
                raise SystemExit("Invalid selection; checkpoint was not advanced")
            await graph.ainvoke(Command(resume={"ordered_ids": args.order}),
                                config, durability="sync")
        elif args.action == "recover":
            if not current.values:
                raise SystemExit("No saved run")
            if waiting:
                raise SystemExit("Pending review needs the resume command, not recover")
            if current.next:
                await graph.ainvoke(None, config, durability="sync")
        saved = await graph.aget_state(config)
        print(json.dumps({"values": saved.values, "next": saved.next,
                          "config": saved.config}, indent=2, default=str))
        if args.action == "inspect":
            async for item in graph.aget_state_history(config):
                print("HISTORY", item.config["configurable"].get("checkpoint_id"), item.next)

if __name__ == "__main__":
    asyncio.run(main())
