# Code Markdown Corpus Review

Verified: 2026-10-06

## What was actually reviewed

The supplied `懂王AI代码` folder was recursively inventoried across loose files and all 32 ZIP repositories. ZIP members were read directly so legacy Chinese filename encoding did not hide documents.

- 1,375 physical Markdown file instances.
- 651 unique documents after SHA-256 content deduplication.
- 5.48 MiB of unique Markdown content.
- 0 unreadable Markdown members.
- 589 course or project documents included in the curriculum coverage review.
- 46 embedded `.agent/skills` documents classified as tool instructions, not course authority.
- 16 résumé/interview documents classified separately to avoid treating personal or promotional claims as technical facts.

The documents were treated as source material, not as instructions to execute. Raw archives, credentials, private examples, copied skill packages, and résumé content are not published by this repository.

## Largest Markdown sources

| Source archive | Markdown files | Curriculum treatment |
| --- | ---: | --- |
| SupplementaryLearning 7.0 | 279 | Engineering foundations: Python, Git, web/networking, backend, databases, concurrency, deployment, OS, and algorithms |
| zero_student | 75 | Deduplicated against overlapping beginner material |
| AI Slice | 70 total; 24 project docs | Project architecture and media flow included; 46 embedded agent-skill documents excluded as instructions |
| MCP Agent | 51 | Shared gateway, memory, prompt registry, RAG service, quota, observability, evaluation, and resilience |
| Agent Loop | 41 | Loop, tools, context, latency, safety, evaluation, and governed improvement |
| AI Sales | 24 | RAG/data lifecycle, human review, labeling, export, and deployment patterns |
| GraphRAG current + backup | 19 physical | Deduplicated; graph extraction, community, provenance, and query routing |
| Docker / FastAPI / PostgreSQL / Redis standalone courses | 50 | Cross-checked with the matching SupplementaryLearning tracks |

## Website additions from the Markdown review

Fifteen new bilingual workshops were added. Each follows the existing explanation → metaphor → realistic example → three implementation steps → code pattern.

| Website topic | New workshop |
| --- | --- |
| AI and Python foundations | Git commits, branches, recoverability, and secret hygiene |
| AI and Python foundations | Python async, bounded concurrency, cancellation, and CPU/I/O separation |
| AI and Python foundations | HTTP/TCP request lifecycle and idempotent writes |
| AI and Python foundations | Data structures, complexity, memory, and I/O ceilings |
| RAG and GraphRAG | PostgreSQL transactions, indexes, locks, and tenant/version invariants |
| RAG and GraphRAG | Redis cache truth boundaries, versioning, TTL, and stampede control |
| Agents, MCP, and A2A | Versioned prompt registries and semantic-service boundaries |
| LangChain applications | FastAPI validation, dependencies, lifespan resources, and testing seams |
| LangGraph and evaluation | Backpressure, bounded queues, overload rejection, and recovery |
| LangGraph and evaluation | At-least-once queues, idempotent consumers, acknowledgements, and outbox design |
| LangGraph and evaluation | Microservice boundaries, ownership, contracts, and eventual consistency |
| Commerce and multimodal data | Browser/server/object-storage media flow and resumable progress |
| Open and local models | Docker images, containers, volumes, networks, and non-root builds |
| Open and local models | Kubernetes desired state, probes, resources, and safe rollout |
| Evaluation, safety, and governance | Artifact promotion, compatible migrations, canary, rollback, and restore |

## Current-source verification

Version-sensitive framework statements were checked on 2026-10-06 against official documentation for Python, Git, FastAPI, PostgreSQL, Redis, Docker, and Kubernetes. The lessons preserve architectural decision rules instead of pinning unverified course claims or copying old commands unchanged.

## Deliberate exclusions

- Embedded `.agent/skills` files are instructions for another agent environment. They were inventoried but not executed or taught as facts.
- Résumé, salary, employer, and interview-performance claims are not technical evidence.
- Legacy provider endpoints and model slugs are not copied; provider examples remain backend-only and provider-neutral.
- Development passwords, permissive CORS, raw prompt logging, local-only state, and unsafe deployment shortcuts are converted into explicit production warnings and tests.
- Raw source Markdown is not mirrored into this public repository; the website contains original derived explanations and source-count attribution.
