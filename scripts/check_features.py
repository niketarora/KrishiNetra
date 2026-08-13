from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent

df = pd.read_csv(ROOT / "outputs" / "features.csv")

print("Shape:", df.shape)

print("\nNaN values:")
print(df.isna().sum().sum())

print("\nInfinity values:")
print(np.isinf(df.select_dtypes(include=[float, int])).sum().sum())

print("\nLargest value:")
print(df.max(numeric_only=True).max())

print("\nSmallest value:")
print(df.min(numeric_only=True).min())