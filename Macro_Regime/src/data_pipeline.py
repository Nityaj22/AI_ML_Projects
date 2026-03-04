import os
import pandas as pd
import yfinance as yf
from fredapi import Fred
from dotenv import load_dotenv

# ── 1. LOAD API KEY ──────────────────────────────────────────────────────────

load_dotenv(dotenv_path=r"W:\AI_ML_Projects\Macro_Regime\.env")
fred = Fred(api_key=os.getenv("FRED_API_KEY"))

# ── 2. FRED MACRO DATA ───────────────────────────────────────────────────────

START = "1990-01-01"

FRED_SERIES = {
    "yield_curve":     "T10Y2Y",       # 10Y minus 2Y treasury spread
    "cpi":             "CPIAUCSL",     # Consumer Price Index
    "unemployment":    "UNRATE",       # Unemployment rate
    "indpro":          "INDPRO",       # Industrial Production Index
    "credit_spread":   "BAMLH0A0HYM2" # High Yield credit spread
}

print("Pulling FRED data...")
macro_series = {}
for name, series_id in FRED_SERIES.items():
    print(f"  fetching {series_id}...")
    macro_series[name] = fred.get_series(series_id, observation_start=START)

macro_df = pd.DataFrame(macro_series)

# Resample to month-end frequency, forward fill small gaps
macro_df = macro_df.resample("ME").last().ffill()

print(f"  macro data shape: {macro_df.shape}")

# ── 3. EQUITY DATA VIA YFINANCE ──────────────────────────────────────────────

TICKERS = [
    "SPY",   # S&P 500 benchmark
    "XLK",   # Technology
    "XLF",   # Financials
    "XLE",   # Energy
    "XLV",   # Health Care
    "XLU",   # Utilities
    "XLB",   # Materials
    "XLI",   # Industrials
    "XLP",   # Consumer Staples
    "XLY",   # Consumer Discretionary
]

print("\nPulling equity data from yfinance...")
raw_prices = yf.download(TICKERS, start=START, interval="1mo", auto_adjust=True, progress=False)["Close"]

# Compute month-over-month percentage returns
equity_returns = raw_prices.pct_change().dropna(how="all")

# Resample to month-end to align with FRED
equity_returns.index = equity_returns.index.to_period("M").to_timestamp("M")

print(f"  equity data shape: {equity_returns.shape}")

# ── 4. MERGE INTO COMBINED DATASET ───────────────────────────────────────────

combined = macro_df.join(equity_returns, how="inner")
print(f"\nCombined dataset shape: {combined.shape}")
print(f"Date range: {combined.index[0].date()} to {combined.index[-1].date()}")
print(f"Missing values:\n{combined.isnull().sum()}")

# ── 5. SAVE TO CSV ───────────────────────────────────────────────────────────

os.makedirs("data/raw", exist_ok=True)

macro_df.to_csv("data/raw/macro_indicators.csv")
equity_returns.to_csv("data/raw/equity_returns.csv")
combined.to_csv("data/raw/combined.csv")

print("\nSaved:")
print("  data/raw/macro_indicators.csv")
print("  data/raw/equity_returns.csv")
print("  data/raw/combined.csv")
print("\nDone.")