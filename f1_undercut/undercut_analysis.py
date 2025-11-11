"""Main script for Deliverable 3: Undercut success analysis."""

from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from src.cache import set_cache_dir, ensure_cache_dir
from src.data_loader import get_laps_dataframe, get_pit_events
from src.features import (
    identify_undercut_attempts,
    label_undercut_success
)
from src.plots import (
    plot_undercut_success_breakdown,
    plot_undercut_timeline,
    plot_undercut_by_compound
)


def main(
    season: int = 2025,
    gp_name: str = "Brazilian Grand Prix",
    use_multiple_races: bool = False
) -> None:
    
    """Run undercut analysis and generate visualizations.
    
    This function:
    1. Setup cache and load race data
    2. Identify undercut attempts
    3. Label success/failure
    4. Generate multiple visualizations showing patterns
    """
    
    # ============================================================
    # STEP 1: Setup cache directory
    # ============================================================
    # We need to tell FastF1 where to store/load cached data
    # This makes subsequent runs faster (no re-downloading)
    cache_dir = Path("data")
    ensure_cache_dir(cache_dir)  # Create folder if it doesn't exist
    set_cache_dir(cache_dir)     # Tell FastF1 to use this folder
    
    # ============================================================
    # STEP 2: Load race data
    # ============================================================
    # Get two dataframes:
    # - laps: Every lap with times, positions, compounds, etc.
    # - pit_events: All pit stops with lap numbers, drivers, compounds
    print(f"Loading race data for {season} {gp_name}...")
    laps = get_laps_dataframe(season, gp_name, "R")
    pit_events = get_pit_events(season, gp_name)
    print(f"Loaded {len(laps)} laps and {len(pit_events)} pit events")

    # ============================================================
    # STEP 3: Identify undercut attempts
    # ============================================================
    # Find all cases where a driver pitted before the car ahead
    print("\nIdentifying undercut attempts...")
    undercut_attempts = identify_undercut_attempts(laps, pit_events)
    print(f"Found {len(undercut_attempts)} undercut attempts")
    
    if len(undercut_attempts) == 0:
        print("No undercut attempts found. Exiting.")
        return

    # ============================================================
    # STEP 4: Label success/failure
    # ============================================================
    # Check if each attempt succeeded (gained position)
    print("\nLabeling undercut success...")
    labeled_attempts = label_undercut_success(undercut_attempts, laps)
    success_rate = labeled_attempts['undercut_success'].mean()
    print(f"Success rate: {success_rate:.1%} ({labeled_attempts['undercut_success'].sum()}/{len(labeled_attempts)} successful)")

    # ============================================================
    # STEP 5: Generate visualizations
    # ============================================================
    print("\nGenerating visualizations...")
    
    # Plot 1: Success/Failure breakdown (pie chart)
    print("  - Success/Failure breakdown...")
    plot_undercut_success_breakdown(labeled_attempts, save_path="reports/undercut_success_breakdown.png")
    
    # Plot 2: Timeline of attempts
    print("  - Timeline of attempts...")
    plot_undercut_timeline(labeled_attempts, save_path="reports/undercut_timeline.png")
    
    # Plot 3: Success rate by compound change
    print("  - Success rate by compound change...")
    plot_undercut_by_compound(labeled_attempts, laps, save_path="reports/undercut_by_compound.png")
    
    print("\nAll visualizations saved!")
    
    # ============================================================
    # STEP 6: Print summary
    # ============================================================
    print("\n" + "=" * 60)
    print("UNDERCUT ANALYSIS COMPLETE")
    print("=" * 60)
    print(f"Race: {season} {gp_name}")
    print(f"Total undercut attempts: {len(labeled_attempts)}")
    print(f"Successful: {labeled_attempts['undercut_success'].sum()}")
    print(f"Failed: {len(labeled_attempts) - labeled_attempts['undercut_success'].sum()}")
    print(f"Overall success rate: {success_rate:.1%}")
    print(f"\nGenerated Visualizations:")
    print(f"  ✓ reports/undercut_success_breakdown.png")
    print(f"  ✓ reports/undercut_timeline.png")
    print(f"  ✓ reports/undercut_by_compound.png")
    print("=" * 60)
if __name__ == "__main__":
    main()
