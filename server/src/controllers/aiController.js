const { suggestCategoryAndDepartment, checkDuplicateIssues, evaluateEmergencyPhase } = require('../services/aiService');
const { detectPotholesYOLO11, YOLO11N_CONFIG } = require('../services/yoloService');

exports.suggest = async (req, res) => {
  try {
    const { text, title } = req.body;
    const combinedText = `${title || ''} ${text || ''}`.trim();

    const suggestion = await suggestCategoryAndDepartment(combinedText);

    return res.status(200).json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error('ai suggest error:', error);
    return res.status(500).json({ success: false, message: 'Failed to suggest category' });
  }
};

exports.assessEmergency = async (req, res) => {
  try {
    const { text, categoryCode } = req.body;
    const assessment = evaluateEmergencyPhase(categoryCode, text);
    return res.status(200).json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error('ai assessEmergency error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assess emergency phase' });
  }
};

exports.checkDuplicate = async (req, res) => {
  try {
    const { latitude, longitude, categoryId, text } = req.body;

    const result = await checkDuplicateIssues({
      latitude,
      longitude,
      categoryId,
      text,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('ai checkDuplicate error:', error);
    return res.status(500).json({ success: false, message: 'Failed to check duplicates' });
  }
};

/**
 * YOLO11n Pothole & Road Hazard Detection Endpoint
 * Processes uploaded image, URL, or dataUrl using Ultralytics YOLO11 Nano CV model
 */
exports.detectYolo11 = async (req, res) => {
  try {
    const imagePath = req.file?.path || null;
    const imageUrl = req.body?.imageUrl || (req.file ? `/uploads/${req.file.filename}` : null);
    const base64Data = req.body?.base64Data || null;
    const hintText = `${req.body?.title || ''} ${req.body?.description || req.body?.hintText || ''}`.trim();

    const detectionResult = await detectPotholesYOLO11({
      imagePath,
      imageUrl,
      base64Data,
      hintText,
    });

    return res.status(200).json({
      success: true,
      data: detectionResult,
    });
  } catch (error) {
    console.error('YOLO11n detection error:', error);
    return res.status(500).json({
      success: false,
      message: 'YOLO11n computer vision inference failed: ' + error.message,
    });
  }
};

/**
 * Get YOLO11n Model Metadata & Configuration
 */
exports.getYoloModelInfo = async (req, res) => {
  return res.status(200).json({
    success: true,
    model: YOLO11N_CONFIG,
    architecture: 'Ultralytics YOLO11 Nano (yolo11n)',
    framework: 'PyTorch / ONNX / Node CV Engine',
    datasetTrainedOn: 'Road Damage Dataset 2022 (RDD2022) + Tumkur District Survey Callsets',
    inputSize: [640, 640],
    parameters: '2.6 Million Parameters (Optimized for Mobile PWA & Low-Latency Edge Inference)',
  });
};
