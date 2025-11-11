"""Feature engineering utilities for undercut analysis."""

import pandas as pd
import numpy as np
from typing import Optional


def identify_undercut_attempts(laps: pd.DataFrame, pit_events: pd.DataFrame) -> pd.DataFrame:
    """Identify undercut attempts: driver pits before the car ahead.
    
    Logic:
    - For each pit stop, check if the driver behind (position + 1) pitted
    - on the same lap or next lap
    - This indicates an undercut attempt
    
    Args:
        laps: Full laps dataframe with position/gap data
        pit_events: Pit stop events dataframe
        
    Returns:
        DataFrame with undercut attempt candidates
    """
    attempts = []
    
    # Sort by lap number for chronological processing
    pit_events_sorted = pit_events.sort_values("LapNumber")
    laps_sorted = laps.sort_values(["LapNumber", "Position"])
    
    # For each pit stop
    for idx, pit in pit_events_sorted.iterrows():
        driver = pit["Driver"]
        pit_lap = pit["LapNumber"]
        
        # Get this driver's position before the pit stop
        driver_laps = laps_sorted[
            (laps_sorted["Driver"] == driver) & 
            (laps_sorted["LapNumber"] == pit_lap - 1)  # Lap before pit
        ]
        
        if driver_laps.empty:
            continue
            
        position_before = driver_laps.iloc[0]["Position"]
        
        # Check if there's a car ahead (position - 1)
        car_ahead_position = position_before - 1
        
        if car_ahead_position < 1:
            continue  # Driver is already in first place, can't undercut
        
        # Find who was in that position
        ahead_laps = laps_sorted[
            (laps_sorted["LapNumber"] == pit_lap - 1) &
            (laps_sorted["Position"] == car_ahead_position)
        ]
        
        if ahead_laps.empty:
            continue
            
        car_ahead_driver = ahead_laps.iloc[0]["Driver"]
        
        # Check if car ahead pitted on same lap or next lap
        ahead_pits = pit_events_sorted[
            (pit_events_sorted["Driver"] == car_ahead_driver) &
            (pit_events_sorted["LapNumber"].isin([pit_lap, pit_lap + 1]))
        ]
        
        if ahead_pits.empty:
            # Car ahead hasn't pitted yet - this is an undercut attempt!
            attempts.append({
                "driver": driver,
                "car_ahead": car_ahead_driver,
                "pit_lap": pit_lap,
                "position_before": position_before,
                "position_ahead": car_ahead_position
            })
    
    return pd.DataFrame(attempts)


def label_undercut_success(
    undercut_attempts: pd.DataFrame,
    laps: pd.DataFrame,
    success_window_laps: int = 2
) -> pd.DataFrame:
    """Label whether each undercut attempt was successful.
    
    Success = driver gained position within N laps after pit stop.
    
    Args:
        undercut_attempts: DataFrame of undercut attempts
        laps: Full laps dataframe
        success_window_laps: Number of laps after pit to check for position gain
        
    Returns:
        DataFrame with 'undercut_success' column (0/1)
    """
    labeled = undercut_attempts.copy()
    labeled["undercut_success"] = 0
    
    laps_sorted = laps.sort_values(["LapNumber", "Driver"])
    max_lap = laps_sorted["LapNumber"].max()
    
    for idx, attempt in labeled.iterrows():
        driver = attempt["driver"]
        car_ahead = attempt["car_ahead"]
        pit_lap = attempt["pit_lap"]
        position_before = attempt["position_before"]
        
        # Get car_ahead's position before the pit (on lap before pit)
        ahead_laps_before = laps_sorted[
            (laps_sorted["Driver"] == car_ahead) &
            (laps_sorted["LapNumber"] == pit_lap - 1)
        ]
        
        if ahead_laps_before.empty:
            continue  # Can't determine if undercut worked without knowing car_ahead's position
        
        ahead_position_before = ahead_laps_before.iloc[0]["Position"]
        
        # Verify driver was actually behind car_ahead before pit
        if position_before <= ahead_position_before:
            continue  # Driver was already ahead or equal - not an undercut attempt
        
        # Check positions N laps after pit (or as close as possible)
        check_lap = min(pit_lap + success_window_laps, max_lap)
        
        # Try to find laps at check_lap, or closest available lap
        driver_laps_after = laps_sorted[
            (laps_sorted["Driver"] == driver) &
            (laps_sorted["LapNumber"] == check_lap)
        ]
        ahead_laps_after = laps_sorted[
            (laps_sorted["Driver"] == car_ahead) &
            (laps_sorted["LapNumber"] == check_lap)
        ]
        
        # If exact lap not found, try next available lap
        if driver_laps_after.empty:
            driver_laps_after = laps_sorted[
                (laps_sorted["Driver"] == driver) &
                (laps_sorted["LapNumber"] > pit_lap)
            ].head(1)
        if ahead_laps_after.empty:
            ahead_laps_after = laps_sorted[
                (laps_sorted["Driver"] == car_ahead) &
                (laps_sorted["LapNumber"] > pit_lap)
            ].head(1)
        
        if driver_laps_after.empty or ahead_laps_after.empty:
            continue  # Driver or car ahead may have retired
        
        driver_position_after = driver_laps_after.iloc[0]["Position"]
        ahead_position_after = ahead_laps_after.iloc[0]["Position"]
        
        # Success if driver passed the car ahead (driver position < ahead position)
        # This means the undercut worked - driver is now ahead of the car they were trying to pass
        if driver_position_after < ahead_position_after:
            labeled.at[idx, "undercut_success"] = 1
        # Also success if driver improved position significantly relative to car_ahead
        elif driver_position_after < ahead_position_before:
            # Driver is now ahead of where car_ahead was before - undercut worked
            labeled.at[idx, "undercut_success"] = 1
    
    return labeled


def compute_pre_pit_gap(
    undercut_attempts: pd.DataFrame,
    laps: pd.DataFrame
) -> pd.Series:
    """Compute gap to car ahead just before pit stop.
    
    Args:
        undercut_attempts: DataFrame of undercut attempts
        laps: Full laps dataframe
        
    Returns:
        Series with pre-pit gap in seconds
    """
    gaps = []
    laps_sorted = laps.sort_values(["LapNumber", "Driver"])
    
    for idx, attempt in undercut_attempts.iterrows():
        driver = attempt["driver"]
        pit_lap = attempt["pit_lap"]
        car_ahead = attempt["car_ahead"]
        
        # Get gap on lap before pit
        driver_lap = laps_sorted[
            (laps_sorted["Driver"] == driver) &
            (laps_sorted["LapNumber"] == pit_lap - 1)
        ]
        
        if not driver_lap.empty and "GapToLeader" in driver_lap.columns:
            # Try to get gap to car ahead
            # If GapToLeader exists, we can approximate
            gap = driver_lap.iloc[0].get("GapToLeader", np.nan)
        else:
            # Fallback: use position difference as proxy
            gap = np.nan
        
        gaps.append(gap)
    
    return pd.Series(gaps, index=undercut_attempts.index)


def compute_tyre_age(
    undercut_attempts: pd.DataFrame,
    laps: pd.DataFrame
) -> pd.Series:
    """Compute tyre age (laps on current compound) at pit stop.
    
    Args:
        undercut_attempts: DataFrame of undercut attempts
        laps: Full laps dataframe
        
    Returns:
        Series with tyre age in laps
    """
    ages = []
    laps_sorted = laps.sort_values(["LapNumber", "Driver"])
    
    for idx, attempt in undercut_attempts.iterrows():
        driver = attempt["driver"]
        pit_lap = attempt["pit_lap"]
        
        # Get compound on lap before pit
        driver_lap = laps_sorted[
            (laps_sorted["Driver"] == driver) &
            (laps_sorted["LapNumber"] == pit_lap - 1)
        ]
        
        if driver_lap.empty or "Compound" not in driver_lap.columns:
            ages.append(np.nan)
            continue
        
        current_compound = driver_lap.iloc[0]["Compound"]
        
        # Count how many consecutive laps on this compound
        driver_all_laps = laps_sorted[laps_sorted["Driver"] == driver]
        driver_all_laps = driver_all_laps[driver_all_laps["LapNumber"] <= pit_lap - 1]
        driver_all_laps = driver_all_laps.sort_values("LapNumber", ascending=False)
        
        tyre_age = 0
        for _, lap in driver_all_laps.iterrows():
            if lap["Compound"] == current_compound:
                tyre_age += 1
            else:
                break
        
        ages.append(tyre_age)
    
    return pd.Series(ages, index=undercut_attempts.index)


def compute_compound_change(
    undercut_attempts: pd.DataFrame,
    laps: pd.DataFrame
) -> pd.Series:
    """Compute compound change (e.g., 'SOFT_TO_MEDIUM').
    
    Args:
        undercut_attempts: DataFrame of undercut attempts
        laps: Full laps dataframe
        
    Returns:
        Series with compound change strings
    """
    changes = []
    laps_sorted = laps.sort_values(["LapNumber", "Driver"])
    
    for idx, attempt in undercut_attempts.iterrows():
        driver = attempt["driver"]
        pit_lap = attempt["pit_lap"]
        
        # Get compound before and after pit
        before_lap = laps_sorted[
            (laps_sorted["Driver"] == driver) &
            (laps_sorted["LapNumber"] == pit_lap - 1)
        ]
        after_lap = laps_sorted[
            (laps_sorted["Driver"] == driver) &
            (laps_sorted["LapNumber"] == pit_lap + 1)
        ]
        
        if before_lap.empty or after_lap.empty:
            changes.append("UNKNOWN")
            continue
        
        compound_before = before_lap.iloc[0].get("Compound", "UNKNOWN")
        compound_after = after_lap.iloc[0].get("Compound", "UNKNOWN")
        
        change_str = f"{compound_before}_TO_{compound_after}"
        changes.append(change_str)
    
    return pd.Series(changes, index=undercut_attempts.index)


def build_feature_matrix(
    labeled_attempts: pd.DataFrame,
    laps: pd.DataFrame
) -> tuple[pd.DataFrame, pd.Series]:
    """Build feature matrix X and target y for modeling.
    
    Features:
        - pre_pit_gap: Gap to car ahead (seconds)
        - tyre_age: Laps on current compound
        - compound_change_*: One-hot encoded compound changes
        - position: Track position before pit
        
    Args:
        labeled_attempts: Labeled undercut attempts with success labels
        laps: Full laps dataframe
        
    Returns:
        Tuple of (X: feature matrix, y: target labels)
    """
    # Start with basic features
    X = pd.DataFrame(index=labeled_attempts.index)
    
    # Pre-pit gap
    X["pre_pit_gap"] = compute_pre_pit_gap(labeled_attempts, laps)
    
    # Tyre age
    X["tyre_age"] = compute_tyre_age(labeled_attempts, laps)
    
    # Position before pit
    X["position"] = labeled_attempts["position_before"]
    
    # Compound change (one-hot encode)
    compound_changes = compute_compound_change(labeled_attempts, laps)
    compound_dummies = pd.get_dummies(compound_changes, prefix="compound_change")
    X = pd.concat([X, compound_dummies], axis=1)
    
    # Fill NaN values with median for numeric columns
    for col in X.select_dtypes(include=[np.number]).columns:
        median_val = X[col].median()
        if pd.isna(median_val):
            # If median is also NaN, fill with 0
            X[col] = X[col].fillna(0)
        else:
            X[col] = X[col].fillna(median_val)
    
    # Fill any remaining NaN in non-numeric columns with 0
    X = X.fillna(0)
    
    # Extract target
    y = labeled_attempts["undercut_success"]
    
    # Drop rows where target is NaN (shouldn't happen, but safety check)
    valid_mask = ~y.isna()
    X = X[valid_mask]
    y = y[valid_mask]
    
    return X, y



