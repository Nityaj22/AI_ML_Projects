"""Entry point for quick EDA plots (no logic yet)."""

from typing import Literal
import matplotlib.pyplot as plt
from src.cache import set_cache_dir, ensure_cache_dir
from src.data_loader import get_laps_dataframe, get_pit_events, get_clean_race_laps
from src.plots import plot_lap_time_distribution, plot_gap_to_ahead, plot_pit_timeline, plot_stint_degradation
from pathlib import Path

SessionKind = Literal["FP1", "FP2", "FP3", "Q", "R"]


def main(season: int = 2025, gp_name: str = "Azerbaijan Grand Prix") -> None:
	"""Produce the three quick EDA plots for Deliverable 1."""
	cache_dir = Path("data")
	ensure_cache_dir(cache_dir)
	set_cache_dir(cache_dir)

	laps = get_laps_dataframe(season, gp_name, "R")
	pit_events = get_pit_events(season, gp_name)

	plot_lap_time_distribution(laps, by="Compound")
	plt.savefig("reports/lap_time_distribution.png", dpi=150)
	plt.close()

	plot_gap_to_ahead(laps, driver=None)
	plt.savefig("reports/gap_over_laps.png", dpi = 150)
	plt.close()

	plot_pit_timeline(pit_events)
	plt.savefig("reports/pit_timeline.png", dpi = 150)
	plt.close()

def stint_degradation_main(season: int = 2025, gp_name: str = "Azerbaijan Grand Prix") -> None:
	cache_dir = Path("data")
	ensure_cache_dir(cache_dir)
	set_cache_dir(cache_dir)
	
	out_dir = Path("reports")
	out_dir.mkdir(parents=True, exist_ok=True)

	df = get_clean_race_laps(season, gp_name)
	plot_stint_degradation(df)
	plt.savefig(out_dir / "stint_degradation.png", dpi=150)
	plt.close()

if __name__ == "__main__":
	# Run both D1 and D2 plots
	main()  # D1: lap time distribution, gap over laps, pit timeline
	stint_degradation_main()  # D2: stint degradation curves


