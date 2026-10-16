# Interactive concept animations

Added on 16 October 2026 to `/junior-path#concept-studio`. The studio appears before the reading sections. Each lesson links to its matching simulation, and the studio opens the corresponding lesson and code.

| Experiment | Animated behavior | Controls |
|---|---|---|
| Python | JSON becomes validated records, normalized strings and one count | Valid records, wrong type, malformed JSON |
| API access | Identity and order ID pass through a scoped query; allowed rows highlight | Own order, other owner's order, no identity |
| Model output | Gates reject or accept a reply before it becomes a proposal | Valid proposal, refusal, malformed JSON, forged approval |
| Retrieval | Documents are filtered, reordered and selected; recall updates | Bilingual/no-match queries and top-k |
| Evaluation | Labeled cases move from the score axis into confusion cells; metric bars update | Threshold presets and keyboard-accessible slider |
| Agent workflow | Approval stops progression; replay reuses the existing ledger entry | Explicit simulated approval, forbidden proposal, replay |

Play advances every 2.2 seconds and stops at the end, a rejection, or approval boundary. Pause, previous, next, reset and direct stage selection are available. Playback stops when the studio leaves view or the page is hidden. Reduced motion follows the operating system; the manual preference persists across concept changes for the current page session. No automatic playback on page load.

These are synthetic local simulations. They do not call models, authenticate users, run a SQL server, issue refunds or provide durable production state. The linked Python lessons contain the runnable programs. Retrieval is a tag-matching baseline, and the four evaluation cases are validation examples.

Verification:

- TypeScript, ESLint, 27 tests and the production build pass.
- Browser playback reached the Python count; wrong types stopped at validation, other-owner queries returned 404, and forged model approval returned handoff.
- Retrieval changed from Recall@1 50% to Recall@2 100% on the two-document fixture.
- At threshold 0.50, precision/recall/F1 were 50%/50%/50%; at 0.30 they were 67%/100%/80%. The slider accepts keyboard input.
- Agent execution was blocked before approval. Replay retained one write and reused CASE-1.
- All six scenes fit 320px in English and Traditional Chinese without page-level overflow; 390px and desktop were also inspected.
- Reduced motion persisted across all six scenes. Links worked in both directions between lessons and animations.
- No publishing or deployment was performed.

Implementation: `app/concept-studio.tsx`, `app/concept-studio.css`, `lib/junior-simulations.ts`. Behavioral checks: `tests/simulations.test.ts`.
