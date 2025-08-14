import argparse
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib

def train(data_csv: str, out_path: str):
    # --- Load dataset ---
    df = pd.read_csv(data_csv)
    df = df.dropna(subset=["text", "emotion"]).reset_index(drop=True)
    df["text"] = df["text"].astype(str)
    df["emotion"] = df["emotion"].astype(str)

    # --- Train/test split ---
    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["emotion"],
        test_size=0.2, random_state=42,
        stratify=df["emotion"]
    )

    # --- Model pipeline ---
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            stop_words=None,      # keep all words for more nuance
            ngram_range=(1, 2),   # unigrams + bigrams
            max_df=0.98,          # keep rare words
            min_df=1
        )),
        ("clf", LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            solver="liblinear",   # robust for small datasets
            n_jobs=-1
        ))
    ])

    # --- Train ---
    pipe.fit(X_train, y_train)

    # --- Evaluate ---
    y_pred = pipe.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n✅ Accuracy: {acc:.2%}\n")
    print(classification_report(y_test, y_pred))

    # --- Save model ---
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    joblib.dump({
        "pipeline": pipe,
        "classes": pipe.named_steps["clf"].classes_.tolist()
    }, out_path)
    print(f"💾 Model saved to: {out_path}")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True, help="Path to CSV with columns: text,emotion")
    ap.add_argument("--out", required=True, help="Output path for model .pkl")
    args = ap.parse_args()

    train(args.data, args.out)
