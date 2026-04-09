from ucimlrepo import fetch_ucirepo
import pandas as pd

parkinsons = fetch_ucirepo(id=174)
df = parkinsons.data.features
df['status'] = parkinsons.data.targets
df.to_csv('data/parkinsons.csv', index=False)
print(f"✅ Downloaded {len(df)} records")
print(df.head())