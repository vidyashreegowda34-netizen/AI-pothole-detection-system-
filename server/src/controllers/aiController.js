const { suggestCategoryAndDepartment, checkDuplicateIssues, evaluateEmergencyPhase } = require('../services/aiService');

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
