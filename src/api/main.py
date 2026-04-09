from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle, sys, os
sys.path.append('.')
from src.db import get_pg, save_run
from datetime import datetime
import subprocess
import numpy as np
import json
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_model():
    with open('models/model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('models/scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    with open('models/features.pkl', 'rb') as f:
        features = pickle.load(f)
    return model, scaler, features

# Input — all 22 voice features
from pydantic import BaseModel, Field

class PatientInput(BaseModel):
    patient_name: str = "Unknown"
    patient_id:   str = "P000"
    MDVP_Fo:       float = Field(alias="MDVP:Fo")
    MDVP_Fhi:      float = Field(alias="MDVP:Fhi")
    MDVP_Flo:      float = Field(alias="MDVP:Flo")
    MDVP_Jitter:   float = Field(alias="MDVP:Jitter")
    MDVP_Jitter1:  float = Field(alias="MDVP:Jitter.1")
    MDVP_RAP:      float = Field(alias="MDVP:RAP")
    MDVP_PPQ:      float = Field(alias="MDVP:PPQ")
    Jitter_DDP:    float = Field(alias="Jitter:DDP")
    MDVP_Shimmer:  float = Field(alias="MDVP:Shimmer")
    MDVP_Shimmer1: float = Field(alias="MDVP:Shimmer.1")
    Shimmer_APQ3:  float = Field(alias="Shimmer:APQ3")
    Shimmer_APQ5:  float = Field(alias="Shimmer:APQ5")
    MDVP_APQ:      float = Field(alias="MDVP:APQ")
    Shimmer_DDA:   float = Field(alias="Shimmer:DDA")
    NHR:           float
    HNR:           float
    RPDE:          float
    DFA:           float
    spread1:       float
    spread2:       float
    D2:            float
    PPE:           float

    class Config:
        populate_by_name = True   

# 1. Health check
@app.get("/")
def root():
    return {"status": "NeuroOps API running"}


@app.post("/predict")
def predict(data: PatientInput):
    print("✅ Received data:", data.model_dump())
    model, scaler, features = load_model()

    data_dict = data.model_dump(by_alias=True)
    input_data = np.array([[data_dict[f] for f in features]])

    input_scaled = scaler.transform(input_data)
    prediction   = model.predict(input_scaled)[0]
    confidence   = float(model.predict_proba(input_scaled).max())
    label        = "parkinsons" if prediction == 1 else "healthy"

    conn = get_pg()
    cur  = conn.cursor()
    cur.execute("""
        INSERT INTO predictions (input_text, prediction, confidence, patient_name, patient_id)
        VALUES (%s, %s, %s, %s, %s)
    """, (json.dumps(data.model_dump()), label, confidence, data.patient_name, data.patient_id))
    conn.commit()
    cur.close()
    conn.close()

    return {
        "prediction": label,
        "confidence": round(confidence, 4),
        "risk_level": "High Risk" if label == "parkinsons" else "Low Risk"
    }
# 3. Get metrics
@app.get("/metrics")
def metrics():
    conn = get_pg()
    cur  = conn.cursor()
    cur.execute("""
        SELECT run_id, accuracy, f1_score, trained_at
        FROM model_runs ORDER BY trained_at DESC LIMIT 10
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"runs": [
        {"run_id": r[0], "accuracy": r[1], "f1": r[2], "trained_at": str(r[3])}
        for r in rows
    ]}

# 4. Get predictions log
@app.get("/predictions")
def get_predictions():
    conn = get_pg()
    cur  = conn.cursor()
    cur.execute("""
    SELECT patient_id, patient_name, prediction, confidence, predicted_at
    FROM predictions ORDER BY predicted_at DESC LIMIT 20
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"predictions": [
    {"id": r[0], "name": r[1], "prediction": r[2], 
     "confidence": r[3], "time": str(r[4])}
    for r in rows
    ]}

# 5. Check drift
@app.get("/check-drift")
def check_drift():
    conn = get_pg()
    cur  = conn.cursor()
    cur.execute("""
        SELECT AVG(confidence) FROM predictions
        WHERE predicted_at > NOW() - INTERVAL '1 hour'
    """)
    recent_avg = cur.fetchone()[0]

    if recent_avg is None:
        cur.close()
        conn.close()
        return {"drift_detected": False, "message": "No recent predictions"}

    drift = recent_avg < 0.75

    cur.execute("""
        INSERT INTO drift_scores (accuracy_recent, drift_detected)
        VALUES (%s, %s)
    """, (float(recent_avg), drift))
    conn.commit()
    cur.close()
    conn.close()

    return {
        "drift_detected":     drift,
        "recent_confidence":  round(float(recent_avg), 4)
    }

# 6. Trigger retraining
@app.post("/retrain")
def retrain():
    subprocess.Popen(["python", "src/training/train.py"])
    return {"message": "Retraining started", "time": str(datetime.now())}

# 7. Log retrain
@app.post("/log-retrain")
def log_retrain():
    conn = get_pg()
    cur  = conn.cursor()
    cur.execute("""
        INSERT INTO drift_scores (accuracy_recent, drift_detected)
        VALUES (%s, %s)
    """, (0.0, True))
    conn.commit()
    cur.close()
    conn.close()
    print(f"🔄 Retraining logged at {datetime.now()}")
    return {"message": "Retraining logged"} 