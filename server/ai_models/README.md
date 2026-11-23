# YOLO11n Pothole Detection Model
## Namma Tumakuru Parishkara (ನಮ್ಮ ತುಮಕೂರು ಪರಿಷ್ಕಾರ)

This directory contains the machine learning assets for automated road distress and pothole detection using **Ultralytics YOLO11 Nano (yolo11n)**.

### Model Characteristics
- **Architecture**: Ultralytics YOLO11n (Nano)
- **Parameters**: 2.6 Million (Fastest inference, minimal memory footprint)
- **Input Dimension**: 640 x 640 px
- **Latency**: ~35ms - 50ms per frame on CPU / < 8ms on GPU
- **Primary Targets**: Potholes, deep craters, asphalt fractures, road depression hazards

### Running the Python Detector
```bash
# 1. Install dependencies (Python 3.10 - 3.12 recommended)
pip install -r requirements.txt

# 2. Run inference on a test photo
python yolo11n_pothole_detector.py --image test_road.jpg --conf 0.30 --save-json

# 3. Export to ONNX for mobile web edge inference
python yolo11n_pothole_detector.py --image test_road.jpg --export-onnx
```

### Full-Stack Integration
The Node.js backend (`server/src/services/yoloService.js`) exposes `POST /api/ai/yolo-detect` and `POST /api/ai/yolo11-detect`, providing bounding boxes, confidence scores, and automatic Emergency Phase escalation directly to the React PWA frontend.
