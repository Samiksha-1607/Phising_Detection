"""
Rebuild StandardScaler using the same steps as the training notebook.
Run once after updating phishing.csv:

    python build_scaler.py
"""

import os
import pickle

import pandas as pd
from sklearn.preprocessing import StandardScaler

DROP_COLS = [
    "LongURL",
    "Symbol@",
    "ShortURL",
    "Redirecting//",
    "DomainRegLen",
    "Favicon",
    "UsingPopupWindow",
    "IframeRedirection",
    "LinksPointingToPage",
]


def load_training_frame(csv_path: str) -> pd.DataFrame:
    """Replicate notebook steps before StandardScaler (uses df, not df_cleaned)."""
    df = pd.read_csv(csv_path)
    df = df.drop(["Index"], axis=1, errors="ignore")
    df.drop_duplicates(inplace=True)
    df.drop(columns=DROP_COLS, inplace=True, errors="ignore")
    return df


def main():
    root = os.path.dirname(os.path.dirname(__file__))
    csv_path = os.path.join(root, "phishing.csv")
    if not os.path.exists(csv_path):
        csv_path = os.path.join(os.path.dirname(__file__), "phishing.csv")

    if not os.path.exists(csv_path):
        raise FileNotFoundError("phishing.csv not found in project root or backend/")

    df = load_training_frame(csv_path)
    feature_cols = [c for c in df.columns if c != "class"]

    scaler = StandardScaler()
    scaler.fit(df[feature_cols])

    out_path = os.path.join(os.path.dirname(__file__), "scaler.pkl")
    with open(out_path, "wb") as f:
        pickle.dump({"scaler": scaler, "feature_columns": feature_cols}, f)

    print(f"Saved scaler to {out_path}")
    print(f"Features ({len(feature_cols)}): {feature_cols}")
    print(f"Rows used: {len(df)}")


if __name__ == "__main__":
    main()
