# LangGraph checkpoints and AsyncPostgresSaver / LangGraph checkpoints 及 AsyncPostgresSaver

Open `/finance-project/checkpoints` for the bilingual mind map, stateful restart/recovery demo and two workflow diagrams. The browser demo makes zero external calls. Python syntax is checked; live PostgreSQL execution for this tutorial is NOT RUN.

打開 `/finance-project/checkpoints` 看雙語心智圖、可操作重啟／恢復示範及兩份流程圖。瀏覽器沒有外部呼叫；Python 已檢查語法，真實 PostgreSQL 教學執行為 NOT RUN。

## LangGraph = the workflow runner / LangGraph＝流程執行器

Your Python research service runs scope → n8n refresh → snapshot → search/rank → review → evidence checks → report. Nodes read state and return updates; code owns the routes. LangGraph is not the LLM, the news provider or the database.

Python 研究服務執行 scope → n8n 刷新 → 快照 → 搜尋／排序 → 覆核 → 證據檢查 → 報告。節點讀狀態再回傳更新，程式決定路徑。LangGraph 不是 LLM、新聞供應商或資料庫。

## AsyncPostgresSaver = the persistence adapter / AsyncPostgresSaver＝持久保存介面

Compile the graph with checkpointer=saver. LangGraph asks this saver to store/load checkpoints and pending writes in PostgreSQL. Async means database I/O can be awaited without blocking the Python event loop; it does not automatically make graph nodes parallel or remove database latency.

編譯 graph 時傳 checkpointer=saver。LangGraph 經 saver 在 PostgreSQL 存取 checkpoints 及 pending writes。Async 代表資料庫 I/O 可 await，不阻塞 Python event loop；不代表節點自動並行，亦不消除資料庫延遲。

## Checkpoint = one saved progress record / Checkpoint＝一份已存進度

A checkpointer records progress at graph super-step boundaries. The readable StateSnapshot view includes values, next nodes, config and tasks. In this sequential teaching graph, a completed node is usually a step. A checkpoint does not save arbitrary Python local variables or the exact CPU instruction where a process died.

Checkpointer 在 graph super-step 邊界保存進度；可讀的 StateSnapshot 包含 values、下一節點、config 及 tasks。此教學為順序 graph，一個完成節點通常是一個 step。Checkpoint 不保存任意 Python 區域變數，亦不記錄程序死亡時的 CPU 指令。

## thread_id finds the right saved run / thread_id 找回正確任務

Your app maps its business run_id to a server-owned thread_id. checkpoint_id identifies a particular saved version; checkpoint_ns separates root/subgraph namespaces. For ordinary continuation, use the same thread and latest checkpoint. The API must authenticate the owner; knowing a thread ID is not permission to resume it.

App 把業務 run_id 對應到伺服器建立的 thread_id。checkpoint_id 識別某份保存版本，checkpoint_ns 分開主 graph／子 graph。一般恢復用同一 thread 的最新 checkpoint；API 仍須驗證擁有者，知道 ID 不代表有權恢復。

## News snapshot and checkpoint are different / 新聞快照與 checkpoint 不同

snapshot_id pins the exact news/profile/quote versions and retrieval view for a report. A checkpoint references that snapshot and records query results, selected IDs/order, counters and remaining budget. A run can have many checkpoints that all reference the same evidence snapshot. New checkpoints do not fetch newer news.

snapshot_id 固定報告的新聞／背景／價格版本及檢索視圖。Checkpoint 引用快照，記錄查詢結果、所選 ID／次序、計數及預算餘額。同一任務可有多份 checkpoint 都引用相同證據快照；新 checkpoint 不會抓新新聞。

## What does _checkpoint mean? / _checkpoint 是甚麼？

The official concepts here are checkpoint and checkpointer. _checkpoint by itself is not a separate public LangGraph component; an example may use that spelling for a local/internal variable or helper. This project uses checkpointer=saver and a separate research_checkpoints database. The library owns its table schema; do not invent a mandatory table called _checkpoint.

官方概念是 checkpoint 及 checkpointer；單獨 _checkpoint 不是另一個公開 LangGraph 元件，範例可用這名稱作區域／內部變數或 helper。本項目用 checkpointer=saver 及獨立 research_checkpoints 資料庫，資料表 schema 由套件管理，並非必須自建 _checkpoint 表。

## At startup: attach the saver / 啟動時：接上 saver

Initialize the checkpoint tables with await saver.setup() in a controlled migration/setup step. Keep AsyncPostgresSaver open for the Python application lifespan and compile the graph with it. The website and n8n do not instantiate this Python saver.

受控 migration／setup 步驟用 await saver.setup() 建立所需表；Python app 生命週期保持 AsyncPostgresSaver 開啟並用它編譯 graph。網站及 n8n 不建立此 Python saver。

## After news and ranking: preserve completed work / 新聞及排序後：保存已完成工作

Save the n8n receipt reference, fixed snapshot ID, ranked candidates and search counter. If later work fails after these checkpoints were durably written, recovery can reuse the completed stages. Use durability="sync" when the next step must not start before its checkpoint write finishes; async saver I/O and graph durability="async" are different choices.

保存 n8n 收據引用、固定 snapshot ID、排序候選及搜尋次數。後續失敗時，只要這些 checkpoint 已持久寫入，便可重用完成階段。若下一步必須等 checkpoint 寫完才開始，選 durability="sync"；async saver I/O 與 graph durability="async" 是不同選擇。

## At evidence review: pause and resume / 證據覆核：暫停及恢復

Place interrupt() in a dedicated review node after retrieval. Persist state, let the user exclude/reorder/highlight news, authenticate and validate the selection, then resume with Command(resume=...) on the same thread. The interrupted node starts again from its beginning; keep provider fetching and other expensive side effects outside it.

檢索後在獨立 review 節點呼叫 interrupt()。保存狀態，讓用戶排除／排序／標記，驗證身分及選取後以同一 thread 的 Command(resume=...) 恢復。中斷節點從頭重跑，抓取供應商等昂貴副作用須放節點外。

## After a failure: continue unfinished work / 失敗後：繼續未完成工作

For a recoverable failed run, load its latest authorized checkpoint and continue with ainvoke(None, config). An interrupt waiting for a decision needs Command(resume=...), not None as the decision. Reuse original evidence, counters and the remaining active budget. Only intentional review wait pauses the proposed 60s processing clock; the first-pause 15-minute review expiry never extends.

可恢復失敗任務載入最新已授權 checkpoint，以 ainvoke(None, config) 繼續；等待決定的 interrupt 則須 Command(resume=...)，不能以 None 當決定。沿用原證據、計數及處理餘額；只有刻意覆核等待暫停建議 60 秒處理計時，首次暫停起 15 分鐘覆核期不延長。

## The saver does not make n8n exactly-once / Saver 不保證 n8n 只執行一次

n8n may commit evidence before the graph records the returned receipt. A crash in that gap means the refresh node can run again. Stable run keys, atomic acquisition claims and receipt reconciliation prevent another provider fetch. Checkpoint writes and business-data writes are not automatically one transaction. Provider retries stay inside n8n.

n8n 可先提交證據，graph 才記錄收據；兩者之間故障，refresh 節點可能重跑。固定任務鍵、原子抓取 claim 及核對收據才可避免再抓供應商。Checkpoint 與業務資料寫入不會自動變同一 transaction；供應商重試仍在 n8n。

## Keep storage responsibilities separate / 儲存職責分開

research stores news, embeddings, selections and reports; research_checkpoints stores graph execution state; n8n_metadata stores workflow/execution settings. Long-term user memory is another application design, not automatically supplied by a checkpointer. Store serializable state and stable IDs, not live MCP sessions, connections or credentials. Live PostgreSQL recovery checks for this finance app remain NOT RUN.

research 存新聞、向量、選取及報告；research_checkpoints 存 graph 執行狀態；n8n_metadata 存流程／執行設定。長期用戶記憶要另行設計，checkpointer 不會自動提供。狀態存可序列化資料及穩定 ID，不存 MCP session、連線或憑證；此金融 app 的真實 PostgreSQL 恢復檢查仍為 NOT RUN。

## Try the scenarios / 試情境

### Saved review survives restart / 已存覆核可在重啟後恢復

Play to the review, simulate an app restart, recover the saved run, then submit a selection. Watch the fetch count stay at one.

播放至覆核，模擬 app 重啟，找回保存任務後提交選取；留意抓取次數仍是一。

### Without a durable saver / 沒有持久 saver

Reach review and restart. This comparison keeps no durable graph state, so its recovery button cannot reconstruct the run.

到覆核後重啟。此比較沒有持久 graph 狀態，恢復按鈕不能重建任務。

### Crash before receipt checkpoint / 收據 checkpoint 前故障

The provider result commits, then the app crashes before checkpointing it. Recover and step again: receipt reconciliation prevents a second fetch.

供應商結果已提交，但 app 在記錄 checkpoint 前故障。恢復再前進，核對原收據可避免第二次抓取。

### Expired review cannot resume / 過期覆核不能恢復

Reach review, expire its window, then try submitting. The checkpoint still exists for audit, but generation stays blocked.

到覆核後令期限過期，再嘗試提交；checkpoint 仍保留供核對，但不能生成。

## Diagrams / 圖解

[Architecture SVG](finance-diagrams/checkpoint_architecture-en.svg) · [Recovery SVG](finance-diagrams/checkpoint_recovery-en.svg)

## Standalone Python tutorial / 獨立 Python 教學

```sh
# Standalone tutorial only. Provision a separate private PostgreSQL database first.
# Install reviewed versions in a dedicated Python 3.11+ virtual environment:
python -m pip install langgraph langgraph-checkpoint-postgres "psycopg[binary]"
# Record/pin the tested versions before adapting this to your finance service.
# Set CHECKPOINT_DEMO_DATABASE_URL privately; do not paste credentials into the browser.

python stock-research-checkpoint-demo.py setup
python stock-research-checkpoint-demo.py start --thread tutorial-msft-001
# Expected: next includes review, with fictional ranked IDs; program exits at interrupt.
python stock-research-checkpoint-demo.py inspect --thread tutorial-msft-001
# A NEW Python process loads the same saved thread:
python stock-research-checkpoint-demo.py resume --thread tutorial-msft-001 --order costs-v2 demand-v1
# Expected: next is empty; result contains the chosen source order. No LLM call.
python stock-research-checkpoint-demo.py inspect --thread tutorial-msft-001
# recover is for unfinished failure recovery, not a pending review decision:
python stock-research-checkpoint-demo.py recover --thread tutorial-msft-001
```

```python
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

```

## References / 參考

- [LangGraph checkpointers and durability modes](https://docs.langchain.com/oss/python/langgraph/checkpointers)

- [AsyncPostgresSaver package and connection setup](https://pypi.org/project/langgraph-checkpoint-postgres/)

- [Interrupt and resume semantics](https://docs.langchain.com/oss/python/langgraph/interrupts)

- [Fault tolerance and side-effect boundaries](https://docs.langchain.com/oss/python/langgraph/fault-tolerance)
