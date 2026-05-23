import warnings

import pandas as pd
from sklearn.preprocessing import StandardScaler

from feature_extractor import FEATURE_NAMES, extract_features
from model_loader import legacy_predict, load_pickle_model

warnings.filterwarnings("ignore")

CSV = r"C:\Users\LENOVO\Desktop\phishing.csv"
df = pd.read_csv(CSV)
df = df.drop(["Index"], axis=1, errors="ignore")
df.drop_duplicates(inplace=True)
drop_cols = [
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
df.drop(columns=drop_cols, inplace=True, errors="ignore")
X = df.drop(["class"], axis=1)
print("columns match:", list(X.columns) == FEATURE_NAMES)

url = "http://paypa1-secure-login.tk/verify?user=victim&token=abc123"
raw = [extract_features(url)]
scaler = StandardScaler().fit(X)
scaled = scaler.transform(raw)

m = load_pickle_model("Phishing_model.pkl")
pred_raw, proba_raw = legacy_predict(m, raw)
pred_scaled, proba_scaled = legacy_predict(m, scaled)

print("RAW features sum:", sum(raw[0]))
print("RAW prediction:", pred_raw[0], "proba:", proba_raw[0])
print("SCALED prediction:", pred_scaled[0], "proba:", proba_scaled[0])
