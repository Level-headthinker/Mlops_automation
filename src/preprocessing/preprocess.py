import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pickle, os

def preprocess(filepath='data/parkinsons.csv'):
    df = pd.read_csv(filepath)

    # Drop name column - not a feature
    if 'name' in df.columns:
        df = df.drop(columns=['name'])

    # Features and target
    X = df.drop(columns=['status'])
    y = df['status'].values

    # Scale features - important for medical data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Save scaler
    os.makedirs('models', exist_ok=True)
    with open('models/scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)

    # Save feature names
    with open('models/features.pkl', 'wb') as f:
        pickle.dump(list(X.columns), f)

    print(f"✅ Preprocessed {len(df)} patient records")
    print(f"✅ Parkinson's positive: {y.sum()} | Healthy: {len(y) - y.sum()}")
    return X_scaled, y

if __name__ == '__main__':
    X, y = preprocess()
    print("Shape:", X.shape)
    