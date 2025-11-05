"""Loading utilities for F1 race sessions and telemetry (signatures only)."""

from pathlib import Path
from typing import Literal, Optional
import fastf1
import pandas as pd

SessionKind = Literal["FP1", "FP2", "FP3", "Q", "R"]


def load_session(season: int, gp_name: str, session: SessionKind):
	"""Load a FastF1 session (practice/qualifying/race)."""
	ses = fastf1.get_session(season, gp_name, session)
	ses.load()
	return ses


def cache_session(
	season: int,
	gp_name: str,
	session: SessionKind,
	cache_dir: Optional[Path] = None,
) -> Path:
	"""Download and cache a session; return a marker or path to cached files."""
	_=load_session(season, gp_name, session)
	return cache_dir if cache_dir else Path("data")


def get_laps_dataframe(season: int, gp_name: str, session: SessionKind):
	"""Return laps dataframe for the session."""
	ses = load_session(season, gp_name, session)
	df = ses.laps.reset_index(drop=True)
	return df

def get_pit_events(season: int, gp_name: str):
	"""Return a simple pit events table for the race session."""
	ses = load_session(season, gp_name, "R")
	pits = ses.laps[ses.laps["PitInTime"].notna()].copy()
	cols = [c for c in ["Driver", "LapNumber", "Compound", "Stint"] if c in pits.columns]
	pits = pits[cols] if cols else pits
	pits = pits.drop_duplicates(subset=["Driver", "LapNumber"])
	if "LapNumber" in pits.columns:
		pits = pits[(pits["LapNumber"] >= 1)]
	return pits.reset_index(drop=True)


def get_clean_race_laps(season: int, gp_name: str) -> pd.DataFrame:
	# 1) Load race laps
	df = get_laps_dataframe(season, gp_name, "R").copy()

	# 2) Keep valid laps (LapTime present)
	if "LapTime" in df.columns:
		# Convert to Timedelta if needed
		if not pd.api.types.is_timedelta64_dtype(df["LapTime"]):
			df["LapTime"] = pd.to_timedelta(df["LapTime"])
		df = df[df["LapTime"].notna()]

	# Drop in-laps and out-laps to avoid noisy times
	for col in ("PitInTime", "PitOutTime"):
		if col in df.columns:
			df = df[df[col].isna()]

	# Optional: remove SC/VSC laps if TrackStatus available (code '4','5' often SC/VSC)
	if "TrackStatus" in df.columns:
		df = df[~df["TrackStatus"].astype(str).isin(["4", "5"])]

	# 3) Stint-lap index per driver and stint
	for c in ("Driver", "Stint"):
		if c not in df.columns:
			# If Stint missing, you can approximate by cumulative compound change,
			# but for D2 assume it’s present.
			pass
	df = df.sort_values(["Driver", "Stint", "LapNumber"])
	df["StintLap"] = df.groupby(["Driver", "Stint"]).cumcount() + 1

	# 4) Lap time in seconds
	df["LapTime_s"] = df["LapTime"].dt.total_seconds()

	# Keep only needed columns
	keep = [c for c in ["Driver", "LapNumber", "LapTime", "LapTime_s", "Compound", "Stint", "StintLap"] if c in df.columns]
	return df[keep]
