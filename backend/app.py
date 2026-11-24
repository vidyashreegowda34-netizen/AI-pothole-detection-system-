from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
try:
    import pandas as pd
except ImportError:
    pd = None

try:
    import numpy as np
except ImportError:
    np = None

import os
import shutil
import time

from database import init_db, get_connection
from detector import analyze_pothole_image

# Initialize SQLite database
init_db()

app = FastAPI(
    title="AI-Based Pothole Detection & Geo-Spatial Mapping API",
    description="Backend API supporting YOLO Computer Vision, Severity Assessment & Leaflet Geospatial Maintenance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PotholeReportCreate(BaseModel):
    imageUrl: str
    latitude: float
    longitude: float
    locationName: str
    roadType: Optional[str] = 'Major Arterial'
    detectionsCount: Optional[int] = 1
    surfaceAreaPct: Optional[float] = 12.0
    severity: Optional[str] = 'HIGH'
    priorityScore: Optional[int] = 85
    slaHours: Optional[int] = 24
    assignedDepartment: Optional[str] = 'PWD Road Maintenance Division'

class StatusUpdate(BaseModel):
    status: str

@app.get("/")
def read_root():
    return {
        "project": "AI-Based Pothole Detection, Severity Assessment and Geo-Spatial Road Maintenance Mapping System",
        "framework": "FastAPI (Python) + OpenCV + YOLO + Pandas + SQLite",
        "status": "online",
        "endpoints": ["/api/detect", "/api/reports", "/api/stats", "/api/map-markers"]
    }

@app.post("/api/detect")
async def detect_potholes(
    file: Optional[UploadFile] = File(None),
    imageUrl: Optional[str] = Form(None),
    roadType: Optional[str] = Form('Major Arterial')
):
    """
    Step 3 & 4 of Methodology:
    Runs YOLO pothole detection, calculates visible area ratio, classifies severity (Low/Med/High),
    and calculates priority recommendations.
    """
    temp_path = None
    if file:
        temp_dir = os.path.join(os.path.dirname(__file__), 'temp')
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, f"{int(time.time())}_{file.filename}")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        image_target = temp_path
    elif imageUrl:
        image_target = imageUrl
    else:
        # Default sample image for testing
        image_target = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800'

    result = analyze_pothole_image(image_target, road_type=roadType)

    # Clean up temp upload file if created
    if temp_path and os.path.exists(temp_path):
        try:
            os.remove(temp_path)
        except Exception:
            pass

    return {
        "success": True,
        "data": result
    }

@app.get("/api/reports")
def get_reports(severity: Optional[str] = None, status: Optional[str] = None):
    """
    Step 8 of Methodology:
    Dashboard & Reporting - view reports, filter locations, analyze statistics.
    """
    conn = get_connection()
    query = "SELECT * FROM pothole_reports WHERE 1=1"
    params = []

    if severity:
        query += " AND severity = ?"
        params.append(severity.upper())
    if status:
        query += " AND status = ?"
        params.append(status.upper())

    query += " ORDER BY priority_score DESC, created_at DESC"

    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    reports = [dict(r) for r in rows]
    conn.close()

    return {
        "success": True,
        "count": len(reports),
        "reports": reports
    }

@app.post("/api/reports")
def create_report(report: PotholeReportCreate):
    """
    Step 5 & 7 of Methodology:
    Persists new report with GPS coordinates, severity classification, and priority score.
    """
    conn = get_connection()
    cursor = conn.cursor()
    tracking_number = f"PTH-{int(time.time() * 1000) % 1000000:06d}"

    cursor.execute('''
        INSERT INTO pothole_reports (
            tracking_number, image_url, latitude, longitude, location_name,
            road_type, detections_count, surface_area_pct, severity, priority_score,
            sla_hours, status, assigned_department
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    ''', (
        tracking_number,
        report.imageUrl,
        report.latitude,
        report.longitude,
        report.locationName,
        report.roadType,
        report.detectionsCount,
        report.surfaceAreaPct,
        report.severity,
        report.priorityScore,
        report.slaHours,
        report.assignedDepartment
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return {
        "success": True,
        "message": "Pothole report registered and prioritized successfully",
        "id": new_id,
        "trackingNumber": tracking_number
    }

@app.put("/api/reports/{report_id}/status")
def update_status(report_id: int, update: StatusUpdate):
    """
    Updates pothole repair status: PENDING -> IN_PROGRESS -> REPAIRED
    """
    conn = get_connection()
    cursor = conn.cursor()
    resolved_at = time.strftime('%Y-%m-%d %H:%M:%S') if update.status.upper() == 'REPAIRED' else None

    cursor.execute('''
        UPDATE pothole_reports
        SET status = ?, resolved_at = ?
        WHERE id = ?
    ''', (update.status.upper(), resolved_at, report_id))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": f"Report #{report_id} status updated to {update.status.upper()}"
    }

@app.get("/api/stats")
def get_pothole_statistics():
    """
    Data Analysis with Pandas and NumPy (Step 8):
    Computes summary metrics, severity distributions, and repair rates.
    """
    conn = get_connection()
    if pd:
        df = pd.read_sql_query("SELECT * FROM pothole_reports", conn)
        conn.close()

        if df.empty:
            return {
                "success": True,
                "total_reports": 0,
                "severity_distribution": {},
                "status_distribution": {},
                "avg_surface_area_pct": 0.0,
                "avg_priority_score": 0.0
            }

        total_reports = int(len(df))
        sev_counts = df['severity'].value_counts().to_dict()
        status_counts = df['status'].value_counts().to_dict()
        avg_area = float(round(df['surface_area_pct'].mean(), 2))
        avg_priority = float(round(df['priority_score'].mean(), 1))
        high_priority_count = int(len(df[df['severity'] == 'HIGH']))
    else:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pothole_reports")
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()

        total_reports = len(rows)
        if total_reports == 0:
            return {
                "success": True,
                "total_reports": 0,
                "severity_distribution": {},
                "status_distribution": {},
                "avg_surface_area_pct": 0.0,
                "avg_priority_score": 0.0
            }

        sev_counts = {}
        status_counts = {}
        total_area = 0.0
        total_priority = 0.0
        high_priority_count = 0

        for r in rows:
            sev = r['severity']
            st = r['status']
            sev_counts[sev] = sev_counts.get(sev, 0) + 1
            status_counts[st] = status_counts.get(st, 0) + 1
            total_area += r['surface_area_pct'] or 0.0
            total_priority += r['priority_score'] or 0.0
            if sev == 'HIGH':
                high_priority_count += 1

        avg_area = round(total_area / total_reports, 2)
        avg_priority = round(total_priority / total_reports, 1)

    return {
        "success": True,
        "total_reports": total_reports,
        "high_priority_count": high_priority_count,
        "severity_distribution": {
            "HIGH": sev_counts.get("HIGH", 0),
            "MEDIUM": sev_counts.get("MEDIUM", 0),
            "LOW": sev_counts.get("LOW", 0)
        },
        "status_distribution": {
            "PENDING": status_counts.get("PENDING", 0),
            "IN_PROGRESS": status_counts.get("IN_PROGRESS", 0),
            "REPAIRED": status_counts.get("REPAIRED", 0)
        },
        "avg_surface_area_pct": avg_area,
        "avg_priority_score": avg_priority,
        "repair_rate_pct": round((status_counts.get("REPAIRED", 0) / max(1, total_reports)) * 100, 1)
    }

@app.get("/api/map-markers")
def get_map_markers():
    """
    Step 6 of Methodology:
    Geospatial Risk Mapping - returns markers with latitude, longitude, and severity level colors.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, tracking_number, location_name, latitude, longitude,
               severity, priority_score, surface_area_pct, status, image_url
        FROM pothole_reports
    ''')
    rows = cursor.fetchall()
    conn.close()

    markers = []
    color_map = {
        'HIGH': '#dc2626',    # Red
        'MEDIUM': '#ea580c',  # Orange
        'LOW': '#16a34a'      # Green
    }

    for r in rows:
        markers.append({
            "id": r["id"],
            "trackingNumber": r["tracking_number"],
            "locationName": r["location_name"],
            "coordinates": [r["latitude"], r["longitude"]],
            "severity": r["severity"],
            "markerColor": color_map.get(r["severity"], '#6b7280'),
            "priorityScore": r["priority_score"],
            "surfaceAreaPct": r["surface_area_pct"],
            "status": r["status"],
            "imageUrl": r["image_url"]
        })

    return {
        "success": True,
        "markers_count": len(markers),
        "markers": markers
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
