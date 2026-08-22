import json
import time
import urllib.request

_weather_cache = {}


def get_weather(latitude, longitude):
    try:
        lat = round(float(latitude), 2)
        lon = round(float(longitude), 2)
        key = (lat, lon)
        now = time.time()

        if key in _weather_cache:
            cached_data, expiry = _weather_cache[key]
            if now < expiry:
                return cached_data

        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={latitude}"
            f"&longitude={longitude}"
            f"&current=temperature_2m,relative_humidity_2m,rain"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "KrishiNetra/1.0"})
        with urllib.request.urlopen(req, timeout=2.0) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                current = data.get("current", {})
                result = {
                    "temperature": current.get("temperature_2m", 28.5),
                    "humidity": current.get("relative_humidity_2m", 65),
                    "rain": current.get("rain", 0.0)
                }
                _weather_cache[key] = (result, now + 300)  # cache for 5 min
                return result
    except Exception:
        pass

    return {
        "temperature": 28.5,
        "humidity": 65,
        "rain": 0.0
    }
