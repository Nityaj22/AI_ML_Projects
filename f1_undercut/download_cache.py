"""Entry point for downloading and caching one GP (no logic yet)."""

from pathlib import Path
from typing import Literal
from src.cache import set_cache_dir, ensure_cache_dir
from src.data_loader import cache_session

SessionKind = Literal["FP1", "FP2", "FP3", "Q", "R"]


def main(
	season: int = 2025,
	gp_name: str = "Brazilian Grand Prix",
	sessions: list[SessionKind] | None = None,
	cache_dir: Path | None = Path("data"),
) -> None:
	"""Parameterized entry point to cache one GP's sessions."""
	ensure_cache_dir(cache_dir)
	set_cache_dir(cache_dir)
	if sessions is None:
		sessions = ["R"]
	for ses in sessions:
		cache_session(season, gp_name, ses, cache_dir)


if __name__ == "__main__":
	# Keep empty for now; we will wire CLI later.
	main()


