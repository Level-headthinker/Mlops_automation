import mlflow
import mlflow.sklearn
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score
import sys
sys.path.append('.')
from src.preprocessing.preprocess import preprocess
from src.db import save_run

mlflow.set_experiment("parkinsons-detector")

def train():
    X, y = preprocess()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    with mlflow.start_run():
        # Random Forest works better for medical data
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        model.fit(X_train, y_train)

        preds = model.predict(X_test)
        acc = accuracy_score(y_test, preds)
        f1  = f1_score(y_test, preds)

        mlflow.log_param("model", "RandomForest")
        mlflow.log_param("n_estimators", 100)
        mlflow.log_param("max_depth", 10)
        mlflow.log_metric("accuracy", acc)
        mlflow.log_metric("f1_score", f1)
        mlflow.sklearn.log_model(model, "model")

        with open('models/model.pkl', 'wb') as f:
            pickle.dump(model, f)

        save_run(mlflow.active_run().info.run_id, acc, f1)

        print(f"✅ Accuracy: {acc:.4f} | F1: {f1:.4f}")
        print(f"Run ID: {mlflow.active_run().info.run_id}")

if __name__ == '__main__':
    train()