import pandas as pd
import numpy as np 
from sklearn.preprocessing import StandardScaler
import os

#Load raw combined data
df = pd.read_csv(r"W:\AI_ML_Projects\Macro_Regime\data\raw\combined.csv", index_col=0, parse_dates=True)
print(f"Loaded data: {df.shape}")
print (df.head())

#CPI
df["cpi_yoy"] = df["cpi"].pct_change(12)

#INDPRO
df["indpro_yoy"] = df["indpro"].pct_change(12)

print(df[["cpi", "cpi_yoy", "indpro", "indpro_yoy"]].tail(10))

#Unemployment
df["unemployment_change"] = df["unemployment"].diff(1)
print(df[["unemployment", "unemployment_change"]].tail(10))

#Select final features
features = df[[
    "yield_curve",
    "cpi_yoy",
    "unemployment_change",
    "indpro_yoy",
    "credit_spread",
]].copy()

#Drop rows with NaN
features = features.dropna()

print(f"Features shape: {features.shape}")
print(f"Date Range: {features.index[0].date()} to {features.index[-1].date()}")
print(features.describe())

#Standardize features
scaler = StandardScaler()
features_scaled = pd.DataFrame(
    scaler.fit_transform(features),
    index=features.index,
    columns=features.columns
)

print("After standardization:")
print(features_scaled.describe().round(2))

# Save
os.makedirs(r"W:\AI_ML_Projects\Macro_Regime\data\processed", exist_ok=True)
features_scaled.to_csv(r"W:\AI_ML_Projects\Macro_Regime\data\processed\features.csv")
features.to_csv(r"W:\AI_ML_Projects\Macro_Regime\data\processed\features_unscaled.csv")

print(f"\nSaved features.csv and features_unscaled.csv to data/processed/")
print("Done.")