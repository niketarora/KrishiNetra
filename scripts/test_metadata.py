import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

df = pd.read_csv(ROOT/"data"/"PASTIS-R_PixelSet"/"metadata_parcel.csv")

print(df.head())
print(df.columns)
print(df.shape) 