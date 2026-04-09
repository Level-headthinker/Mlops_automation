# NeuroOps 🧠
### Self-Healing Parkinson's Disease Detection Pipeline

A production-grade MLOps system that automatically detects Parkinson's disease from patient voice measurements, monitors its own performance, and retrains itself when accuracy degrades — without any human intervention.

---

## 🎯 What This Project Does

1. Doctor enters patient voice measurements into the dashboard
2. AI model predicts → Healthy ✅ or Parkinson's Detected ⚠️
3. Every prediction is logged automatically
4. System monitors prediction confidence every 6 hours
5. If confidence drops → retraining triggers automatically
6. New model replaces old one → system heals itself
7. Dashboard shows everything live

---

## 🏗️ System Architecture
Patient Voice Data
↓
React Dashboard (Frontend)
↓
FastAPI REST API (Backend)
↓
Random Forest Model (ML)
↓
PostgreSQL + MongoDB (Storage)
↓
MLflow (Experiment Tracking)
↓
n8n (Auto-Retraining Automation)
↑_________________________↑
Self-Healing Loop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Recharts, Axios |
| Backend | FastAPI, Python |
| ML Model | Random Forest (scikit-learn) |
| Experiment Tracking | MLflow |
| Automation | n8n |
| Database | PostgreSQL + MongoDB |
| Version Control | GitHub |

---

## 📁 Project Structure
mlops-fyp/
├── data/
│   └── parkinsons.csv          # UCI Parkinson's Dataset
├── models/
│   ├── model.pkl               # Trained Random Forest
│   ├── scaler.pkl              # StandardScaler
│   └── features.pkl            # Feature names
├── src/
│   ├── db.py                   # Database connections
│   ├── preprocessing/
│   │   └── preprocess.py       # Data cleaning & scaling
│   ├── training/
│   │   └── train.py            # Model training & MLflow logging
│   └── api/
│       └── main.py             # FastAPI endpoints
├── frontend/
│   └── src/
│       ├── App.js              # Sidebar navigation
│       ├── api.js              # API helper functions
│       ├── index.css           # Dark theme styling
│       └── pages/
│           ├── Dashboard.jsx   # Metrics & accuracy charts
│           ├── Predict.jsx     # Patient prediction form
│           └── Logs.jsx        # Prediction history
├── download_data.py            # Dataset downloader
└── README.md

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL
- MongoDB
- Docker (for n8n)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/neuroops.git
cd neuroops
```

### 2. Setup Python Environment
```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
```

### 3. Setup PostgreSQL Database
Run this in pgAdmin Query Tool:
```sql
CREATE DATABASE mlops_fyp;

CREATE TABLE model_runs (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(100),
    model_name VARCHAR(100),
    accuracy FLOAT,
    f1_score FLOAT,
    trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    input_text TEXT,
    prediction VARCHAR(20),
    confidence FLOAT,
    patient_name VARCHAR(100),
    patient_id VARCHAR(50),
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drift_scores (
    id SERIAL PRIMARY KEY,
    accuracy_recent FLOAT,
    drift_detected BOOLEAN,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Download Dataset & Train Model
```bash
python download_data.py
python src/training/train.py
```

### 5. Start FastAPI Backend
```bash
uvicorn src.api.main:app --reload --port 8000
```

### 6. Start React Dashboard
```bash
cd frontend
npm install
npm start
```

### 7. Start MLflow UI
```bash
mlflow ui
```
Open http://localhost:5000

### 8. Start n8n Automation (Docker)
```bash
docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```
Open http://localhost:5678

---

## 🌐 Running Services

| Service | URL |
|---|---|
| React Dashboard | http://localhost:3000 |
| FastAPI Backend | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |
| MLflow UI | http://localhost:5000 |
| n8n Automation | http://localhost:5678 |

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/predict` | Predict Parkinson's from voice data |
| GET | `/metrics` | Get training run history |
| GET | `/predictions` | Get prediction logs |
| GET | `/check-drift` | Check model drift status |
| POST | `/retrain` | Trigger model retraining |
| POST | `/log-retrain` | Log retraining event |

---

## 🔄 Auto-Retraining Flow
n8n checks /check-drift every 6 hours
↓
Avg confidence < 75%?
↓
YES → POST /retrain → New model trained
NO  → System healthy, check again later
↓
Dashboard updates automatically

---

## 📈 Model Performance

| Metric | Score |
|---|---|
| Algorithm | Random Forest |
| Accuracy | ~95% |
| F1 Score | ~95% |
| Dataset | UCI Parkinson's (197 patients) |
| Features | 22 voice measurements |

---

## 🎓 Academic Context

**Project Type:** Final Year Project (FYP)
**Domain:** Healthcare AI + MLOps
**Dataset:** [UCI Parkinson's Disease Dataset](https://archive.ics.uci.edu/dataset/174/parkinsons)

---

## 👨‍💻 Author

**Rimsha Qasim**
Final Year Student — Computer Science
UET

---

## 📄 License

This project is for academic purposes only.
