"""Entry point for quick EDA plots (no logic yet)."""

from typing import Literal
import matplotlib.pyplot as plt
from src.cache import set_cache_dir, ensure_cache_dir
from src.data_loader import get_laps_dataframe, get_pit_events, get_clean_race_laps, filter_safety_car_laps
from src.plots import plot_lap_time_distribution, plot_gap_to_ahead, plot_pit_timeline, plot_stint_degradation
from pathlib import Path

SessionKind = Literal["FP1", "FP2", "FP3", "Q", "R"]


def main(season: int = 2025, gp_name: str = "Brazilian Grand Prix") -> None:
	"""Produce the three quick EDA plots for Deliverable 1."""
	cache_dir = Path("data")
	ensure_cache_dir(cache_dir)
	set_cache_dir(cache_dir)

	# Load race data
	laps = get_laps_dataframe(season, gp_name, "R")
	pit_events = get_pit_events(season, gp_name)
	
	# Filter out Safety Car/Virtual Safety Car/Red Flag laps for accurate analysis
	# (SC/VSC/Red Flag laps have artificially slow times that skew distributions)
	laps_clean = filter_safety_car_laps(laps.copy())
	
	print(f"Total laps: {len(laps)}, After SC/VSC/Red Flag filter: {len(laps_clean)}")
	print(f"Removed {len(laps) - len(laps_clean)} SC/VSC/Red Flag laps")

	# Plot 1: Lap time distribution by compound (no SC/VSC/Red Flag)
	plot_lap_time_distribution(laps_clean, by="Compound")
	plt.savefig("reports/lap_time_distribution.png", dpi=150)
	plt.close()

	# Plot 2: Gap over laps (no SC/VSC/Red Flag)
	plot_gap_to_ahead(laps_clean, driver=None)
	plt.savefig("reports/gap_over_laps.png", dpi = 150)
	plt.close()

	# Plot 3: Pit timeline (keep all pits, even during SC)
	plot_pit_timeline(pit_events)
	plt.savefig("reports/pit_timeline.png", dpi = 150)
	plt.close()

def stint_degradation_main(season: int = 2025, gp_name: str = "Brazilian Grand Prix") -> None:
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


