from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT))

from agriculture.coordinate_converter import get_coordinates

coords = get_coordinates(10011413)
print("Coordinates for parcel 10011413:", coords)
assert coords is not None and len(coords) == 2
print("TEST METADATA / COORDINATES PASSED!")
