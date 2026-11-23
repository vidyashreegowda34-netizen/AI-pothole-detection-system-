// Constants and District Data for Tumkur
const ROLES = {
  CITIZEN: 'CITIZEN',
  OFFICER: 'OFFICER',
  ADMIN: 'ADMIN',
};

const ISSUE_STATUS = {
  SUBMITTED: 'SUBMITTED',
  VERIFIED: 'VERIFIED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
};

const URGENCY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  EMERGENCY: 'EMERGENCY',
};

const TALUKS = [
  { code: 'TUMKUR_CITY', nameEn: 'Tumkur City', nameKn: 'ತುಮಕೂರು ನಗರ', latitude: 13.3409, longitude: 77.1010, isUrban: true },
  { code: 'TUMKUR_RURAL', nameEn: 'Tumkur Rural', nameKn: 'ತುಮಕೂರು ಗ್ರಾಮಾಂತರ', latitude: 13.3250, longitude: 77.1400, isUrban: false },
  { code: 'GUBBI', nameEn: 'Gubbi', nameKn: 'ಗುಬ್ಬಿ', latitude: 13.3121, longitude: 76.9406, isUrban: false },
  { code: 'TIPTUR', nameEn: 'Tiptur', nameKn: 'ತಿಪಟೂರು', latitude: 13.2573, longitude: 76.4789, isUrban: false },
  { code: 'KUNIGAL', nameEn: 'Kunigal', nameKn: 'ಕುಣಿಗಲ್', latitude: 13.0238, longitude: 77.0278, isUrban: false },
  { code: 'SIRA', nameEn: 'Sira', nameKn: 'ಶಿರಾ', latitude: 13.7441, longitude: 76.9067, isUrban: false },
  { code: 'MADHUGIRI', nameEn: 'Madhugiri', nameKn: 'ಮಧುಗಿರಿ', latitude: 13.6631, longitude: 77.2096, isUrban: false },
  { code: 'PAVAGADA', nameEn: 'Pavagada', nameKn: 'ಪಾವಗಡ', latitude: 14.1014, longitude: 77.2798, isUrban: false },
  { code: 'KORATAGERE', nameEn: 'Koratagere', nameKn: 'ಕೊರಟಗೆರೆ', latitude: 13.5222, longitude: 77.2372, isUrban: false },
  { code: 'CHIKKANAYAKANAHALLI', nameEn: 'Chikkanayakanahalli', nameKn: 'ಚಿಕ್ಕನಾಯಕನಹಳ್ಳಿ', latitude: 13.4184, longitude: 76.6186, isUrban: false },
  { code: 'TURUVEKERE', nameEn: 'Turuvekere', nameKn: 'ತುರುವೇಕೆರೆ', latitude: 13.1605, longitude: 76.6698, isUrban: false }
];

const TUMKUR_CITY_WARDS = [
  { wardNumber: 1, nameEn: 'Mandipet', nameKn: 'ಮಂಡಿಪೇಟೆ' },
  { wardNumber: 2, nameEn: 'Ashok Nagar', nameKn: 'ಅಶೋಕ ನಗರ' },
  { wardNumber: 3, nameEn: 'Kyathsandra', nameKn: 'ಕ್ಯಾತಸಂದ್ರ' },
  { wardNumber: 4, nameEn: 'SS Puram / Siddaganga Ext.', nameKn: 'ಎಸ್.ಎಸ್. ಪುರಂ' },
  { wardNumber: 5, nameEn: 'Belagumba', nameKn: 'ಬೆಳಗುಂಬ' },
  { wardNumber: 6, nameEn: 'Batwadi', nameKn: 'ಬಟವಾಡಿ' },
  { wardNumber: 7, nameEn: 'Melekote', nameKn: 'ಮೇಳೆಕೋಟೆ' },
  { wardNumber: 8, nameEn: 'Maralur', nameKn: 'ಮರಳೂರು' },
  { wardNumber: 9, nameEn: 'Gandhinagar', nameKn: 'ಗಾಂಧಿನಗರ' },
  { wardNumber: 10, nameEn: 'Vinobhanagar', nameKn: 'ವಿನೋಬಾನಗರ' }
];

const DEPARTMENTS = [
  { code: 'TCC', nameEn: 'Tumkur City Corporation', nameKn: 'ತುಮಕೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ', description: 'Urban municipal governance, cleanliness, street maintenance and sanitation' },
  { code: 'PWD', nameEn: 'Public Works Department (PWD)', nameKn: 'ಲೋಕೋಪಯೋಗಿ ಇಲಾಖೆ', description: 'District roads, highway bridges, and major public infrastructure' },
  { code: 'BESCOM', nameEn: 'BESCOM Electricity Board', nameKn: 'ಬೆಸ್ಕಾಂ (ವಿದ್ಯುತ್ ಸರಬರಾಜು)', description: 'Power grid, transformers, electrical poles and street lighting' },
  { code: 'KUWSDB', nameEn: 'Water Supply & Drainage Board', nameKn: 'ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಒಳಚರಂಡಿ ಮಂಡಳಿ', description: 'Drinking water distribution, pipeline maintenance and underground drainage' },
  { code: 'GRAM_PANCHAYAT', nameEn: 'Gram Panchayat & Rural Development', nameKn: 'ಗ್ರಾಮ ಪಂಚಾಯತ್ ಮತ್ತು ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ', description: 'Village civic amenities, rural sanitation, borewells and local paths' },
  { code: 'HEALTH', nameEn: 'Health & Family Welfare', nameKn: 'ಆರೋಗ್ಯ ಮತ್ತು ಕುಟುಂಬ ಕಲ್ಯಾಣ ಇಲಾಖೆ', description: 'Vector control, public health, disease prevention and food safety' },
  { code: 'EDUCATION', nameEn: 'Department of Public Instruction', nameKn: 'ಸಾರ್ವಜನಿಕ ಶಿಕ್ಷಣ ಇಲಾಖೆ', description: 'Government school infrastructure, safety and premises maintenance' }
];

const CATEGORIES = [
  { code: 'POTHOLE', deptCode: 'PWD', nameEn: 'Potholes & Road Damage', nameKn: 'ರಸ್ತೆ ಗುಂಡಿ ಮತ್ತು ದುರಸ್ತಿ', slaHours: 72, icon: 'road' },
  { code: 'GARBAGE', deptCode: 'TCC', nameEn: 'Garbage & Waste Dumping', nameKn: 'ಕಸ ಮತ್ತು ತ್ಯಾಜ್ಯ ವಿಲೇವಾರಿ', slaHours: 24, icon: 'trash-2' },
  { code: 'STREETLIGHT', deptCode: 'BESCOM', nameEn: 'Non-Functional Streetlights', nameKn: 'ಕೆಟ್ಟಿರುವ ಬೀದಿ ದೀಪಗಳು', slaHours: 48, icon: 'lightbulb' },
  { code: 'WATER_SUPPLY', deptCode: 'KUWSDB', nameEn: 'Drinking Water Supply Disruption', nameKn: 'ಕುಡಿಯುವ ನೀರು ಸರಬರಾಜು ವ್ಯತ್ಯಯ', slaHours: 24, icon: 'droplet' },
  { code: 'PIPE_LEAK', deptCode: 'KUWSDB', nameEn: 'Pipeline Leakage & Burst', nameKn: 'ಪೈಪ್‌ಲೈನ್ ಸೋರಿಕೆ ಮತ್ತು ಒಡೆತ', slaHours: 24, icon: 'waves' },
  { code: 'DRAINAGE', deptCode: 'TCC', nameEn: 'Sewage & Drain Overflow', nameKn: 'ಚರಂಡಿ ಮತ್ತು ಒಳಚರಂಡಿ ಉಕ್ಕಿ ಹರಿಯುವುದು', slaHours: 24, icon: 'activity' },
  { code: 'ELECTRICITY', deptCode: 'BESCOM', nameEn: 'Dangling Power Cables / Sparking', nameKn: 'ಅಪಾಯಕಾರಿ ವಿದ್ಯುತ್ ತಂತಿ / ಪರಿವರ್ತಕ', slaHours: 12, icon: 'zap' },
  { code: 'PUBLIC_TOILET', deptCode: 'TCC', nameEn: 'Public Toilet Cleanliness', nameKn: 'ಸಾರ್ವಜನಿಕ ಶೌಚಾಲಯ ಸ್ವಚ್ಛತೆ', slaHours: 24, icon: 'shield-alert' },
  { code: 'STRAY_ANIMALS', deptCode: 'TCC', nameEn: 'Stray Dogs / Animal Menace', nameKn: 'ಬೀದಿ ನಾಯಿಗಳು ಮತ್ತು ಪ್ರಾಣಿಗಳ ಹಾವಳಿ', slaHours: 48, icon: 'alert-triangle' },
  { code: 'RURAL_SANITATION', deptCode: 'GRAM_PANCHAYAT', nameEn: 'Village Borewell & Sanitation', nameKn: 'ಗ್ರಾಮೀಣ ಕೊಳವೆಬಾವಿ ಮತ್ತು ನೈರ್ಮಲ್ಯ', slaHours: 48, icon: 'compass' },
  { code: 'MOSQUITO_FOGGING', deptCode: 'HEALTH', nameEn: 'Stagnant Water & Dengue Risk', nameKn: 'ನಿಂತ ನೀರು ಮತ್ತು ಸೊಳ್ಳೆ ನಿಯಂತ್ರಣ', slaHours: 48, icon: 'heart-pulse' },
  { code: 'SCHOOL_INFRA', deptCode: 'EDUCATION', nameEn: 'Govt School Compound / Roof Damage', nameKn: 'ಸರ್ಕಾರಿ ಶಾಲೆ ಕೊಠಡಿ / ಕಾಂಪೌಂಡ್ ದುರಸ್ತಿ', slaHours: 120, icon: 'book-open' }
];

module.exports = {
  ROLES,
  ISSUE_STATUS,
  URGENCY,
  TALUKS,
  TUMKUR_CITY_WARDS,
  DEPARTMENTS,
  CATEGORIES
};
