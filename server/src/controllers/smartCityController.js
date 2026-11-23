const {
  CCTV_CAMERAS,
  IOT_SENSORS,
  TALUK_ROAD_DEGRADATION_INDEX,
  autoCreateSmartCityIssue,
} = require('../services/smartCityService');

exports.getCctvStreams = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: CCTV_CAMERAS.length,
      cameras: CCTV_CAMERAS,
      aiEngine: 'YOLO11n Edge CCTV Vision Stream',
      district: 'Tumkur District Traffic & Surveillance Grid',
    });
  } catch (error) {
    console.error('getCctvStreams error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch CCTV streams' });
  }
};

exports.getIotSensors = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: IOT_SENSORS.length,
      sensors: IOT_SENSORS,
      telemetryProtocol: 'MQTT / LoRaWAN Civic Sensor Mesh',
      district: 'Tumkur District Municipal IoT Grid',
    });
  } catch (error) {
    console.error('getIotSensors error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch IoT telemetry' });
  }
};

exports.getPredictiveRoadHealth = async (req, res) => {
  try {
    const totalPotholesPredicted = TALUK_ROAD_DEGRADATION_INDEX.reduce(
      (acc, t) => acc + t.potholesPredicted30Days,
      0
    );
    const avgHealthScore = Math.round(
      TALUK_ROAD_DEGRADATION_INDEX.reduce((acc, t) => acc + t.healthScore, 0) /
        TALUK_ROAD_DEGRADATION_INDEX.length
    );

    return res.status(200).json({
      success: true,
      avgHealthScore,
      totalPotholesPredicted30Days: totalPotholesPredicted,
      talukCount: TALUK_ROAD_DEGRADATION_INDEX.length,
      taluks: TALUK_ROAD_DEGRADATION_INDEX,
      modelName: 'Tumkur Road Degradation Neural Model (RDI-v2)',
      forecastHorizonDays: 30,
    });
  } catch (error) {
    console.error('getPredictiveRoadHealth error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch predictive road index' });
  }
};

exports.autoCreateIssueFromCctv = async (req, res) => {
  try {
    const { cameraName, hazardClass, severity, depthEstimate, latitude, longitude } = req.body;

    const issue = await autoCreateSmartCityIssue({
      source: 'CCTV Neural Vision',
      title: `[CCTV Automated Alert] ${hazardClass || 'Pothole'} on ${cameraName || 'Tumkur Transit Corridor'}`,
      description: `Automated road hazard detection triggered via Live CCTV surveillance camera (${cameraName}). Severity: ${severity || 'CRITICAL'}. Depth Estimate: ${depthEstimate || 'Deep Crater'}. Pre-verified by YOLO11n. Immediate field inspection required.`,
      categoryCode: 'POTHOLE',
      urgency: severity === 'CRITICAL' ? 'EMERGENCY' : 'HIGH',
      latitude: latitude || 13.3422,
      longitude: longitude || 77.1018,
      addressText: `${cameraName || 'Ashoka Circle'}, Tumkur City`,
    });

    return res.status(201).json({
      success: true,
      message: 'Automated civic complaint ticket generated from CCTV detection',
      issue,
    });
  } catch (error) {
    console.error('autoCreateIssueFromCctv error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.triggerIotSensorAlert = async (req, res) => {
  try {
    const { sensorId, sensorName, department, value, unit } = req.body;

    let categoryCode = 'PIPE_LEAK';
    let urgency = 'HIGH';
    if (department?.includes('BESCOM') || sensorId?.includes('PWR')) {
      categoryCode = 'ELECTRICITY';
      urgency = 'EMERGENCY';
    } else if (department?.includes('TCC') || sensorId?.includes('WST')) {
      categoryCode = 'GARBAGE';
      urgency = 'MEDIUM';
    }

    const issue = await autoCreateSmartCityIssue({
      source: `Smart City IoT Sensor (${sensorId || 'IOT-TELEMETRY'})`,
      title: `[IoT Telemetry Alert] Critical threshold exceeded on ${sensorName || 'Municipal Sensor'}`,
      description: `Automated sensor trigger from ${sensorName}. Recorded telemetry value: ${value || 0} ${unit || ''}. Automated ticket dispatched to ${department || 'Municipal Board'} engineers.`,
      categoryCode,
      urgency,
      latitude: 13.3409,
      longitude: 77.1010,
      addressText: `${sensorName}, Tumkur Municipal Telemetry Zone`,
    });

    return res.status(201).json({
      success: true,
      message: 'Automated municipal ticket dispatched from IoT sensor alert',
      issue,
    });
  } catch (error) {
    console.error('triggerIotSensorAlert error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
