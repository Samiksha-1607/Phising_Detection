"""Match notebook preprocessing: raw features -> scaled matrix for the model."""

import os
import pickle

import numpy as np
import pandas as pd

from feature_extractor import FEATURE_NAMES, extract_features

_scaler_bundle = None


def load_scaler():
    global _scaler_bundle
    if _scaler_bundle is not None:
        return _scaler_bundle

    path = os.path.join(os.path.dirname(__file__), "scaler.pkl")
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"scaler.pkl not found at {path}. Run: python build_scaler.py"
        )
    with open(path, "rb") as f:
        _scaler_bundle = pickle.load(f)
    return _scaler_bundle


def raw_features_to_model_input(feature_vector: list[int]) -> np.ndarray:
    """Scale raw {-1,0,1} features the same way as the training notebook."""
    bundle = load_scaler()
    scaler = bundle["scaler"]
    columns = bundle["feature_columns"]

    if list(columns) != FEATURE_NAMES:
        raise ValueError(
            f"Feature column order mismatch.\nExpected: {FEATURE_NAMES}\nGot: {columns}"
        )

    row = pd.DataFrame([feature_vector], columns=columns)
    scaled = scaler.transform(row)
    return scaled.astype(np.float32)
