from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

from models.feature_extractor import *

features = extract_features(10011413)

print("Number of Features:", len(features))

for k, v in list(features.items())[:15]:
    print(k, ":", v)