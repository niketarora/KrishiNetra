from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT))

from agriculture.weather import get_weather

LAT = 26.9124
LON = 75.7873

weather = get_weather(LAT, LON)

print("\n==============================")
print("        WEATHER TEST")
print("==============================\n")

print("Latitude    :", LAT)
print("Longitude   :", LON)
print("Temperature :", weather["temperature"], "°C")
print("Humidity    :", weather["humidity"], "%")
print("Rainfall    :", weather["rain"], "mm")

print("\n==============================")
assert "temperature" in weather
assert "humidity" in weather
assert "rain" in weather
print("TEST WEATHER PASSED!")
