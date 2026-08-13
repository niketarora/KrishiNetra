from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

from models.loader import *

parcel = 10011413

s2 = load_s2(parcel)
s1a = load_s1a(parcel)
s1d = load_s1d(parcel)
meta = load_metadata(parcel)

print("S2:", s2.shape)
print("S1A:", s1a.shape)
print("S1D:", s1d.shape)

print()
print(meta)