from models.predict import predict_crop
from models.moisture import estimate_moisture
from models.weather import get_weather
from utils.coordinate_converter import get_coordinates


def generate_report(parcel_id, latitude=None, longitude=None):

    prediction = predict_crop(parcel_id)

    crop_name = prediction["crop_name"]
    confidence = prediction["confidence"]

    if latitude is None or longitude is None:
        latitude, longitude = get_coordinates(parcel_id)

    weather = get_weather(latitude, longitude)

    moisture = estimate_moisture(parcel_id)

    if moisture >= 70:
        english = "No irrigation required."
        hindi = "सिंचाई की आवश्यकता नहीं है।"

    elif moisture >= 50:

        if weather["rain"] > 0:
            english = "Rain detected. Delay irrigation."
            hindi = "बारिश की संभावना है। सिंचाई कुछ समय बाद करें।"

        else:
            english = "Monitor the field. Irrigate if dry conditions continue."
            hindi = "खेत की निगरानी करें। यदि सूखा बना रहे तो सिंचाई करें।"

    else:

        if weather["rain"] > 0:
            english = "Rain expected. Wait before irrigating."
            hindi = "बारिश की संभावना है। सिंचाई करने से पहले प्रतीक्षा करें।"

        else:
            english = "Immediate irrigation recommended."
            hindi = "तुरंत सिंचाई करने की सलाह दी जाती है।"

    return {
        "label": prediction["label"],
        "crop_name": crop_name,
        "confidence": confidence,
        "latitude": latitude,
        "longitude": longitude,
        "moisture": moisture,
        "temperature": weather["temperature"],
        "humidity": weather["humidity"],
        "rain": weather["rain"],
        "english": english,
        "hindi": hindi,
    }


# Keep old name as alias so any other code calling smart_advisor still works
smart_advisor = generate_report
