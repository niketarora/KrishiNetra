from models.moisture import estimate_moisture
from models.predict import predict_crop


def irrigation_advice(parcel_id):

    prediction = predict_crop(parcel_id)

    crop = prediction["crop_name"]

    moisture = estimate_moisture(parcel_id)

    if moisture >= 70:
        risk = "Low"
        advice = "No irrigation required."

    elif moisture >= 50:
        risk = "Medium"
        advice = "Monitor the field. Irrigate if no rainfall is expected."

    else:
        risk = "High"
        advice = "Immediate irrigation recommended."

    return {
        "crop": crop,
        "moisture": moisture,
        "risk": risk,
        "advice": advice
    }