"""Split sanitized YFinance news for an E5 experiment. Prints JSON; makes no DB writes."""

import argparse
from hashlib import sha256
import json
from pathlib import Path

from tokenizers import Tokenizer

MODEL = "intfloat/multilingual-e5-small"
REVISION = "614241f622f53c4eeff9890bdc4f31cfecc418b3"
PREFIX = "passage: "
MAX_INPUT = 512
POLICY = "e5-sentence-window-v1"
PRESETS = (
    {"id": "balanced", "target": 320, "overlap": 48},
    {"id": "no-overlap", "target": 320, "overlap": 0},
    {"id": "small", "target": 240, "overlap": 36},
    {"id": "large", "target": 400, "overlap": 60},
)


def split(tokenizer, body, target, overlap):
    """Use E5 offsets, prefer a nearby paragraph or sentence end, and check each input."""
    offsets = tokenizer.encode(body, add_special_tokens=False).offsets
    if not offsets:
        return []

    def position(i):
        if i == 0:
            return 0
        if i == len(offsets):
            return len(body)
        return offsets[i][0]

    chunks = []
    first = 0
    while first < len(offsets):
        start_char = position(first)
        limit = min(first + target, len(offsets))
        end = limit
        if end < len(offsets):
            minimum = first + max(overlap + 1, int(target * 0.85))
            # Prefer paragraph breaks, then sentence endings in the last 15% of the window.
            for strip, endings in ((" \t", ("\n\n",)), (None, (".", "?", "!", "。", "？", "！"))):
                boundary = next(
                    (i for i in range(limit, minimum - 1, -1)
                     if body[start_char:position(i)].rstrip(strip).endswith(endings)),
                    None,
                )
                if boundary is not None:
                    end = boundary
                    break

        while end > first:
            end_char = position(end)
            passage = body[start_char:end_char]
            text_tokens = len(tokenizer.encode(passage, add_special_tokens=False).ids)
            input_tokens = len(tokenizer.encode(PREFIX + passage).ids)
            if 0 < text_tokens <= target and input_tokens <= MAX_INPUT:
                break
            end -= 1
        if end <= first:
            raise ValueError("Could not fit a nonempty passage under the token budget")
        chunks.append({
            "startChar": start_char, "endChar": end_char,
            "textTokens": text_tokens, "inputTokens": input_tokens,
            "textSha256": sha256(passage.encode("utf-8")).hexdigest(),
        })
        if end == len(offsets):
            break
        following = max(first + 1, end - overlap)
        while following < end and position(following) <= start_char:
            following += 1
        first = following
    return chunks


def choose_body(article):
    if article["content"].strip():
        return "content", article["content"]
    if article["summary"] and article["summary"].strip():
        return "summary", article["summary"]
    return "none", ""


def record(tokenizer, article):
    field, body = choose_body(article)
    return {
        "sourceField": field, "sourceChars": len(body),
        "sourceTokens": len(tokenizer.encode(body, add_special_tokens=False).ids),
        "variants": [
            {**preset, "chunks": split(tokenizer, body, preset["target"], preset["overlap"])}
            for preset in PRESETS
        ],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("news_json", type=Path, help="Sanitized object with symbol and news array")
    parser.add_argument("tokenizer_json", type=Path, help=f"{MODEL}/tokenizer.json at {REVISION}")
    args = parser.parse_args()
    tokenizer = Tokenizer.from_file(str(args.tokenizer_json))
    tokenizer.no_truncation()
    tokenizer.no_padding()
    payload = json.loads(args.news_json.read_text(encoding="utf-8"))
    result = {
        "model": MODEL, "revision": REVISION, "policy": POLICY, "maxInput": MAX_INPUT,
        "payload": payload, "articles": [record(tokenizer, article) for article in payload["news"]],
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
