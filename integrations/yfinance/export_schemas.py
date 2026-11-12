"""Generate downloadable application contracts from the executable Pydantic models."""
import argparse
import json
from pathlib import Path

from .models import AdapterError, NewsRequest, NewsResponse, QuoteRequest, QuoteResponse

ROOT = Path(__file__).resolve().parents[2]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    for name, model in [("news-request", NewsRequest), ("news-response", NewsResponse),
                        ("quote-request", QuoteRequest), ("quote-response", QuoteResponse),
                        ("error-response", AdapterError)]:
        schema = {"$schema": "https://json-schema.org/draft/2020-12/schema", **model.model_json_schema()}
        content = json.dumps(schema, ensure_ascii=False, indent=2) + "\n"
        target = ROOT / "public/downloads/yfinance" / (name + ".schema.json")
        if args.check:
            if target.read_text() != content:
                raise ValueError(f"Stale schema: {target}")
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content)
    print("YFinance application schemas verified" if args.check else "YFinance application schemas generated")


if __name__ == "__main__":
    main()
