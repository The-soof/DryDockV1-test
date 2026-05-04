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
        {"id": "mes-step-kitting", "name": "Material kitting", "station": "Prep T1", "cycleTimeMin": 5.0, "idealCycleTimeMin": 4.5, "machinesActive": 1, "uptimePercent": 98.0, "scrapRatePercent": 0.2, "queueMinutes": 2, "state": "Running"},
        {"id": "mes-step-layup", "name": "Composite layup", "station": "Cell C2", "cycleTimeMin": 12.5, "idealCycleTimeMin": 11.8, "machinesActive": 2, "uptimePercent": 94.0, "scrapRatePercent": 2.5, "queueMinutes": 8, "state": "Running"},
        {"id": "mes-step-bagging", "name": "Vacuum bagging", "station": "Station V1", "cycleTimeMin": 8.5, "idealCycleTimeMin": 7.0, "machinesActive": 2, "uptimePercent": 92.0, "scrapRatePercent": 1.0, "queueMinutes": 12, "state": "Watch"},
        {"id": "mes-step-cure", "name": "Curing oven", "station": "Oven A1", "cycleTimeMin": 45.0, "idealCycleTimeMin": 41.0, "machinesActive": 1, "uptimePercent": 91.0, "scrapRatePercent": 0.5, "queueMinutes": 18, "state": "Watch"},
        {"id": "mes-step-demold", "name": "Demolding & tool prep", "station": "Station D3", "cycleTimeMin": 6.0, "idealCycleTimeMin": 5.5, "machinesActive": 2, "uptimePercent": 96.0, "scrapRatePercent": 0.8, "queueMinutes": 4, "state": "Running"},
        {"id": "mes-step-cnc", "name": "5-Axis CNC routing", "station": "CNC M1", "cycleTimeMin": 15.0, "idealCycleTimeMin": 14.2, "machinesActive": 1, "uptimePercent": 85.0, "scrapRatePercent": 3.0, "queueMinutes": 25, "state": "Risk"},
        {"id": "mes-step-ndt", "name": "Ultrasonic NDT", "station": "Scan Bay 1", "cycleTimeMin": 10.0, "idealCycleTimeMin": 9.0, "machinesActive": 1, "uptimePercent": 99.0, "scrapRatePercent": 0.1, "queueMinutes": 5, "state": "Running"},
        {"id": "mes-step-trim", "name": "Manual trim & inspect", "station": "Inspection Q2", "cycleTimeMin": 8.0, "idealCycleTimeMin": 7.6, "machinesActive": 3, "uptimePercent": 88.0, "scrapRatePercent": 5.0, "queueMinutes": 5, "state": "Watch"},
        {"id": "mes-step-paint", "name": "Surface finish & paint", "station": "Paint Booth 1", "cycleTimeMin": 22.0, "idealCycleTimeMin": 20.0, "machinesActive": 1, "uptimePercent": 90.0, "scrapRatePercent": 4.5, "queueMinutes": 14, "state": "Watch"},
        {"id": "mes-step-assembly", "name": "Final assembly", "station": "Assembly Bay F1", "cycleTimeMin": 18.0, "idealCycleTimeMin": 16.5, "machinesActive": 2, "uptimePercent": 95.0, "scrapRatePercent": 1.5, "queueMinutes": 8, "state": "Running"}
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
        # Handle Cycle Time Math
        raw_ct = float(row.get(map_dict['cycleTime'], 1.0))
        if map_dict.get('cycleTimeUnit') == 'hr':
            final_cycle_time = raw_ct * 60.0
        else:
            final_cycle_time = raw_ct
        # Handle Quality Math
        raw_scrap = float(row.get(map_dict['scrapRate'], 0.0))
        if map_dict.get('scrapFormat') == 'yield':
            final_scrap_rate = max(0.0, 100.0 - raw_scrap)
        else:
            final_scrap_rate = raw_scrap

        process_steps.append({
            "id": f"csv-step-{i}",
            "name": row.get(map_dict['name'], f"Step {i+1}"),
            "cycleTime": final_cycle_time,
            "scrapRate": final_scrap_rate,
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
