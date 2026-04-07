import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
import os

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
plt.show()
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
plt.show()
print("Saved regime_heatmap.png")