import psycopg2
from pymongo import MongoClient

from dotenv import load_dotenv
import os
load_dotenv()

def get_pg():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),  # ⚠️ convert to int
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
# MongoDB
def get_mongo():
    client = MongoClient("mongodb://localhost:27017/")
    return client["mlops_fyp"]

# Save training run to PostgreSQL
def save_run(run_id, accuracy, f1):
    conn = get_pg()
    cur = conn.cursor()
    cur.execute("UPDATE model_runs SET is_active=FALSE")
    cur.execute("""
        INSERT INTO model_runs (run_id, model_name, accuracy, f1_score, is_active)
        VALUES (%s, %s, %s, %s, TRUE)
    """, (run_id, "LogisticRegression", accuracy, f1))
    conn.commit()
    cur.close()
    conn.close()
    print(f"✅ Run saved to PostgreSQL")

# Save raw data to MongoDB
def save_raw_data(df):
    db = get_mongo()
    records = df.to_dict('records')
    db["raw_data"].insert_many(records)
    print(f"✅ {len(records)} records saved to MongoDB")