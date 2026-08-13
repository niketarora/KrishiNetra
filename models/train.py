from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent.parent

# -----------------------------
# Load Dataset
# -----------------------------

df = pd.read_csv(ROOT / "outputs" / "features.csv")

print("Dataset Shape :", df.shape)

# -----------------------------
# Remove classes with only one sample
# -----------------------------

counts = df["label"].value_counts()

valid_labels = counts[counts >= 2].index

df = df[df["label"].isin(valid_labels)]

print("Dataset After Cleaning :", df.shape)

# -----------------------------
# Features & Labels
# -----------------------------

X = df.drop(columns=["label"])
y = df["label"]

# -----------------------------
# Train/Test Split
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# -----------------------------
# Model
# -----------------------------

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

print("\nTraining Model...\n")

model.fit(X_train, y_train)

print("Training Complete!\n")

# -----------------------------
# Prediction
# -----------------------------

pred = model.predict(X_test)

# -----------------------------
# Accuracy
# -----------------------------

accuracy = accuracy_score(y_test, pred)

print("Accuracy :", accuracy)

print("\nClassification Report\n")

print(classification_report(y_test, pred))

print("\nConfusion Matrix\n")

print(confusion_matrix(y_test, pred))

# -----------------------------
# Save Model
# -----------------------------

joblib.dump(
    model,
    ROOT / "outputs" / "crop_classifier.pkl"
)

print("\nModel Saved Successfully!")