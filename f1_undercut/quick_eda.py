"""Entry point for quick EDA plots (no logic yet)."""

from typing import Literal
import matplotlib.pyplot as plt
from src.cache import set_cache_dir, ensure_cache_dir
from src.data_loader import get_laps_dataframe, get_pit_events
from src.plots import plot_lap_time_distribution, plot_gap_to_ahead, plot_pit_timeline
from pathlib import Path

SessionKind = Literal["FP1", "FP2", "FP3", "Q", "R"]


def main(season: int = 2022, gp_name: str = "Monaco Grand Prix") -> None:
	"""Produce the three quick EDA plots for Deliverable 1."""
	cache_dir = Path("f1_undercut/data")
	ensure_cache_dir(cache_dir)
	set_cache_dir(cache_dir)

	laps = get_laps_dataframe(season, gp_name, "R")
	pit_events = get_pit_events(season, gp_name)

	plot_lap_time_distribution(laps, by="Compound")
	plt.savefig("f1_undercut/reports/lap_time_distribution.png", dpi=150)
	plt.close()

	plot_gap_to_ahead(laps, driver=None)
	plt.savefig("f1_undercut/reports/gap_over_laps.png", dpi = 150)
	plt.close()

	plot_pit_timeline(pit_events)
	plt.savefig("f1_undercut/reports/pit_timeline.png", dpi = 150)
	plt.close()


if __name__ == "__main__":
	# Keep empty for now; CLI will be added later.
	main()


