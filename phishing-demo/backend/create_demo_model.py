"""
Optional helper: creates a compatible Phishing_model.pkl for local demo
if you do not have the original trained file yet.

Run from backend/:  python create_demo_model.py
"""

import pickle

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier

from feature_extractor import extract_features

PHISHING_URL = (
    "http://paypa1-secure-login.tk/verify?user=victim&token=abc123"
)
LEGIT_URL = "https://www.paypal.com/signin"

X = []
y = []

# Synthetic training rows: phishing-like vs legitimate patterns
for _ in range(40):
    X.append(extract_features(PHISHING_URL))
    y.append(-1)
    X.append(extract_features(LEGIT_URL))
    y.append(1)

# Add slight variations
variants_phish = [
    "http://192.168.1.1/login",
    "http://secure-bank-update.tk/verify",
    "http://account-verify.ml/confirm",
]
variants_legit = [
    "https://www.google.com",
    "https://github.com/login",
    "https://accounts.microsoft.com",
]

for u in variants_phish:
    X.append(extract_features(u))
    y.append(-1)
for u in variants_legit:
    X.append(extract_features(u))
    y.append(1)

model = GradientBoostingClassifier(random_state=42)
model.fit(np.array(X), np.array(y))

out_path = "Phishing_model.pkl"
with open(out_path, "wb") as f:
    pickle.dump(model, f)

print(f"Wrote demo model to {out_path}")
print(f"Sample prediction (phishing URL): {model.predict([extract_features(PHISHING_URL)])[0]}")
