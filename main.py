from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from typing import Any, Dict
import random
from optimizer import build_response
import csv
import io
import json

app = FastAPI()

# --- MOCK DATABASE (Moved from JS to Python) ---
mock_erp_db = {
    "productionGoal": {
        "targetRatePerHour": 18,
        "totalQuantity": 500,
        "deadlineDate": "2026-05-30"
    },
    "components": [
        {"id": "comp_001", "name": "Carbon pre-preg roll", "sourceType": "purchase", "onHand": 14, "reserved": 6, "costPerUnit": 250, "leadTimeDays": 5, "risk": "warning"},
        {"id": "comp_002", "name": "Epoxy resin", "sourceType": "purchase", "onHand": 22, "reserved": 4, "costPerUnit": 45.5, "leadTimeDays": 2, "risk": "ok"}
    ]
}

mock_mes_db = {
    "lineStatus": "Running",
    "processSteps": [
        {"id": "mes-step-layup", "name": "Composite layup", "station": "Cell C2", "cycleTimeMin": 12.5, "idealCycleTimeMin": 11.8, "machinesActive": 2, "uptimePercent": 94.0, "scrapRatePercent": 2.5, "queueMinutes": 8, "state": "Running"},
        {"id": "mes-step-cure", "name": "Curing oven", "station": "Oven A1", "cycleTimeMin": 45.0, "idealCycleTimeMin": 41.0, "machinesActive": 1, "uptimePercent": 91.0, "scrapRatePercent": 0.5, "queueMinutes": 18, "state": "Watch"},
        {"id": "mes-step-trim", "name": "Trimming & inspection", "station": "Inspection Q2", "cycleTimeMin": 8.0, "idealCycleTimeMin": 7.6, "machinesActive": 3, "uptimePercent": 88.0, "scrapRatePercent": 5.0, "queueMinutes": 5, "state": "Watch"}
    ]
}

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...), mapping: str = Form(...)):
    # 1. Decode the user's verified mapping rules
    map_dict = json.loads(mapping)
    # 2. Read the file
    content = await file.read()
    decoded_content = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded_content))
    process_steps = []
    # 3. Use the dynamic mapped keys to pull the data
    for i, row in enumerate(reader):
        process_steps.append({
            "id": f"csv-step-{i}",
            "name": row.get(map_dict['name'], f"Step {i+1}"),
            "cycleTime": float(row.get(map_dict['cycleTime'], 1.0)),
            "scrapRate": float(row.get(map_dict['scrapRate'], 0.0)),
            "machines": int(row.get(map_dict['machines'], 1)),
            "shiftHours": 8.0,
            "materialSource": "purchased"
        })

    return {"processSteps": process_steps}

# 1. The original Optimizer API (POST)
@app.post("/api/optimize")
async def optimize_line(payload: Dict[str, Any]):
    return build_response(payload)

# 2. NEW: The Live Factory Feed API (GET)
@app.get("/api/live-feed")
async def get_live_feed():
    # Here, we simulate the "live" variance you originally had in JS.
    # We add slight random fluctuations to the scrap rate and cycle times to make the dashboard blink and update naturally.
    for step in mock_mes_db["processSteps"]:
        step["cycleTimeMin"] = round(step["cycleTimeMin"] * random.uniform(0.98, 1.02), 2)
        step["scrapRatePercent"] = round(max(0, step["scrapRatePercent"] + random.uniform(-0.2, 0.2)), 2)
    return {
        "mes": mock_mes_db,
        "erp": mock_erp_db
    }

# 3. Serve the UI
app.mount("/", StaticFiles(directory=".", html=True), name="static")
