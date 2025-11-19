import joblib
import numpy as np
import pandas as pd
import argparse

artifacts = joblib.load("extraneous_model.pkl")
model        = artifacts["model"]
scaler       = artifacts["scaler"]
poly         = artifacts["poly"]
feature_cols = artifacts["feature_cols"]
rel_stats    = artifacts["rel_stats"]
global_q90   = artifacts["global_q90"]
global_q95   = artifacts["global_q95"]


def preprocess_new_row(row):
    df = pd.DataFrame([row])

    cat = df.loc[0, "Category"]
    if cat in rel_stats:
        rel_mean = rel_stats[cat]["rel_mean"]
        rel_std  = rel_stats[cat]["rel_std"]
    else:
        rel_mean = np.mean([v["rel_mean"] for v in rel_stats.values()])
        rel_std  = np.mean([v["rel_std"] for v in rel_stats.values()])

    if rel_std == 0 or np.isnan(rel_std):
        z_related = 0.0
    else:
        z_related = (df.loc[0, "Amount"] - rel_mean) / rel_std

    is_large_global = int(df.loc[0, "Amount"] > global_q90)
    is_very_large_global = int(df.loc[0, "Amount"] > global_q95)

    month_cat_share = 0.0
    category_freq   = 1.0

    feature_values = {
        "Amount": df.loc[0, "Amount"],
        "z_amount_related": z_related,
        "is_large_global": is_large_global,
        "is_very_large_global": is_very_large_global,
        "month_cat_share": month_cat_share,
        "category_freq": category_freq,
    }

    X = np.array([[feature_values[col] for col in feature_cols]], dtype=float)
    X_scaled = scaler.transform(X)
    X_poly   = poly.transform(X_scaled)
    return X_poly


def predict_purchase(row, threshold=0.5):
    X_prepared = preprocess_new_row(row)
    prob = model.predict_proba(X_prepared)[0, 1]
    label = int(prob >= threshold)
    return label


def parse_args():
    parser = argparse.ArgumentParser(description="Predict whether a purchase is extraneous.")
    parser.add_argument("--amount", type=float, required=True, help="Amount of the purchase")
    parser.add_argument("--category", type=str, required=True, help="Category name")
    parser.add_argument("--merchant", type=str, required=True, help="Merchant name")
    parser.add_argument("--date", type=str, default="2024-01-01", help="Optional date")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    row = {
        "Amount": args.amount,
        "Category": args.category,
        "Merchant": args.merchant,
        "Date": args.date,
    }

    print(predict_purchase(row))
    