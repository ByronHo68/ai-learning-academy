import copy
import math
import tempfile
import unittest
from pathlib import Path

from evaluate import (HERE, citation_precision, load_frozen, metrics,
                      retrieval_margin_passes, score, sparse_rankings)


class FinanceEvaluationTests(unittest.TestCase):
    def test_hand_calculated_recall_and_graded_ndcg(self):
        values = metrics(['b', 'irrelevant', 'a'], {'a': 2, 'b': 1}, 2)
        self.assertEqual(values['recall'], 0.5)
        self.assertAlmostEqual(values['ndcg'], 1 / (3 + 1 / math.log2(3)))
        self.assertEqual(metrics([], {'a': 2}, 10), {'recall': 0, 'ndcg': 0})

    def test_empty_qrels_and_zero_citations_are_not_perfect(self):
        self.assertEqual(metrics([], {}, 10), {'recall': None, 'ndcg': None})
        self.assertIsNone(citation_precision(0, 0))
        self.assertEqual(citation_precision(19, 20), 0.95)
        with self.assertRaises(ValueError):
            citation_precision(2, 1)
        with self.assertRaises(ValueError):
            metrics(['a', 'a'], {'a': 2}, 10)

    def test_real_sparse_query_filters_company_future_and_late_ingestion(self):
        golden, _, _, _ = load_frozen()
        ranks = sparse_rankings(golden)
        for case, ids in ranks.items():
            self.assertTrue(all(key.startswith(case[:4]) for key in ids))
            self.assertFalse(any(key.endswith(('-future', '-late', '-past')) for key in ids))
        result = score(golden, ranks)
        self.assertEqual(result['unanswerable_count'], 3)
        self.assertEqual(result['empty_results_on_unanswerable'], 3)
        self.assertIn('MSFT-costs', ranks['MSFT-paraphrase'])

    def test_candidate_cannot_hide_cases_or_use_disallowed_sources(self):
        golden, _, _, _ = load_frozen()
        ranks = sparse_rankings(golden)
        for bad in ['AAPL-costs', 'MSFT-future', 'MSFT-late', 'unknown']:
            altered = {**ranks, 'MSFT-margin': [bad]}
            with self.assertRaises(ValueError):
                score(golden, altered)
        del ranks['MSFT-margin']
        with self.assertRaises(ValueError):
            score(golden, ranks)

    def test_written_margin_and_company_regression_block_candidate(self):
        _, _, policy, _ = load_frozen()
        baseline = {'macro': {'recall@10': 0.80, 'ndcg@10': 0.80},
                    'by_company': {'MSFT': {'recall@10': 0.80, 'ndcg@10': 0.80}}}
        self.assertFalse(retrieval_margin_passes(baseline, baseline, policy))
        better = copy.deepcopy(baseline)
        better['macro']['recall@10'] += 0.03
        better['macro']['ndcg@10'] += 0.05
        self.assertTrue(retrieval_margin_passes(baseline, better, policy))
        better['by_company']['MSFT']['ndcg@10'] -= 0.01
        self.assertFalse(retrieval_margin_passes(baseline, better, policy))

    def test_frozen_data_cannot_drift_without_manifest_change(self):
        with tempfile.TemporaryDirectory() as path:
            directory = Path(path)
            for name in ('golden.json', 'injections.json', 'policy.json', 'manifest.json'):
                (directory / name).write_bytes((HERE / name).read_bytes())
            with (directory / 'golden.json').open('a') as file:
                file.write(' ')
            with self.assertRaisesRegex(ValueError, 'Frozen fixture changed'):
                load_frozen(directory)


if __name__ == '__main__':
    unittest.main()
