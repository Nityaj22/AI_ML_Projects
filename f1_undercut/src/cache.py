"""Caching helpers for FastF1 data (function signatures only)."""

from pathlib import Path
from typing import Optional
import fastf1 as f1


def set_cache_dir(cache_dir: Path) -> None:
	"""Configure FastF1 to use a given cache directory."""
	f1.Cache.enable_cache(str(cache_dir))


def ensure_cache_dir(cache_dir: Path) -> None:
	"""Create the cache directory if it does not exist."""
	cache_dir.mkdir(parents=True, exist_ok=True)


def clear_cache(cache_dir: Path, season: Optional[int] = None) -> None:
	"""Optionally clear cached data (entire cache or for a season)."""
	if cache_dir.exists():
		raise RuntimeError("Clear not implemented to avoid accidental deletion.")


