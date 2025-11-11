"""Plotting utilities for EDA (signatures only)."""

import pandas as pd
import numpy as np
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

def plot_stint_degradation(df: pd.DataFrame):
	# 5) Aggregate median and IQR per compound and stint-lap
	grp = (
		df.groupby(["Compound", "StintLap"])["LapTime_s"]
		.agg(median="median", p25=lambda x: np.percentile(x, 25), p75=lambda x: np.percentile(x, 75))
		.reset_index()
	)

	plt.figure(figsize=(10, 6))
	compounds = grp["Compound"].unique().tolist()
	palette = sns.color_palette("tab10", n_colors=len(compounds))

	for color, compound in zip(palette, compounds):
		sub = grp[grp["Compound"] == compound]
		plt.plot(sub["StintLap"], sub["median"], label=compound, color=color, linewidth=2)
		plt.fill_between(sub["StintLap"], sub["p25"], sub["p75"], color=color, alpha=0.2)

	plt.xlabel("Stint Lap (index within stint)")
	plt.ylabel("Lap Time (s)")
	plt.title("Stint Degradation by Compound (median with IQR)")
	plt.legend(title="Compound")
	plt.tight_layout()


def plot_undercut_success_breakdown(labeled_attempts: pd.DataFrame, save_path: Optional[str] = None) -> None:
    """Plot pie chart showing success vs failure breakdown."""
    success_count = labeled_attempts['undercut_success'].sum()
    failure_count = len(labeled_attempts) - success_count
    
    plt.figure(figsize=(8, 6))
    plt.pie([failure_count, success_count], 
            labels=['Failed', 'Successful'],
            autopct='%1.1f%%',
            colors=['#ff6b6b', '#51cf66'],
            startangle=90)
    plt.title(f"Undercut Attempts: Success vs Failure\nTotal: {len(labeled_attempts)} attempts")
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=150)
        plt.close()
    else:
        plt.show()


def plot_undercut_timeline(labeled_attempts: pd.DataFrame, save_path: Optional[str] = None) -> None:
    """Plot timeline of undercut attempts showing success/failure over race."""
    plt.figure(figsize=(12, 6))
    
    # Separate success and failure
    success_attempts = labeled_attempts[labeled_attempts['undercut_success'] == 1]
    failure_attempts = labeled_attempts[labeled_attempts['undercut_success'] == 0]
    
    # Plot failures
    if not failure_attempts.empty:
        plt.scatter(failure_attempts['pit_lap'], failure_attempts['position_before'], 
                   c='#ff6b6b', marker='x', s=100, alpha=0.7, label='Failure')
    
    # Plot successes
    if not success_attempts.empty:
        plt.scatter(success_attempts['pit_lap'], success_attempts['position_before'], 
                   c='#51cf66', marker='o', s=100, alpha=0.7, label='Success')
    
    plt.xlabel("Lap Number")
    plt.ylabel("Position Before Pit")
    plt.title("Undercut Attempts Timeline\n(Green circles = Success, Red X = Failure)")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=150)
        plt.close()
    else:
        plt.show()


def plot_undercut_by_compound(labeled_attempts: pd.DataFrame, laps: pd.DataFrame, save_path: Optional[str] = None) -> None:
    """Plot success rate by compound change type."""
    # Get compound changes
    from src.features import compute_compound_change
    compound_changes = compute_compound_change(labeled_attempts, laps)
    
    df = pd.DataFrame({
        'compound_change': compound_changes,
        'success': labeled_attempts['undercut_success']
    })
    
    # Calculate success rate per compound change
    success_rates = df.groupby('compound_change')['success'].agg(['mean', 'count'])
    success_rates = success_rates[success_rates['count'] >= 1]  # Only show if at least 1 attempt
    
    if success_rates.empty:
        plt.figure(figsize=(8, 6))
        plt.text(0.5, 0.5, "No compound change data available", ha="center", va="center")
        plt.axis("off")
        if save_path:
            plt.savefig(save_path, dpi=150)
            plt.close()
        return
    
    plt.figure(figsize=(10, 6))
    bars = plt.bar(range(len(success_rates)), success_rates['mean'], 
                   color=['#51cf66' if x > 0.5 else '#ff6b6b' for x in success_rates['mean']])
    plt.xticks(range(len(success_rates)), success_rates.index, rotation=45, ha='right')
    plt.ylabel("Success Rate")
    plt.title("Undercut Success Rate by Compound Change")
    plt.ylim(0, 1)
    
    # Add count labels on bars
    for i, (rate, count) in enumerate(zip(success_rates['mean'], success_rates['count'])):
        plt.text(i, rate + 0.02, f'n={int(count)}', ha='center', va='bottom')
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=150)
        plt.close()
    else:
        plt.show()


def plot_undercut_scatter(labeled_attempts: pd.DataFrame, laps: pd.DataFrame, save_path: Optional[str] = None) -> None:
    """Scatter plot: gap vs tyre age, colored by success."""
    from src.features import compute_pre_pit_gap, compute_tyre_age
    
    gaps = compute_pre_pit_gap(labeled_attempts, laps)
    ages = compute_tyre_age(labeled_attempts, laps)
    
    df = pd.DataFrame({
        'gap': gaps,
        'tyre_age': ages,
        'success': labeled_attempts['undercut_success']
    })
    df = df.dropna()
    
    if df.empty:
        plt.figure(figsize=(8, 6))
        plt.text(0.5, 0.5, "No data available", ha="center", va="center")
        plt.axis("off")
        if save_path:
            plt.savefig(save_path, dpi=150)
            plt.close()
        return
    
    plt.figure(figsize=(10, 6))
    success_df = df[df['success'] == 1]
    failure_df = df[df['success'] == 0]
    
    if not success_df.empty:
        plt.scatter(success_df['gap'], success_df['tyre_age'], 
                   c='#51cf66', marker='o', s=100, alpha=0.7, label='Success')
    if not failure_df.empty:
        plt.scatter(failure_df['gap'], failure_df['tyre_age'], 
                   c='#ff6b6b', marker='x', s=100, alpha=0.7, label='Failure')
    
    plt.xlabel("Pre-Pit Gap (seconds)")
    plt.ylabel("Tyre Age (laps)")
    plt.title("Undercut Attempts: Gap vs Tyre Age")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=150)
        plt.close()
    else:
        plt.show()


def plot_undercut_heatmap(
    labeled_attempts: pd.DataFrame,
    laps: pd.DataFrame,
    save_path: Optional[str] = None
) -> None:
    """Plot heatmap of undercut success rate vs pre-pit gap × tyre age."""
    from src.features import compute_pre_pit_gap, compute_tyre_age
    
    gaps = compute_pre_pit_gap(labeled_attempts, laps)
    ages = compute_tyre_age(labeled_attempts, laps)
    
    df = pd.DataFrame({
        "pre_pit_gap": gaps,
        "tyre_age": ages,
        "success": labeled_attempts["undercut_success"]
    })
    
    df = df.dropna()
    
    if df.empty:
        plt.figure(figsize=(8, 6))
        plt.text(0.5, 0.5, "No data available for heatmap", ha="center", va="center")
        plt.axis("off")
        if save_path:
            plt.savefig(save_path, dpi=150)
            plt.close()
        return
    
    # Create bins
    gap_bins = pd.cut(df["pre_pit_gap"], bins=5, labels=["0-1s", "1-2s", "2-3s", "3-4s", "4+ s"])
    age_bins = pd.cut(df["tyre_age"], bins=5, labels=["0-5", "5-10", "10-15", "15-20", "20+"])
    
    # Compute success rate per bin
    heatmap_data = df.groupby([gap_bins, age_bins], observed=False)["success"].mean().unstack(fill_value=0)
    
    # Plot heatmap
    plt.figure(figsize=(10, 6))
    sns.heatmap(heatmap_data, annot=True, fmt=".2%", cmap="YlOrRd", cbar_kws={"label": "Success Rate"})
    plt.xlabel("Tyre Age (laps)")
    plt.ylabel("Pre-Pit Gap (seconds)")
    plt.title("Undercut Success Rate Heatmap")
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=150)
        plt.close()
    else:
        plt.show()