const prisma = require('../config/db');

/**
 * Smart City Services: Live CCTV Feeds, IoT Sensor Telemetry & Predictive Road Infrastructure
 * Namma Parishkara AI - Tumkur District Smart Governance
 */

const CCTV_CAMERAS = [
  {
    id: 'CAM-TUM-01',
    nameEn: 'Ashoka Circle - B.H. Road Corridor',
    nameKn: 'ಅಶೋಕ ಸರ್ಕಲ್ - ಬಿ.ಎಚ್. ರಸ್ತೆ ಕಾರಿಡಾರ್',
    taluk: 'Tumkur City (ತುಮಕೂರು ನಗರ)',
    latitude: 13.3422,
    longitude: 77.1018,
    fps: 30,
    resolution: '1080p FHD',
    status: 'LIVE_STREAMING',
    feedUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    activeDetections: [
      {
        id: 'cctv-det-101',
        class: 'pothole',
        confidence: 0.958,
        severity: 'CRITICAL',
        normalizedBox: { x: 28, y: 45, width: 38, height: 26 },
        depthEstimate: 'Deep Crater (~12 cm)',
        riskLevel: 'HIGH_TWO_WHEELER_SKID_RISK',
      },
    ],
    lastScanned: new Date().toISOString(),
    vehicleCountMinute: 42,
  },
  {
    id: 'CAM-TUM-02',
    nameEn: 'Kyathsandra Highway Service Road / NH 48',
    nameKn: 'ಕ್ಯಾತಸಂದ್ರ ಹೆದ್ದಾರಿ ಸರ್ವಿಸ್ ರಸ್ತೆ / NH 48',
    taluk: 'Tumkur City (ತುಮಕೂರು ನಗರ)',
    latitude: 13.3440,
    longitude: 77.1424,
    fps: 25,
    resolution: '1080p FHD',
    status: 'LIVE_STREAMING',
    feedUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    activeDetections: [
      {
        id: 'cctv-det-102',
        class: 'pothole',
        confidence: 0.968,
        severity: 'CRITICAL',
        normalizedBox: { x: 22, y: 38, width: 44, height: 32 },
        depthEstimate: 'Dangerous Crater (~16 cm)',
        riskLevel: 'EMERGENCY_DISPATCH_REQUIRED',
      },
      {
        id: 'cctv-det-103',
        class: 'road_fissure',
        confidence: 0.884,
        severity: 'MODERATE',
        normalizedBox: { x: 72, y: 50, width: 20, height: 18 },
        depthEstimate: 'Edge Crack (~5 cm)',
        riskLevel: 'MODERATE_WEAR',
      },
    ],
    lastScanned: new Date().toISOString(),
    vehicleCountMinute: 68,
  },
  {
    id: 'CAM-TUM-03',
    nameEn: 'Mandipet Commercial Market Main Road',
    nameKn: 'ಮಂಡಿಪೇಟೆ ವಾಣಿಜ್ಯ ಮಾರುಕಟ್ಟೆ ಮುಖ್ಯ ರಸ್ತೆ',
    taluk: 'Tumkur City (Ward 1)',
    latitude: 13.3385,
    longitude: 77.1052,
    fps: 30,
    resolution: '1080p FHD',
    status: 'LIVE_STREAMING',
    feedUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    activeDetections: [
      {
        id: 'cctv-det-104',
        class: 'garbage_dump',
        confidence: 0.942,
        severity: 'HIGH',
        normalizedBox: { x: 15, y: 55, width: 32, height: 30 },
        depthEstimate: 'Footpath encroachment waste',
        riskLevel: 'SANITATION_RISK',
      },
    ],
    lastScanned: new Date().toISOString(),
    vehicleCountMinute: 55,
  },
  {
    id: 'CAM-TUM-04',
    nameEn: 'Sira Gate Highway Junction',
    nameKn: 'ಶಿರಾ ಗೇಟ್ ಹೆದ್ದಾರಿ ವೃತ್ತ',
    taluk: 'Tumkur City (Ward 6)',
    latitude: 13.3541,
    longitude: 77.0984,
    fps: 30,
    resolution: '1080p FHD',
    status: 'LIVE_STREAMING',
    feedUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=800&auto=format&fit=crop&q=80',
    activeDetections: [],
    lastScanned: new Date().toISOString(),
    vehicleCountMinute: 84,
  },
];

const IOT_SENSORS = [
  {
    id: 'IOT-WTR-01',
    nameEn: 'B.H. Road Water Pipeline Pressure Telemetry',
    nameKn: 'ಬಿ.ಎಚ್. ರಸ್ತೆ ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್ ಒತ್ತಡ ಸೆನ್ಸರ್',
    department: 'KUWSDB (Water Supply)',
    type: 'PRESSURE_SENSOR',
    location: 'Ashoka Circle, Tumkur',
    currentValue: 1.2,
    unit: 'bar',
    normalRange: '2.5 - 3.5 bar',
    status: 'CRITICAL_ALERT',
    alertMessageEn: 'Sudden pressure drop detected (1.2 bar). Underground pipeline rupture suspected.',
    alertMessageKn: 'ನೀರಿನ ಒತ್ತಡ ಹಠಾತ್ ಇಳಿಕೆ (1.2 bar). ಭೂಗತ ಪೈಪ್ ಒಡೆದಿರುವ ಶಂಕೆ.',
    emergencyPhase: 'PHASE_3_HIGH',
    lastTelemetry: new Date().toISOString(),
  },
  {
    id: 'IOT-WST-02',
    nameEn: 'Mandipet Smart Waste Bin #14 (Ultrasonic Fill-Level)',
    nameKn: 'ಮಂಡಿಪೇಟೆ ಸ್ಮಾರ್ಟ್ ಕಸದ ತೊಟ್ಟಿ #14 ಸೆನ್ಸರ್',
    department: 'Tumkur City Corporation (TCC)',
    type: 'FILL_LEVEL_SENSOR',
    location: 'Mandipet Vegetable Market',
    currentValue: 92,
    unit: '% full',
    normalRange: '< 75%',
    status: 'WARNING_DISPATCH',
    alertMessageEn: 'Bin capacity reached 92%. Automated compactor truck dispatch triggered.',
    alertMessageKn: 'ಕಸದ ತೊಟ್ಟಿ 92% ತುಂಬಿದೆ. ಸ್ವಯಂಚಾಲಿತ ಕಸದ ವಾಹನ ನಿಯೋಜಿಸಲಾಗಿದೆ.',
    emergencyPhase: 'PHASE_2_MEDIUM',
    lastTelemetry: new Date().toISOString(),
  },
  {
    id: 'IOT-LTE-03',
    nameEn: 'SS Puram Ward 4 Smart Streetlight Power Feeder',
    nameKn: 'ಎಸ್.ಎಸ್. ಪುರಂ ವಾರ್ಡ್ 4 ಬೀದಿ ದೀಪ ಫೀಡರ್ ಸೆನ್ಸರ್',
    department: 'BESCOM (Electricity)',
    type: 'POWER_AMPERAGE_SENSOR',
    location: 'Siddaganga Extension Main Road',
    currentValue: 19.8,
    unit: 'Amps',
    normalRange: '18 - 24 Amps',
    status: 'NORMAL',
    alertMessageEn: 'All 48 LED luminaires operating at optimal illumination.',
    alertMessageKn: 'ಎಲ್ಲಾ 48 ಬೀದಿ ದೀಪಗಳು ಸರಿಯಾಗಿ ಬೆಳಗುತ್ತಿವೆ.',
    emergencyPhase: 'PHASE_1_ROUTINE',
    lastTelemetry: new Date().toISOString(),
  },
  {
    id: 'IOT-PWR-04',
    nameEn: 'Batawadi Industrial Transformer Temperature Monitor',
    nameKn: 'ಬಟವಾಡಿ ಕೈಗಾರಿಕಾ ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ತಾಪಮಾನ ಸೆನ್ಸರ್',
    department: 'BESCOM (Electricity)',
    type: 'THERMAL_SURGE_SENSOR',
    location: 'Batwadi Industrial Area Feeder 2',
    currentValue: 72,
    unit: '°C',
    normalRange: '45 - 80 °C',
    status: 'NORMAL',
    alertMessageEn: 'Core operating temperature stable. Surge suppression active.',
    alertMessageKn: 'ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ತಾಪಮಾನ ನಿಯಂತ್ರಣದಲ್ಲಿದೆ.',
    emergencyPhase: 'PHASE_1_ROUTINE',
    lastTelemetry: new Date().toISOString(),
  },
  {
    id: 'IOT-WTR-05',
    nameEn: 'Kyathsandra Hill Reservoir Level Monitor',
    nameKn: 'ಕ್ಯಾತಸಂದ್ರ ಜಲಸಂಗ್ರಹಾಗಾರ ನೀರಿನ ಮಟ್ಟ',
    department: 'KUWSDB (Water Supply)',
    type: 'LIQUID_LEVEL_SENSOR',
    location: 'Kyathsandra Overhead Tank',
    currentValue: 84,
    unit: '% capacity',
    normalRange: '40 - 95%',
    status: 'NORMAL',
    alertMessageEn: 'Adequate municipal drinking water reserves for 48 hours.',
    alertMessageKn: '48 ಗಂಟೆಗಳ ಕಾಲ ಕುಡಿಯುವ ನೀರಿನ ಸಮರ್ಪಕ ದಾಸ್ತಾನು ಇದೆ.',
    emergencyPhase: 'PHASE_1_ROUTINE',
    lastTelemetry: new Date().toISOString(),
  },
];

const TALUK_ROAD_DEGRADATION_INDEX = [
  {
    talukCode: 'TUMKUR_CITY',
    talukNameEn: 'Tumkur City',
    talukNameKn: 'ತುಮಕೂರು ನಗರ',
    healthScore: 78,
    riskLevel: 'MODERATE_WEAR',
    riskColor: '#d97706',
    trafficVolumePerDay: 48000,
    potholesPredicted30Days: 5,
    estimatedPatchCost: '₹1,25,000',
    preventiveResurfaceCost: '₹3,40,000',
    projectedSavingsPct: 48,
    monsoonVulnerability: 'HIGH',
    topCriticalCorridors: ['B.H. Road', 'Ashoka Circle', 'Kyathsandra Bypass'],
  },
  {
    talukCode: 'TUMKUR_RURAL',
    talukNameEn: 'Tumkur Rural',
    talukNameKn: 'ತುಮಕೂರು ಗ್ರಾಮಾಂತರ',
    healthScore: 62,
    riskLevel: 'HIGH_DEGRADATION',
    riskColor: '#ea580c',
    trafficVolumePerDay: 18000,
    potholesPredicted30Days: 9,
    estimatedPatchCost: '₹2,10,000',
    preventiveResurfaceCost: '₹4,80,000',
    projectedSavingsPct: 56,
    monsoonVulnerability: 'SEVERE',
    topCriticalCorridors: ['Hebbur Road', 'Bellavi Arterial'],
  },
  {
    talukCode: 'GUBBI',
    talukNameEn: 'Gubbi',
    talukNameKn: 'ಗುಬ್ಬಿ',
    healthScore: 58,
    riskLevel: 'CRITICAL_ACTION_REQUIRED',
    riskColor: '#dc2626',
    trafficVolumePerDay: 22000,
    potholesPredicted30Days: 12,
    estimatedPatchCost: '₹3,20,000',
    preventiveResurfaceCost: '₹6,10,000',
    projectedSavingsPct: 62,
    monsoonVulnerability: 'CRITICAL',
    topCriticalCorridors: ['Gubbi-Nittur Highway', 'Kallambella Link'],
  },
  {
    talukCode: 'TIPTUR',
    talukNameEn: 'Tiptur',
    talukNameKn: 'ತಿಪಟೂರು',
    healthScore: 74,
    riskLevel: 'MODERATE_WEAR',
    riskColor: '#d97706',
    trafficVolumePerDay: 31000,
    potholesPredicted30Days: 6,
    estimatedPatchCost: '₹1,50,000',
    preventiveResurfaceCost: '₹3,80,000',
    projectedSavingsPct: 50,
    monsoonVulnerability: 'MODERATE',
    topCriticalCorridors: ['Coconut Market APMC Arterial', 'Arsikere Road'],
  },
  {
    talukCode: 'KUNIGAL',
    talukNameEn: 'Kunigal',
    talukNameKn: 'ಕುಣಿಗಲ್',
    healthScore: 66,
    riskLevel: 'HIGH_DEGRADATION',
    riskColor: '#ea580c',
    trafficVolumePerDay: 29000,
    potholesPredicted30Days: 8,
    estimatedPatchCost: '₹1,95,000',
    preventiveResurfaceCost: '₹4,40,000',
    projectedSavingsPct: 54,
    monsoonVulnerability: 'HIGH',
    topCriticalCorridors: ['Kunigal Stud Farm Road', 'Yediyur Link'],
  },
  {
    talukCode: 'SIRA',
    talukNameEn: 'Sira',
    talukNameKn: 'ಶಿರಾ',
    healthScore: 70,
    riskLevel: 'MODERATE_WEAR',
    riskColor: '#d97706',
    trafficVolumePerDay: 34000,
    potholesPredicted30Days: 6,
    estimatedPatchCost: '₹1,60,000',
    preventiveResurfaceCost: '₹3,90,000',
    projectedSavingsPct: 52,
    monsoonVulnerability: 'MODERATE',
    topCriticalCorridors: ['NH 48 Bypass Junction', 'Kaggaladu Link'],
  },
  {
    talukCode: 'MADHUGIRI',
    talukNameEn: 'Madhugiri',
    talukNameKn: 'ಮಧುಗಿರಿ',
    healthScore: 68,
    riskLevel: 'MODERATE_WEAR',
    riskColor: '#d97706',
    trafficVolumePerDay: 16000,
    potholesPredicted30Days: 7,
    estimatedPatchCost: '₹1,75,000',
    preventiveResurfaceCost: '₹4,10,000',
    projectedSavingsPct: 53,
    monsoonVulnerability: 'HIGH',
    topCriticalCorridors: ['Monolith Fort Base Road', 'Midigeshi Link'],
  },
  {
    talukCode: 'PAVAGADA',
    talukNameEn: 'Pavagada',
    talukNameKn: 'ಪಾವಗಡ',
    healthScore: 82,
    riskLevel: 'LOW_RISK_STABLE',
    riskColor: '#16a34a',
    trafficVolumePerDay: 12000,
    potholesPredicted30Days: 3,
    estimatedPatchCost: '₹75,000',
    preventiveResurfaceCost: '₹2,20,000',
    projectedSavingsPct: 40,
    monsoonVulnerability: 'LOW',
    topCriticalCorridors: ['Solar Park Arterial', 'Y.N. Hosakote Road'],
  },
  {
    talukCode: 'KORATAGERE',
    talukNameEn: 'Koratagere',
    talukNameKn: 'ಕೊರಟಗೆರೆ',
    healthScore: 64,
    riskLevel: 'HIGH_DEGRADATION',
    riskColor: '#ea580c',
    trafficVolumePerDay: 20000,
    potholesPredicted30Days: 8,
    estimatedPatchCost: '₹1,90,000',
    preventiveResurfaceCost: '₹4,30,000',
    projectedSavingsPct: 55,
    monsoonVulnerability: 'HIGH',
    topCriticalCorridors: ['Goravanahalli Temple Corridor', 'Siddara Betta Road'],
  },
  {
    talukCode: 'CHIKKANAYAKANAHALLI',
    talukNameEn: 'Chikkanayakanahalli',
    talukNameKn: 'ಚಿಕ್ಕನಾಯಕನಹಳ್ಳಿ',
    healthScore: 60,
    riskLevel: 'CRITICAL_ACTION_REQUIRED',
    riskColor: '#dc2626',
    trafficVolumePerDay: 24000,
    potholesPredicted30Days: 11,
    estimatedPatchCost: '₹2,80,000',
    preventiveResurfaceCost: '₹5,60,000',
    projectedSavingsPct: 60,
    monsoonVulnerability: 'SEVERE',
    topCriticalCorridors: ['Mineral Freight Corridor', 'Huliyar Arterial'],
  },
  {
    talukCode: 'TURUVEKERE',
    talukNameEn: 'Turuvekere',
    talukNameKn: 'ತುರುವೇಕೆರೆ',
    healthScore: 72,
    riskLevel: 'MODERATE_WEAR',
    riskColor: '#d97706',
    trafficVolumePerDay: 17000,
    potholesPredicted30Days: 5,
    estimatedPatchCost: '₹1,30,000',
    preventiveResurfaceCost: '₹3,50,000',
    projectedSavingsPct: 49,
    monsoonVulnerability: 'MODERATE',
    topCriticalCorridors: ['Dabbeghatta Road', 'Mayasandra Link'],
  },
];

/**
 * Automatically create an official municipal ticket from CCTV / IoT detection
 */
async function autoCreateSmartCityIssue({ source, title, description, categoryCode, urgency, latitude, longitude, addressText }) {
  // Find or default taluk and category
  const category = await prisma.category.findUnique({
    where: { code: categoryCode || 'POTHOLE' },
    include: { department: true }
  });

  const taluk = await prisma.taluk.findFirst({
    where: { code: 'TUMKUR_CITY' }
  });

  // Find a system or admin user to attribute automated reports
  const systemUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!category || !taluk || !systemUser) {
    throw new Error('Database catalogs not seeded for smart city auto-ticketing');
  }

  const trackingNumber = `SMC-${Date.now().toString().slice(-6)}`;
  const slaHours = urgency === 'EMERGENCY' ? 12 : (category.slaHours || 24);
  const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

  const issue = await prisma.issue.create({
    data: {
      trackingNumber,
      title: title || `[${source}] Automated Detection Alert`,
      description: description || `Automated municipal alert received from ${source} telemetry.`,
      latitude: latitude || 13.3422,
      longitude: longitude || 77.1018,
      addressText: addressText || 'Smart City Telemetry Grid, Tumkur',
      urgency: urgency || 'HIGH',
      status: 'VERIFIED', // CCTV and IoT alerts are pre-verified by machine vision
      categoryId: category.id,
      departmentId: category.departmentId,
      talukId: taluk.id,
      reporterId: systemUser.id,
      slaDeadline,
      photoUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80'
      ]),
    },
    include: {
      category: true,
      department: true,
      taluk: true,
    }
  });

  // Create initial timeline event
  await prisma.issueTimeline.create({
    data: {
      issueId: issue.id,
      status: 'VERIFIED',
      actionEn: `Automated issue registered via ${source}`,
      actionKn: `${source} ಮೂಲಕ ಸ್ವಯಂಚಾಲಿತ ದೂರು ದಾಖಲಾಗಿದೆ`,
      notes: `Automated issue registered and verified via ${source} Edge AI. PWD/Department dispatch alert issued.`,
      actorName: `${source} Neural Telemetry`,
      actorRole: 'SYSTEM_AI',
    }
  });

  return issue;
}

module.exports = {
  CCTV_CAMERAS,
  IOT_SENSORS,
  TALUK_ROAD_DEGRADATION_INDEX,
  autoCreateSmartCityIssue,
};
