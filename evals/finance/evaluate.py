"""Reproduce the synthetic sparse baseline; score imported candidate rankings honestly."""
import argparse
import hashlib
import json
import math
import re
import sqlite3
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent


def load_frozen(directory=HERE):
    manifest = json.loads((directory / 'manifest.json').read_text())
    for name in ('golden.json', 'injections.json', 'policy.json'):
        digest = hashlib.sha256((directory / name).read_bytes()).hexdigest()
        if digest != manifest['sha256'][name]:
            raise ValueError(f'Frozen fixture changed: {name}; create and review a new version.')
    return tuple(json.loads((directory / name).read_text()) for name in
                 ('golden.json', 'injections.json', 'policy.json')) + (manifest,)


def metrics(ranked, relevance, k):
    if len(set(ranked)) != len(ranked):
        raise ValueError('Duplicate ranked IDs inflate retrieval metrics.')
    relevant = {key for key, grade in relevance.items() if grade > 0}
    if not relevant:
        return {'recall': None, 'ndcg': None}
    recall = len(set(ranked[:k]) & relevant) / len(relevant)
    dcg = sum((2 ** relevance.get(key, 0) - 1) / math.log2(index + 2)
              for index, key in enumerate(ranked[:k]))
    ideal = sum((2 ** grade - 1) / math.log2(index + 2)
                for index, grade in enumerate(sorted(relevance.values(), reverse=True)[:k]))
    return {'recall': recall, 'ndcg': dcg / ideal}


def citation_precision(supported_pairs, emitted_pairs):
    if not 0 <= supported_pairs <= emitted_pairs:
        raise ValueError('Supported citation pairs must be between zero and all emitted pairs.')
    return supported_pairs / emitted_pairs if emitted_pairs else None


def allowed(doc, case):
    return (doc['company'] == case['company']
            and case['published_after'] <= doc['published_at'] <= case['as_of']
            and doc['first_seen_at'] <= case['as_of'])


def sparse_rankings(golden):
    with sqlite3.connect(':memory:') as db:
        db.execute('CREATE VIRTUAL TABLE evidence USING fts5(id UNINDEXED, company UNINDEXED, '
                   'published_at UNINDEXED, first_seen_at UNINDEXED, text)')
        db.executemany('INSERT INTO evidence VALUES (?, ?, ?, ?, ?)',
                       [(d['id'], d['company'], d['published_at'], d['first_seen_at'], d['text'])
                        for d in golden['documents']])
        result = {}
        for case in golden['cases']:
            terms = re.findall(r'\w+', case['query'], flags=re.UNICODE)
            query = ' OR '.join('"' + word + '"' for word in terms)
            result[case['id']] = [row[0] for row in db.execute(
                'SELECT id FROM evidence WHERE evidence MATCH ? AND company = ? '
                'AND published_at >= ? AND published_at <= ? AND first_seen_at <= ? '
                'ORDER BY bm25(evidence), id LIMIT 10',
                (query, case['company'], case['published_after'], case['as_of'], case['as_of']))]
        return result


def score(golden, rankings):
    cases = golden['cases']
    if not isinstance(rankings, dict) or set(rankings) != {case['id'] for case in cases}:
        raise ValueError('Rankings must contain every frozen case exactly once.')
    documents = {d['id']: d for d in golden['documents']}
    rows = []
    for case in cases:
        ranked = rankings[case['id']]
        if not isinstance(ranked, list) or not all(isinstance(key, str) for key in ranked):
            raise ValueError('Rankings must be lists of document IDs.')
        if any(key not in documents or not allowed(documents[key], case) for key in ranked):
            raise ValueError(f'Unknown or disallowed source for {case["id"]}.')
        row = {'case': case['id'], 'company': case['company'], 'ranked': ranked,
               'answerable': bool(case['relevance'])}
        for k in (5, 10):
            values = metrics(ranked, case['relevance'], k)
            row.update({f'{metric}@{k}': value for metric, value in values.items()})
        rows.append(row)
    keys = ['recall@5', 'ndcg@5', 'recall@10', 'ndcg@10']

    def averages(subset):
        answered = [row for row in subset if row['answerable']]
        return {key: sum(row[key] for row in answered) / len(answered) for key in keys}

    return {'macro': averages(rows), 'by_company': {
        company: averages([row for row in rows if row['company'] == company])
        for company in sorted({row['company'] for row in rows})}, 'cases': rows,
        'empty_results_on_unanswerable': sum(not row['ranked'] for row in rows if not row['answerable']),
        'unanswerable_count': sum(not row['answerable'] for row in rows)}


def retrieval_margin_passes(baseline, candidate, policy):
    for key, margin in [('recall@10', policy['recall10_absolute_gain']),
                        ('ndcg@10', policy['ndcg10_absolute_gain'])]:
        if candidate['macro'][key] - baseline['macro'][key] + 1e-12 < margin:
            return False
        if any(candidate['by_company'][company][key] + 1e-12 < values[key]
               for company, values in baseline['by_company'].items()):
            return False
    return True


def report(golden, injections, policy, manifest, baseline, candidates):
    def fmt(value):
        return f'{value:.4f}'

    lines = [
        '# Stock research evaluation report card', '',
        'Status: synthetic harness executed; live integrations NOT RUN; hybrid admission BLOCKED.', '',
        '這是虛構資料的本機工具驗證；真實服務未執行，混合檢索未獲准入。', '',
        f'Dataset: `{golden["version"]}`. {len(golden["documents"])} fictional excerpts, '
        f'{len(golden["cases"])} prompts (15 answerable, 3 unanswerable); three tickers. '
        'Labels are authored fixtures, not independent expert judgments. No real market claims.', '',
        'Executed: Python standard-library SQLite FTS5/BM25 over the frozen corpus, company and '
        'publication/first-seen filters, and the metric calculator. No embedding, reranker, LLM, '
        'n8n, Langfuse or LangSmith service is executed by this command. Imported candidate rankings '
        'are scored as supplied, not independently reproduced vector searches.', '',
        'Reproduce from the repository root: `python3 evals/finance/evaluate.py --check`. '
        'Generate: `npm run finance:eval`. Tests: `npm run finance:eval:test`.', '',
        '| Configuration | recall@5 | nDCG@5 | recall@10 | nDCG@10 |',
        '| --- | ---: | ---: | ---: | ---: |',
    ]
    for name, result in [('Sparse BM25 (executed)', baseline),
                         ('Hybrid (imported)', candidates.get('hybrid')),
                         ('Hybrid + rerank (imported)', candidates.get('hybrid_rerank'))]:
        values = ' | '.join(fmt(result['macro'][key]) for key in
                            ['recall@5', 'ndcg@5', 'recall@10', 'ndcg@10']) if result else 'NOT RUN | NOT RUN | NOT RUN | NOT RUN'
        lines.append(f'| {name} | {values} |')
    lines += ['', 'Macro means over the 15 answerable cases only. Recall counts relevant IDs with grade >0; '
              'nDCG uses gain 2^grade−1 and log2(rank+1). Empty qrels have undefined recall/nDCG and are '
              'reported separately. A zero-hit answerable query scores zero; duplicate/unknown/disallowed IDs are rejected.', '',
              f'Sparse returned empty evidence on {baseline["empty_results_on_unanswerable"]}/'
              f'{baseline["unanswerable_count"]} unanswerable cases. This measures retrieval, not model abstention.', '',
              '| Outstanding acceptance evidence | Result |', '| --- | --- |',
              '| Citation-precision and material factual-claim coverage | NOT RUN: no generated answers or independent claim judgments |',
              '| End-to-end model abstention | NOT RUN |',
              f'| Live prompt-injection suite ({len(injections["fixtures"])} fixtures) | NOT RUN: fixtures provided, agent absent |',
              '| n8n MCP per-prompt refresh and recovery | NOT RUN: no endpoint configured |',
              '| OTel → self-hosted Langfuse + LangSmith | NOT RUN: no backends connected |',
              '| Actual provider input/output tokens | NOT RUN; unknown, not a fabricated estimate |',
              '| Live p50/p95 latency | NOT RUN: requires ≥30 completed runs, failures and timeouts reported separately |',
              '| Shareable trace URL for each demo run | NOT AVAILABLE: no live demo run yet |', '',
              '## Admission policy', '',
              f'Require absolute gains ≥{policy["recall10_absolute_gain"]:.2f} recall@10 and '
              f'≥{policy["ndcg10_absolute_gain"]:.2f} nDCG@10 over sparse, no regression by company, '
              f'citation-precision ≥{policy["citation_precision_min"]:.2f} and no drop from sparse, '
              '100% material factual-claim citation coverage, correct abstention and the live safety/trace gates. '
              'Citation-precision is supported claim–source pairs / all emitted pairs; zero pairs is N/A. '
              'Support must be judged against the excerpt, not URL membership.', '',
              'Production admission: **BLOCKED**. This synthetic starter cannot authorize production even if a '
              'candidate passes the numerical margins. Add the independently reviewed, licensed real-news '
              'holdout and actual live safety/trace evidence. Keep sparse active. The application runtime '
              'enforcement remains part of the proposed backend; this harness cannot configure a live index.', '',
              '## Per-case sparse results', '',
              '| Case | recall@10 | nDCG@10 | Returned IDs |', '| --- | ---: | ---: | --- |']
    for row in baseline['cases']:
        lines.append(f'| {row["case"]} | {fmt(row["recall@10"]) if row["answerable"] else "N/A"} | '
                     f'{fmt(row["ndcg@10"]) if row["answerable"] else "N/A"} | {", ".join(row["ranked"]) or "empty"} |')
    for name, candidate in candidates.items():
        lines += ['', f'{name} imported ranking margin: '
                  f'{"PASS" if retrieval_margin_passes(baseline, candidate, policy) else "FAIL"}. '
                  'This is not full admission.']
    lines += ['', '## Frozen SHA-256 manifest', '']
    lines += [f'- `{name}`: `{digest}`' for name, digest in manifest['sha256'].items()]
    lines += ['', '## Limits and next evidence', '',
              'The paraphrase cases intentionally exercise lexical misses. The tiny repetitive corpus and '
              'authored labels make these scores unsuitable for claims about real-news quality or prediction '
              'accuracy. Use separate development data for tuning. Version and review any new labels, '
              'thresholds or corpus; never silently overwrite the frozen test set.', '',
              'Read [the six ADRs and revised requirements](stock-research-review-pack.md) and '
              '[download the frozen fixtures](stock-research-eval-fixtures.json). See `evals/finance/README.md` '
              'for candidate input and live injection execution instructions.', '']
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--candidate', type=Path)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--require-admission', action='store_true')
    args = parser.parse_args()
    if args.candidate and (args.check or not args.output):
        parser.error('Imported candidates require --output and cannot overwrite the canonical --check report.')
    golden, injections, policy, manifest = load_frozen()
    baseline = score(golden, sparse_rankings(golden))
    candidates = {}
    configuration = None
    if args.candidate:
        bundle = json.loads(args.candidate.read_text())
        if bundle['golden_sha256'] != manifest['sha256']['golden.json']:
            raise ValueError('Candidate corpus hash does not match the frozen golden set.')
        if set(bundle['rankings']) != {'hybrid', 'hybrid_rerank'}:
            raise ValueError('Supply both hybrid and hybrid_rerank ablations.')
        if not isinstance(bundle.get('configuration'), dict) or not bundle['configuration']:
            raise ValueError('Record actual model/index/reranker versions in configuration.')
        configuration = bundle['configuration']
        candidates = {name: score(golden, rankings) for name, rankings in bundle['rankings'].items()}
    card = report(golden, injections, policy, manifest, baseline, candidates)
    if configuration is not None:
        card += '\n## Imported candidate configuration\n\n```json\n' + json.dumps(configuration, indent=2) + '\n```\n'
    fixtures = json.dumps({'manifest': manifest, 'golden': golden, 'injections': injections,
                           'policy': policy}, ensure_ascii=False, indent=2) + '\n'
    outputs = [(args.output, card)] if args.output else [
        (ROOT / 'docs/FINANCE_EVAL_REPORT.md', card.replace('](stock-research-', '](../public/downloads/stock-research-')),
        (ROOT / 'public/downloads/stock-research-eval-report.md', card),
        (ROOT / 'public/downloads/stock-research-eval-fixtures.json', fixtures)]
    for target, content in outputs:
        if args.check:
            if target.read_text() != content:
                raise ValueError(f'Stale report: {target}; run npm run finance:eval.')
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content)
    print('Frozen fixtures verified; sparse baseline reproduced. Live checks NOT RUN; hybrid admission BLOCKED.')
    if args.require_admission:
        raise SystemExit('Admission blocked: synthetic data and missing live evidence.')


if __name__ == '__main__':
    main()
