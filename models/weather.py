import json
import urllib.request


def get_weather(latitude, longitude):
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={latitude}"
            f"&longitude={longitude}"
            f"&current=temperature_2m,relative_humidity_2m,rain"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "KrishiNetra/1.0"})
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                current = data.get("current", {})
                return {
                    "temperature": current.get("temperature_2m", 28.5),
                    "humidity": current.get("relative_humidity_2m", 65),
                    "rain": current.get("rain", 0.0)
                }
    except Exception:
        pass

    return {
        "temperature": 28.5,
        "humidity": 65,
        "rain": 0.0
    }