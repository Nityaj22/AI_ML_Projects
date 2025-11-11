"""Loading utilities for F1 race sessions and telemetry (signatures only)."""

from pathlib import Path
from typing import Literal, Optional
import fastf1
import fastf1.api
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
	"""Return laps dataframe for the session, with compound info from timing app data."""
	ses = load_session(season, gp_name, session)
	df = ses.laps.reset_index(drop=True)
	
	# For race sessions, enhance compound data with timing app data
	if session == "R":
		timing_data = get_timing_app_data(season, gp_name)
		
		if not timing_data.empty and 'LapNumber' in timing_data.columns:
			# Create mapping: (Driver, LapNumber) -> Compound
			compound_map = {}
			for _, row in timing_data.iterrows():
				driver = row.get('Driver')
				lap = row.get('LapNumber')
				compound = row.get('Compound')
				if pd.notna(driver) and pd.notna(lap) and pd.notna(compound):
					# Map compound to this lap and subsequent laps until next change
					key = (driver, int(lap))
					compound_map[key] = compound
			
			# Update compound in laps dataframe
			# For each lap, find the most recent tire change on or before this lap
			# The compound from timing app data is the NEW compound after pitting
			if 'Driver' in df.columns and 'LapNumber' in df.columns:
				def get_compound_from_timing(driver, lap_num):
					# Find the most recent tire change on or before this lap
					best_match = None
					best_lap = -1
					
					for (d, l), comp in compound_map.items():
						if d == driver and l <= lap_num and l > best_lap:
							best_lap = l
							best_match = comp
					
					return best_match
				
				# Update compound: ALWAYS use timing app data when available
				# Create new compound column from timing app data
				new_compound = df.apply(
					lambda row: get_compound_from_timing(row['Driver'], row['LapNumber']),
					axis=1
				)
				
				# Where timing app data has compound, use it; otherwise keep existing
				df['Compound'] = new_compound.where(new_compound.notna(), df['Compound'])
				
				# Debug: print how many compounds were updated
				updated_count = new_compound.notna().sum()
				if updated_count > 0:
					print(f"Updated {updated_count} lap compounds from timing app data")
	
	return df

def get_timing_app_data(season: int, gp_name: str):
	"""Parse timing app data to extract tire compound changes.
	
	Returns DataFrame with compound information from timing app data.
	When TyresNotChanged is False, Compound shows the new tire after pitting.
	
	Uses fastf1.api.timing_app_data() to fetch the data.
	"""
	ses = load_session(season, gp_name, "R")
	
	# Fetch timing app data using the API function
	try:
		timing_df = fastf1.api.timing_app_data(ses.api_path)
	except Exception as e:
		print(f"Warning: Could not fetch timing app data: {e}")
		return pd.DataFrame()
	
	if timing_df is None or len(timing_df) == 0:
		return pd.DataFrame()
	
	# Create mapping from driver number to driver abbreviation
	# Get driver info from laps dataframe
	laps_df = ses.laps
	driver_map = {}
	if 'Driver' in laps_df.columns and 'DriverNumber' in laps_df.columns:
		for driver_abbrev, driver_num in laps_df[['Driver', 'DriverNumber']].drop_duplicates().values:
			driver_map[str(driver_num)] = driver_abbrev
	
	# Filter for tire changes (where TyresNotChanged is False)
	# When TyresNotChanged is False, it means tires were changed
	if 'TyresNotChanged' not in timing_df.columns or 'Compound' not in timing_df.columns:
		return pd.DataFrame()
	
	# Filter for tire changes: TyresNotChanged == False (or 0)
	compound_changes = timing_df[
		(timing_df['TyresNotChanged'] == False) | (timing_df['TyresNotChanged'] == 0)
	].copy()
	
	if len(compound_changes) == 0:
		return pd.DataFrame()
	
	# Map driver numbers to abbreviations
	records = []
	for _, row in compound_changes.iterrows():
		driver_num = row.get('Driver')
		compound = row.get('Compound')
		lap_num = row.get('LapNumber')
		
		# Map driver number to abbreviation
		driver_abbrev = driver_map.get(str(driver_num), str(driver_num))
		
		# Only record if we have both compound and lap number
		if pd.notna(compound) and pd.notna(lap_num):
			records.append({
				'Driver': driver_abbrev,  # Use abbreviation to match laps dataframe
				'LapNumber': lap_num,
				'Compound': compound,
				'Stint': row.get('Stint'),
				'New': row.get('New'),
				'Time': row.get('Time')
			})
	
	if records:
		result_df = pd.DataFrame(records)
		print(f"Found {len(result_df)} tire changes in timing app data")
		return result_df
	else:
		print("No tire changes found in timing app data")
		return pd.DataFrame()


def get_pit_events(season: int, gp_name: str):
	"""Return a pit events table with compound information from timing app data.
	
	Uses timing app data to get accurate compound after tire changes.
	"""
	ses = load_session(season, gp_name, "R")
	
	# Get pit stops from laps data
	pits = ses.laps[ses.laps["PitInTime"].notna()].copy()
	
	# Get compound information from timing app data
	timing_data = get_timing_app_data(season, gp_name)
	
	# Merge timing app compound data with pit events
	if not timing_data.empty and 'LapNumber' in timing_data.columns:
		# Create a mapping: (Driver, LapNumber) -> Compound
		compound_map = {}
		for _, row in timing_data.iterrows():
			driver = row.get('Driver')
			lap = row.get('LapNumber')
			compound = row.get('Compound')
			if pd.notna(driver) and pd.notna(lap) and pd.notna(compound):
				# Use the lap number when tire was changed
				# The compound is the NEW compound after pitting
				key = (driver, lap)
				compound_map[key] = compound
		
		# Update pit events with compound from timing app data
		# Priority: timing app data > existing compound
		def get_compound_from_timing(driver, lap_num):
			# Try exact match first
			if (driver, lap_num) in compound_map:
				return compound_map[(driver, lap_num)]
			# Try to find closest lap (tire change might be recorded on next lap)
			for (d, l), comp in compound_map.items():
				if d == driver and abs(l - lap_num) <= 1:
					return comp
			return None
		
		if 'Driver' in pits.columns and 'LapNumber' in pits.columns:
			# Get compound from timing app data
			new_compound = pits.apply(
				lambda row: get_compound_from_timing(row['Driver'], row['LapNumber']),
				axis=1
			)
			
			# Where timing app data has compound, use it; otherwise keep existing
			pits['Compound'] = new_compound.where(new_compound.notna(), pits['Compound'])
			
			# Debug: print how many pit compounds were updated
			updated_count = new_compound.notna().sum()
			if updated_count > 0:
				print(f"Updated {updated_count} pit event compounds from timing app data")
	
	# Keep relevant columns
	cols = [c for c in ["Driver", "LapNumber", "Compound", "Stint"] if c in pits.columns]
	pits = pits[cols] if cols else pits
	pits = pits.drop_duplicates(subset=["Driver", "LapNumber"])
	if "LapNumber" in pits.columns:
		pits = pits[(pits["LapNumber"] >= 1)]
	return pits.reset_index(drop=True)


def filter_safety_car_laps(df: pd.DataFrame) -> pd.DataFrame:
	"""Filter out Safety Car, Virtual Safety Car, and Red Flag laps from dataframe.
	
	FastF1 TrackStatus codes:
	- '1': Track clear (KEEP - normal racing)
	- '2': Yellow flag (KEEP - can still race)
	- '4': Safety Car (REMOVE)
	- '5': Red Flag (REMOVE)
	- '6': Virtual Safety Car deployed (REMOVE)
	- '7': Virtual Safety Car ending (KEEP - track clearing)
	
	Args:
		df: Laps dataframe with TrackStatus column
		
	Returns:
		DataFrame with SC/VSC/Red Flag laps removed
	"""
	if "TrackStatus" not in df.columns:
		return df
	
	# Convert TrackStatus to string for comparison
	track_status_str = df["TrackStatus"].astype(str)
	
	# Filter out laps where TrackStatus contains:
	# - '4' (Safety Car)
	# - '5' (Red Flag)
	# - '6' (Virtual Safety Car deployed)
	# This handles both exact matches and bitmask combinations
	mask = ~(
		track_status_str.str.contains('4', na=False) |  # Safety Car
		track_status_str.str.contains('5', na=False) |  # Red Flag
		track_status_str.str.contains('6', na=False)    # Virtual Safety Car
	)
	
	return df[mask].copy()


def get_clean_race_laps(season: int, gp_name: str) -> pd.DataFrame:
	"""Get clean race laps: valid lap times, no pit in/out laps, no SC/VSC/Red Flag laps."""
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

	# Remove SC/VSC/Red Flag laps (important for accurate degradation analysis)
	df = filter_safety_car_laps(df)

	# 3) Stint-lap index per driver and stint
	for c in ("Driver", "Stint"):
		if c not in df.columns:
			# If Stint missing, you can approximate by cumulative compound change,
			# but for D2 assume it's present.
			pass
	df = df.sort_values(["Driver", "Stint", "LapNumber"])
	df["StintLap"] = df.groupby(["Driver", "Stint"]).cumcount() + 1

	# 4) Lap time in seconds
	df["LapTime_s"] = df["LapTime"].dt.total_seconds()

	# Keep only needed columns
	keep = [c for c in ["Driver", "LapNumber", "LapTime", "LapTime_s", "Compound", "Stint", "StintLap"] if c in df.columns]
	return df[keep]
