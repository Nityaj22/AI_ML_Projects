import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
import os

# Load unscaled features for indicator readout
features_unscaled = pd.read_csv(
    r"W:\AI_ML_Projects\Macro_Regime\data\processed\features_unscaled.csv",
    index_col=0,
    parse_dates=True
)

#Load labelled regimes
regimes = pd.read_csv(
     r"W:\AI_ML_Projects\Macro_Regime\data\processed\regime_labels.csv",
    index_col=0,
    parse_dates=True
)

#Load regime probabilities
probs = pd.read_csv(
    r"W:\AI_ML_Projects\Macro_Regime\data\processed\regime_probabilities.csv",
    index_col=0,
    parse_dates=True
)

# Load raw equity returns for sector analysis
equity = pd.read_csv(
    r"W:\AI_ML_Projects\Macro_Regime\data\raw\equity_returns.csv",
    index_col=0,
    parse_dates=True
)

#Regime colors
REGIME_COLORS = {
    "Expansion":   "#2ecc71",   # green
    "Slowdown":    "#f39c12",   # orange
    "Recession":   "#e74c3c",   # red
    "Stagflation": "#9b59b6"    # purple
}

os.makedirs(r"W:\AI_ML_Projects\Macro_Regime\outputs\charts", exist_ok=True)

print(f"Regimes: {regimes.shape}")
print(f"Probs: {probs.shape}")
print(f"Equity: {equity.shape}")


fig, ax = plt.subplots(figsize=(14, 7))

#Shade background by regime for each month
for date, row in regimes.iterrows():
    ax.axvspan(
        date,
        date + pd.offsets.MonthEnd(1),
        alpha=0.4,
        color=REGIME_COLORS[row["regime_label"]],
        linewidth=0
    )

# Plot yield curve on top for context
ax.plot(regimes.index, regimes["yield_curve"], color="black", linewidth=1, label="Yield Curve")
ax.axhline(0, color="black", linewidth=0.5, linestyle="--")

# Legend
patches = [mpatches.Patch(color=color, label=label, alpha=0.6)
           for label, color in REGIME_COLORS.items()]
ax.legend(handles=patches, loc="upper right", fontsize=9)

ax.set_title("Macroeconomic Regime Timeline (1996–2026)", fontsize=14, fontweight="bold")
ax.set_xlabel("Date")
ax.set_ylabel("Yield Curve Spread")
plt.tight_layout()
plt.savefig(r"W:\AI_ML_Projects\Macro_Regime\outputs\charts\regime_timeline.png", dpi=150)
#plt.show()
print("Saved regime_timeline.png")

regime_means = regimes.groupby("regime_label")[
    ["yield_curve", "cpi_yoy", "unemployment_change", "indpro_yoy", "credit_spread"]
].mean()

# Rename columns for readability
regime_means.columns = ["Yield Curve", "CPI YoY", "Unemp Change", "INDPRO YoY", "Credit Spread"]

# Reorder rows logically
regime_means = regime_means.loc[["Expansion", "Slowdown", "Stagflation", "Recession"]]


# Normalize each column for relative coloring
regime_means_normalized = (regime_means - regime_means.mean()) / regime_means.std()

# Flip columns where higher = bad (so red = bad, green = good consistently)
regime_means_normalized["Unemp Change"] = -regime_means_normalized["Unemp Change"]
regime_means_normalized["Credit Spread"] = -regime_means_normalized["Credit Spread"]

fig, ax = plt.subplots(figsize=(10, 4))
sns.heatmap(
    regime_means_normalized,
    annot=regime_means.round(3),
    fmt="",
    cmap="RdYlGn",
    center=0,
    linewidths=0.5,
    ax=ax
)
ax.set_title("Regime Profiles — Feature Heatmap (color = relative, numbers = actual)", fontsize=13, fontweight="bold")
ax.set_xlabel("")
ax.set_ylabel("")
plt.tight_layout()
plt.savefig(r"W:\AI_ML_Projects\Macro_Regime\outputs\charts\regime_heatmap.png", dpi=150)
#plt.show()
print("Saved regime_heatmap.png")

# Merge equity returns with regime labels
equity_labeled = equity.join(regimes[["regime_label"]], how="inner")

# Compute mean monthly return per sector per regime
sector_cols = [col for col in equity.columns if col != "SPY"]
returns_by_regime = equity_labeled.groupby("regime_label")[sector_cols + ["SPY"]].mean() * 100

print("Mean monthly returns (%) by regime:")
print(returns_by_regime.round(3))

fig, axes = plt.subplots(2, 2, figsize=(14, 8), sharey=False)
axes = axes.flatten()

regime_order = ["Expansion", "Slowdown", "Stagflation", "Recession"]

for i, regime in enumerate(regime_order):
    ax = axes[i]
    data = returns_by_regime.loc[regime].sort_values(ascending=False)
    colors = ["#2ecc71" if v >= 0 else "#e74c3c" for v in data.values]
    ax.bar(data.index, data.values, color=colors, edgecolor="white", linewidth=0.5)
    ax.axhline(0, color="black", linewidth=0.8)
    ax.set_title(f"{regime}", fontsize=12, fontweight="bold",
                 color=REGIME_COLORS[regime])
    ax.set_ylabel("Avg Monthly Return (%)")
    ax.set_xlabel("")
    ax.tick_params(axis="x", rotation=45)
    ax.grid(axis="y", alpha=0.3)

plt.suptitle("Average Monthly Sector Returns by Regime", fontsize=14, fontweight="bold")
plt.tight_layout()
plt.savefig(r"W:\AI_ML_Projects\Macro_Regime\outputs\charts\sector_returns.png", dpi=150)
print("Saved sector_returns.png")

#Current:
# Get the most recent month
latest_date = regimes.index[-1]
latest_regime = regimes["regime_label"].iloc[-1]
latest_probs = probs.iloc[-1]

print("=" * 45)
print(f"  MACRO REGIME DASHBOARD")
print(f"  As of: {latest_date.strftime('%B %Y')}")
print("=" * 45)
print(f"  Current Regime: {latest_regime}")
print("-" * 45)
print("  Regime Probabilities:")
for col in latest_probs.index:
    regime_name = col.replace("prob_", "")
    prob = latest_probs[col] * 100
    bar = "█" * int(prob / 5)
    print(f"  {regime_name:<12} {prob:5.1f}%  {bar}")
print("-" * 45)
print("  Current Macro Indicators:")
latest_indicators = features_unscaled.iloc[-1]
print(f"  Yield Curve:    {latest_indicators['yield_curve']:.3f}")
print(f"  CPI YoY:        {latest_indicators['cpi_yoy']*100:.2f}%")
print(f"  Unemp Change:   {latest_indicators['unemployment_change']:+.1f}")
print(f"  INDPRO YoY:     {latest_indicators['indpro_yoy']*100:.2f}%")
print(f"  Credit Spread:  {latest_indicators['credit_spread']:.2f}")
print("=" * 45)