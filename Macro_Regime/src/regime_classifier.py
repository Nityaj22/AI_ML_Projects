import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.mixture import GaussianMixture
import os

#Load scaled data
features = pd.read_csv(
     r"W:\AI_ML_Projects\Macro_Regime\data\processed\features.csv",
    index_col=0,
    parse_dates=True
)

#Load unscaled data for interpretation
features_unscaled = pd.read_csv(
    r"W:\AI_ML_Projects\Macro_Regime\data\processed\features_unscaled.csv",
    index_col=0,
    parse_dates=True
)

print(f"Loaded features: {features.shape}")
print(features.head())

#Test GMM with diff num of components
bic_scores=[]
n_components_range = range(2,8)
for n in n_components_range:
    gmm = GaussianMixture(
        n_components=n, 
        covariance_type='full',
         random_state=42,
         n_init=10
    )
    gmm.fit(features)
    bic_scores.append(gmm.bic(features))
    print(f" n={n}, BIC={gmm.bic(features):.1f}")

#Plot BIC scores
plt.figure(figsize=(8,4))
plt.plot(list(n_components_range), bic_scores, marker='o', color="steelblue", linewidth=2)
plt.xlabel("Number of Regimes")
plt.ylabel("BIC Score")
plt.title("BIC Score vs Number of Regimes (lower = better)")
plt.xticks(list(n_components_range))
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig(r"W:\AI_ML_Projects\Macro_Regime\outputs\charts\bic_scores.png", dpi=150)
plt.show()
print("Saved BIC chart")

##Traim GMM with 4 regimes (optimal)
gmm = GaussianMixture(
    n_components=4, 
    covariance_type='full', 
    random_state=42,
    n_init=10
)
gmm.fit(features)

#Assign regime labels to each month
regime_labels = gmm.predict(features)
regime_probs = gmm.predict_proba(features)

#Add to df
features_unscaled["regime"] = regime_labels
print("Regime distribution:")
print(features_unscaled["regime"].value_counts().sort_index())

# Compute mean of each feature per regime (unscaled = interpretable)
regime_profiles = features_unscaled.groupby("regime")[
    ["yield_curve", "cpi_yoy", "unemployment_change", "indpro_yoy", "credit_spread"]
].mean().round(4)
pd.set_option("display.max_columns", None)
print("Regime profiles (unscaled means):")
print(regime_profiles)

#Map numeric labels to meaningful names
regime_map = {
    0: "Slowdown",
    1: "Expansion",
    2: "Recession",
    3: "Stagflation"
}

features_unscaled["regime_label"] = features_unscaled["regime"].map(regime_map)

# Save labeled dataset
os.makedirs(r"W:\AI_ML_Projects\Macro_Regime\data\processed", exist_ok=True)
features_unscaled.to_csv(r"W:\AI_ML_Projects\Macro_Regime\data\processed\regime_labels.csv")

# Save regime probabilities
prob_df = pd.DataFrame(
    regime_probs,
    index=features.index,
    columns=[f"prob_{regime_map[i]}" for i in range(4)]
)
prob_df.to_csv(r"W:\AI_ML_Projects\Macro_Regime\data\processed\regime_probabilities.csv")

print("Regime counts:")
print(features_unscaled["regime_label"].value_counts())
print(f"\nCurrent regime (latest month):")
print(f"  {features_unscaled['regime_label'].iloc[-1]} ({features_unscaled.index[-1].date()})")
print(f"\nSaved regime_labels.csv and regime_probabilities.csv")