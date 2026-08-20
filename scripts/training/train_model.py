from pathlib import Path
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent.parent.parent

# -----------------------------
# Load Dataset
# -----------------------------

csv_path = ROOT / "data" / "generated" / "features.csv"
if not csv_path.exists() and (ROOT / "outputs" / "features.csv").exists():
    csv_path = ROOT / "outputs" / "features.csv"

df = pd.read_csv(csv_path)

print("Dataset Path  :", csv_path)
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
# Evaluation
# -----------------------------

pred = model.predict(X_test)
accuracy = accuracy_score(y_test, pred)

print("Accuracy :", accuracy)
print("\nClassification Report\n")
print(classification_report(y_test, pred))
print("\nConfusion Matrix\n")
print(confusion_matrix(y_test, pred))

# -----------------------------
# Save Model Artifact
# -----------------------------

model_dir = ROOT / "models"
model_dir.mkdir(parents=True, exist_ok=True)
output_model_path = model_dir / "crop_classifier.pkl"

joblib.dump(model, output_model_path)
print(f"\nModel Saved Successfully to {output_model_path}!")
