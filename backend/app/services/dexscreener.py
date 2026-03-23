from typing import Any

import httpx

DEXSCREENER_SEARCH_URL = "https://api.dexscreener.com/latest/dex/search"


def _to_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _pair_rank(pair: dict[str, Any]) -> tuple[float, float, float]:
    liquidity = _to_float((pair.get("liquidity") or {}).get("usd")) or 0.0
    volume_h24 = _to_float((pair.get("volume") or {}).get("h24")) or 0.0
    price_usd = _to_float(pair.get("priceUsd")) or 0.0
    return (liquidity, volume_h24, price_usd)


def fetch_top_pair_for_symbol(symbol: str, timeout_seconds: float = 8.0) -> dict[str, Any] | None:
    symbol = symbol.upper().strip()
    if not symbol:
        return None

    try:
        with httpx.Client(timeout=timeout_seconds) as client:
            response = client.get(DEXSCREENER_SEARCH_URL, params={"q": symbol})
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError):
        return None

    raw_pairs = payload.get("pairs") or []
    symbol_matches = []

    for pair in raw_pairs:
        base_symbol = ((pair.get("baseToken") or {}).get("symbol") or "").upper()
        if base_symbol == symbol:
            symbol_matches.append(pair)

    if not symbol_matches:
        return None

    best_pair = sorted(symbol_matches, key=_pair_rank, reverse=True)[0]

    return {
        "chain_id": best_pair.get("chainId"),
        "dex_id": best_pair.get("dexId"),
        "pair_address": best_pair.get("pairAddress"),
        "url": best_pair.get("url"),
        "price_usd": _to_float(best_pair.get("priceUsd")),
        "price_change_h24": _to_float((best_pair.get("priceChange") or {}).get("h24")),
        "liquidity_usd": _to_float((best_pair.get("liquidity") or {}).get("usd")),
        "fdv": _to_float(best_pair.get("fdv")),
        "market_cap": _to_float(best_pair.get("marketCap")),
        "volume_h24": _to_float((best_pair.get("volume") or {}).get("h24")),
        "base_symbol": (best_pair.get("baseToken") or {}).get("symbol"),
        "base_name": (best_pair.get("baseToken") or {}).get("name"),
        "quote_symbol": (best_pair.get("quoteToken") or {}).get("symbol"),
        "labels": best_pair.get("labels") or [],
    }
