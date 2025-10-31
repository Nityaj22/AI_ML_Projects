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
	return cache_dir if cache_dir else Path("f1_undercut/data")


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

