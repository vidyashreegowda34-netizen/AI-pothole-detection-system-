import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'potholes.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pothole_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tracking_number TEXT UNIQUE,
            image_url TEXT,
            latitude REAL,
            longitude REAL,
            location_name TEXT,
            road_type TEXT DEFAULT 'Arterial',
            detections_count INTEGER DEFAULT 1,
            surface_area_pct REAL DEFAULT 12.5,
            severity TEXT DEFAULT 'HIGH',
            priority_score INTEGER DEFAULT 85,
            sla_hours INTEGER DEFAULT 24,
            status TEXT DEFAULT 'PENDING',
            assigned_department TEXT DEFAULT 'PWD (Public Works Department)',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP
        )
    ''')
    conn.commit()

    # Seed sample initial benchmark records if table is empty
    cursor.execute('SELECT COUNT(*) as count FROM pothole_reports')
    if cursor.fetchone()['count'] == 0:
        sample_records = [
            (
                'PTH-2026-001',
                'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800',
                13.3440,
                77.1424,
                'NH 48 Highway Service Road, Kyathsandra',
                'National Highway',
                2,
                18.4,
                'HIGH',
                95,
                12,
                'PENDING',
                'PWD Road Maintenance Division'
            ),
            (
                'PTH-2026-002',
                'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
                13.3422,
                77.1018,
                'B.H. Road near Ashoka Circle, Tumkur',
                'Major Arterial',
                1,
                11.2,
                'MEDIUM',
                78,
                24,
                'IN_PROGRESS',
                'Tumkur City Corporation (TCC)'
            ),
            (
                'PTH-2026-003',
                'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
                13.3385,
                77.1052,
                'Mandipet Market Cross Road',
                'Residential Ward',
                1,
                4.2,
                'LOW',
                45,
                72,
                'REPAIRED',
                'TCC Ward 1 Engineering Cell'
            ),
            (
                'PTH-2026-004',
                'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=800',
                13.3541,
                77.0984,
                'Sira Gate Highway Junction Corridor',
                'National Highway',
                3,
                22.8,
                'HIGH',
                98,
                12,
                'PENDING',
                'PWD Road Maintenance Division'
            )
        ]
        cursor.executemany('''
            INSERT INTO pothole_reports (
                tracking_number, image_url, latitude, longitude, location_name,
                road_type, detections_count, surface_area_pct, severity, priority_score,
                sla_hours, status, assigned_department
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_records)
        conn.commit()

    conn.close()

if __name__ == '__main__':
    init_db()
    print("[+] SQLite database initialized successfully at:", DB_PATH)
