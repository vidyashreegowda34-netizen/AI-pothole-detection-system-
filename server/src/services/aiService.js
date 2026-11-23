const prisma = require('../config/db');

/**
 * Calculates great-circle distance between two GPS coordinates using the Haversine formula
 * Returns distance in meters
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Distance in meters
}

/**
 * Natural Language / Keyword rules for Kannada and English
 */
const CLASSIFICATION_RULES = [
  {
    categoryCode: 'POTHOLE',
    deptCode: 'PWD',
    urgency: 'HIGH',
    keywords: [
      'pothole', 'road', 'asphalt', 'tar', 'pit', 'crater', 'divider', 'highway',
      'ಗುಂಡಿ', 'ರಸ್ತೆ', 'ಡಾಂಬರು', 'ಹೊಂಡ', 'ರಸ್ತೆಯ', 'ಗುಂಡಿಗಳು', 'ರಸ್ತೆ ಹಾಳಾಗಿದೆ'
    ]
  },
  {
    categoryCode: 'GARBAGE',
    deptCode: 'TCC',
    urgency: 'MEDIUM',
    keywords: [
      'garbage', 'waste', 'trash', 'dump', 'plastic', 'debris', 'litter', 'smell', 'dustbin',
      'ಕಸ', 'ತ್ಯಾಜ್ಯ', 'ಕಸದ', 'ಪ್ಲಾಸ್ಟಿಕ್', 'ದುರ್ವಾಸನೆ', 'ಕಸದ ತೊಟ್ಟಿ', 'ಕಸ ಸುರಿಯುವುದು'
    ]
  },
  {
    categoryCode: 'STREETLIGHT',
    deptCode: 'BESCOM',
    urgency: 'MEDIUM',
    keywords: [
      'streetlight', 'street light', 'lamp', 'bulb', 'darkness', 'dark road', 'pole light',
      'ಬೀದಿ ದೀಪ', 'ದೀಪ', 'ಕತ್ತಲೆ', 'ಲೈಟ್', 'ಬೀದಿ ದೀಪಗಳು ಉರಿಯುತ್ತಿಲ್ಲ', 'ಕಂಬದ ಲೈಟ್'
    ]
  },
  {
    categoryCode: 'ELECTRICITY',
    deptCode: 'BESCOM',
    urgency: 'EMERGENCY',
    keywords: [
      'wire', 'cable', 'transformer', 'spark', 'electric', 'shock', 'current', 'power cut', 'hanging wire',
      'ವಿದ್ಯುತ್', 'ಕರೆಂಟ್', 'ತಂತಿ', 'ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್', 'ಸ್ಪಾರ್ಕ್', 'ಶಾಕ್', 'ವಿದ್ಯುತ್ ಕಂಬ'
    ]
  },
  {
    categoryCode: 'WATER_SUPPLY',
    deptCode: 'KUWSDB',
    urgency: 'HIGH',
    keywords: [
      'water supply', 'no water', 'drinking water', 'tap', 'borewell', 'water shortage',
      'ಕುಡಿಯುವ ನೀರು', 'ನೀರು ಬರ್ತಿಲ್ಲ', 'ನೀರು', 'ನಲ್ಲಿ ನೀರು', 'ನೀರಿನ ಸಮಸ್ಯೆ'
    ]
  },
  {
    categoryCode: 'PIPE_LEAK',
    deptCode: 'KUWSDB',
    urgency: 'HIGH',
    keywords: [
      'leak', 'pipe burst', 'water wastage', 'pipeline', 'broken pipe',
      'ಪೈಪ್ ಒಡೆದಿದೆ', 'ನೀರು ಸೋರಿಕೆ', 'ಪೈಪ್‌ಲೈನ್', 'ನೀರು ವ್ಯರ್ಥ'
    ]
  },
  {
    categoryCode: 'DRAINAGE',
    deptCode: 'TCC',
    urgency: 'HIGH',
    keywords: [
      'drainage', 'gutter', 'sewer', 'overflow', 'manhole', 'stagnant', 'blocked drain',
      'ಚರಂಡಿ', 'ಒಳಚರಂಡಿ', 'ಗಟಾರ', 'ಉಕ್ಕಿ ಹರಿಯುತ್ತಿದೆ', 'ಮ್ಯಾನ್‌ಹೋಲ್'
    ]
  },
  {
    categoryCode: 'PUBLIC_TOILET',
    deptCode: 'TCC',
    urgency: 'MEDIUM',
    keywords: [
      'toilet', 'urinal', 'restroom', 'washroom', 'latrine', 'dirty toilet',
      'ಶೌಚಾಲಯ', 'ಮೂತ್ರಾಲಯ', 'ಟಾಯ್ಲೆಟ್', 'ಸಾರ್ವಜನಿಕ ಶೌಚಾಲಯ'
    ]
  },
  {
    categoryCode: 'STRAY_ANIMALS',
    deptCode: 'TCC',
    urgency: 'MEDIUM',
    keywords: [
      'dog', 'stray dog', 'monkey', 'cow', 'cattle', 'animal bite', 'rabies',
      'ನಾಯಿ', 'ಬೀದಿ ನಾಯಿ', 'ಕೋತಿ', 'ದನ', 'ಪ್ರಾಣಿಗಳ ಹಾವಳಿ'
    ]
  },
  {
    categoryCode: 'MOSQUITO_FOGGING',
    deptCode: 'HEALTH',
    urgency: 'HIGH',
    keywords: [
      'mosquito', 'dengue', 'malaria', 'fogging', 'larva', 'fever',
      'ಸೊಳ್ಳೆ', 'ಡೆಂಗ್ಯೂ', 'ಮಲೇರಿಯಾ', 'ಫಾಗಿಂಗ್', 'ಸೊಳ್ಳೆ ಕಾಟ'
    ]
  },
  {
    categoryCode: 'RURAL_SANITATION',
    deptCode: 'GRAM_PANCHAYAT',
    urgency: 'MEDIUM',
    keywords: [
      'village', 'panchayat', 'borewell motor', 'handpump', 'rural',
      'ಹಳ್ಳಿ', 'ಗ್ರಾಮ', 'ಕೊಳವೆಬಾವಿ ಮೋಟಾರ್', 'ಕೈಪಂಪ್'
    ]
  },
  {
    categoryCode: 'SCHOOL_INFRA',
    deptCode: 'EDUCATION',
    urgency: 'MEDIUM',
    keywords: [
      'school', 'classroom', 'compound', 'blackboard', 'roof leak in school',
      'ಶಾಲೆ', 'ತರಗತಿ', 'ಸರ್ಕಾರಿ ಶಾಲೆ', 'ಶಾಲಾ ಕೊಠಡಿ'
    ]
  }
];

/**
 * Auto-suggest category, department and urgency
 */
async function suggestCategoryAndDepartment(text = '') {
  const normalizedText = (text || '').toLowerCase();
  
  let bestMatch = null;
  let maxScore = 0;

  for (const rule of CLASSIFICATION_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (normalizedText.includes(kw.toLowerCase())) {
        score += kw.length > 5 ? 2 : 1; // Give more weight to longer specific terms
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = rule;
    }
  }

  // Fallback default
  if (!bestMatch || maxScore === 0) {
    bestMatch = {
      categoryCode: 'GARBAGE',
      deptCode: 'TCC',
      urgency: 'MEDIUM',
    };
  }

  // Look up records in database
  const category = await prisma.category.findUnique({
    where: { code: bestMatch.categoryCode },
    include: { department: true }
  });

  const emergencyAssessment = evaluateEmergencyPhase(bestMatch.categoryCode, text);

  return {
    categoryCode: bestMatch.categoryCode,
    departmentCode: bestMatch.deptCode,
    urgency: emergencyAssessment.phase,
    emergencyPhase: emergencyAssessment,
    confidence: maxScore > 0 ? Math.min(0.95, 0.65 + maxScore * 0.1) : 0.5,
    category,
    department: category?.department
  };
}

/**
 * Evaluates the Emergency Phase based on picture/text hazard cues
 * Phase 4: EMERGENCY (Immediate Hazard - 12h SLA)
 * Phase 3: HIGH (Urgent Risk - 24h SLA)
 * Phase 2: MEDIUM (Standard Civic - 48h SLA)
 * Phase 1: LOW (Routine Maintenance - 72h+ SLA)
 */
function evaluateEmergencyPhase(categoryCode, text = '') {
  const lower = (text || '').toLowerCase();

  // Severe Life / Public Safety Hazard cues
  const emergencyKeywords = [
    'spark', 'live wire', 'snapped', 'electric shock', 'transformer', 'fire', 'danger',
    'hospital road', 'school gate', 'death risk', 'flood', 'dangling wire',
    'ವಿದ್ಯುತ್ ತಂತಿ', 'ಶಾಕ್', 'ಸ್ಪಾರ್ಕ್', 'ಬೆಂಕಿ', 'ಅಪಾಯ', 'ತುರ್ತು', 'ಪ್ರಾಣಾಪಾಯ'
  ];

  const highKeywords = [
    'deep pothole', 'accident', 'pipe burst', 'drainage overflow', 'dengue', 'sewage',
    'ದೊಡ್ಡ ಗುಂಡಿ', 'ಅಪಘಾತ', 'ಪೈಪ್ ಒಡೆದಿದೆ', 'ಚರಂಡಿ ನೀರು', 'ಸೊಳ್ಳೆ ಕಾಟ'
  ];

  const hasEmergency = emergencyKeywords.some(kw => lower.includes(kw)) || categoryCode === 'ELECTRICITY';
  const hasHigh = highKeywords.some(kw => lower.includes(kw)) || ['POTHOLE', 'PIPE_LEAK', 'DRAINAGE', 'MOSQUITO_FOGGING'].includes(categoryCode);

  if (hasEmergency) {
    return {
      phase: 'EMERGENCY',
      phaseLevel: 4,
      badgeColor: '#dc2626',
      slaHours: 12,
      phaseLabelKn: 'ಹಂತ 4: ತಕ್ಷಣದ ತುರ್ತು ಅಪಾಯ (Emergency Hazard)',
      phaseLabelEn: 'Phase 4: Immediate Emergency Hazard',
      descriptionKn: 'ಪ್ರಾಣಾಪಾಯ ಅಥವಾ ಗಂಭೀರ ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತಾ ಅಪಾಯ. 12 ಗಂಟೆಗಳ ತುರ್ತು ಪರಿಹಾರ ಗಡುವು ಅನ್ವಯಿಸಲಾಗಿದೆ.',
      descriptionEn: 'Critical public safety risk detected in photo/report. Escalated to Phase 4 Emergency with 12h SLA.',
      hazardBadge: '🚨 EMERGENCY PHASE (12h SLA)'
    };
  } else if (hasHigh) {
    return {
      phase: 'HIGH',
      phaseLevel: 3,
      badgeColor: '#ea580c',
      slaHours: 24,
      phaseLabelKn: 'ಹಂತ 3: ಹೆಚ್ಚಿನ ಆದ್ಯತೆ (High Priority)',
      phaseLabelEn: 'Phase 3: High Priority Urgency',
      descriptionKn: 'ಸಂಚಾರ ಅಡ್ಡಿ ಅಥವಾ ಆರೋಗ್ಯ ಅಪಾಯ. 24 ಗಂಟೆಗಳ ಒಳಗಾಗಿ ಪರಿಶೀಲಿಸಲು ನಿಯೋಜಿಸಲಾಗಿದೆ.',
      descriptionEn: 'Major civic disruption or health risk detected. 24-hour target turnaround.',
      hazardBadge: '⚠️ HIGH PRIORITY (24h SLA)'
    };
  } else if (categoryCode === 'STREETLIGHT' || categoryCode === 'GARBAGE' || categoryCode === 'PUBLIC_TOILET') {
    return {
      phase: 'MEDIUM',
      phaseLevel: 2,
      badgeColor: '#d97706',
      slaHours: 48,
      phaseLabelKn: 'ಹಂತ 2: ಮಧ್ಯಮ ಆದ್ಯತೆ (Medium Priority)',
      phaseLabelEn: 'Phase 2: Standard Civic Priority',
      descriptionKn: 'ದೈನಂದಿನ ನಾಗರಿಕ ಸೌಕರ್ಯಗಳ ನಿರ್ವಹಣೆ. 48 ಗಂಟೆಗಳ SLA ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.',
      descriptionEn: 'Standard civic maintenance issue. 48-hour municipal turnaround.',
      hazardBadge: '⚡ MEDIUM PHASE (48h SLA)'
    };
  }

  return {
    phase: 'LOW',
    phaseLevel: 1,
    badgeColor: '#16a34a',
    slaHours: 72,
    phaseLabelKn: 'ಹಂತ 1: ಸಾಮಾನ್ಯ ಆದ್ಯತೆ (Low / Routine)',
    phaseLabelEn: 'Phase 1: Routine Maintenance',
    descriptionKn: 'ಸಾಮಾನ್ಯ ಪರಿಶೀಲನೆ ಮತ್ತು ನಿಯಮಿತ ನಿರ್ವಹಣೆ.',
    descriptionEn: 'Routine infrastructure upkeep and scheduled inspections.',
    hazardBadge: 'ℹ️ STANDARD PHASE'
  };
}

/**
 * Detect nearby unresolved duplicate issues
 * Radius: 100 meters
 */
async function checkDuplicateIssues({ latitude, longitude, categoryId, text }) {
  if (!latitude || !longitude) return { hasDuplicate: false, duplicates: [] };

  const parsedLat = parseFloat(latitude);
  const parsedLon = parseFloat(longitude);

  // Fetch active unresolved issues
  const activeIssues = await prisma.issue.findMany({
    where: {
      status: { in: ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'] }
    },
    include: {
      category: true,
      department: true,
      taluk: true,
      _count: { select: { upvotes: true } }
    }
  });

  const nearbyDuplicates = [];

  for (const issue of activeIssues) {
    const distanceMeters = calculateHaversineDistance(
      parsedLat,
      parsedLon,
      issue.latitude,
      issue.longitude
    );

    // If within 150 meters
    if (distanceMeters <= 150) {
      const isSameCategory = categoryId && issue.categoryId === categoryId;
      const isVeryClose = distanceMeters <= 60;

      if (isSameCategory || isVeryClose) {
        nearbyDuplicates.push({
          id: issue.id,
          trackingNumber: issue.trackingNumber,
          title: issue.title,
          categoryNameEn: issue.category.nameEn,
          categoryNameKn: issue.category.nameKn,
          status: issue.status,
          distanceMeters,
          upvotesCount: issue._count.upvotes,
          photoUrls: JSON.parse(issue.photoUrls || '[]'),
          createdAt: issue.createdAt,
        });
      }
    }
  }

  // Sort by distance (closest first)
  nearbyDuplicates.sort((a, b) => a.distanceMeters - b.distanceMeters);

  return {
    hasDuplicate: nearbyDuplicates.length > 0,
    duplicates: nearbyDuplicates.slice(0, 3) // Return top 3
  };
}

module.exports = {
  calculateHaversineDistance,
  suggestCategoryAndDepartment,
  checkDuplicateIssues,
  evaluateEmergencyPhase,
};
