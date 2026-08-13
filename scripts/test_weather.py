from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

from models.weather import get_weather

# Jaipur coordinates
weather = get_weather(26.9124, 75.7873)

print("\n==============================")
print("      WEATHER REPORT")
print("==============================\n")

print(weather)

print("\n==============================") 