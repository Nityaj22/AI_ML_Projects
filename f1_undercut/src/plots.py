"""Plotting utilities for EDA (signatures only)."""

import pandas as pd
from typing import Optional
import matplotlib.pyplot as plt
import seaborn as sns


def plot_lap_time_distribution(laps: pd.DataFrame, by: str = "Compound"):
	"""Histogram/violin of lap times grouped by a column (e.g., compound)."""
	df = laps.copy()
	if "LapTime" in df.columns:
		df["LapTime_s"] = df["LapTime"].dt.total_seconds()
		value_col = "LapTime_s"
	else:
		value_col = "LapTime"
	
	plt.figure(figsize=(9,5))
	sns.violinplot(data=df, x=by, y=value_col, inner="quartile", cut=0)
	plt.title(f"Lap Time Distribution by {by}")
	plt.tight_layout()


def plot_gap_to_ahead(laps: pd.DataFrame, driver: Optional[str] = None):
	"""Line plot of gap to car ahead across laps (optionally for one driver)."""
	df = laps.copy()
	if driver:
		df = df[df["Driver"] == driver]
	gap_col = "GapToLeader" if "GapToLeader" in df.columns else None
	if gap_col is None:
		gap_col = "Position"

	plt.figure(figsize=(9,5))
	sns.lineplot(data=df, x="LapNumber", y=gap_col, hue="Driver" if not driver else None, legend=not driver)
	plt.title(f"{'Gap/Position to Leader' if gap_col!='Position' else 'Position'} over Laps")
	plt.tight_layout()


def plot_pit_timeline(pit_events: pd.DataFrame):
	"""Timeline of pit events across the race."""
	if pit_events.empty:
		plt.figure();
		plt.text(0.5,0.5,"No pit events found", ha="center");
		plt.axis("off");
		return
	
	plt.figure(figsize=(9,5))
	sns.stripplot(data=pit_events, x="LapNumber", y="Driver", hue="Compound" if "Compound" in pit_events.columns else None, dodge=True)
	plt.title("Pit Stop Timeline")
	plt.tight_layout()