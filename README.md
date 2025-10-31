# AI/ML Projects

This repo tracks my learning sprints toward neural networks via hands-on, shippable projects (finance + F1). Each sprint has 2–3 small deliverables I can post quickly.

## Sprint 1 (F1) — Undercut Analysis (no NN)

Deliverables
- D1: Cache + quick EDA for one GP
  - Charts: lap time distribution by compound, gap over laps, pit timeline
  - Output: `f1_undercut/reports/*.png`
- D2: Stint degradation curves (per compound) + short write-up
- D3: Baseline undercut success heatmap + logistic baseline

Folder structure
- `f1_undercut/`
  - `data/` – FastF1 cache (gitignored)
  - `reports/` – exported plots and metrics
  - `src/` – small utilities
    - `cache.py` – set/ensure FastF1 cache
    - `data_loader.py` – load sessions, laps, pit events
    - `plots.py` – plotting utilities for EDA
  - `download_cache.py` – script to download/cache sessions
  - `quick_eda.py` – script to generate the three D1 charts

Run locally (PowerShell)
1) Activate env
```
./f1_undercut/.venv/Scripts/Activate.ps1
```
2) (Optional) Cache a GP (defaults: 2023, Bahrain)
```
python .\f1_undercut\download_cache.py
```
3) Generate D1 charts
```
python .\f1_undercut\quick_eda.py
```
4) Change GP
```
# Edit defaults in quick_eda.py or call main with params
# Example: main(2024, "Monaco Grand Prix")
```

Notes
- Pit timeline uses PitInTime only and dedupes by (Driver, LapNumber).
- If a gap column is missing, plots fall back to `Position`.

## Monte Carlo (previous work)
- `Monte_Carlo_Models/` contains GBM simulations and related experiments.

## Stack
- Python, pandas, numpy, matplotlib, seaborn, scikit-learn, plotly, FastF1

## Next sprints (toward NN)
- EV demand forecasting baselines → NN
- F1 undercut model upgrades → sequence models

