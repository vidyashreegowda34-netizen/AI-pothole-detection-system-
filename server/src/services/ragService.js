/**
 * Retrieval-Augmented Generation (RAG) Civic Policy Engine
 * Namma Parishkara AI - Tumkur District Civic Governance
 * Knowledge Base: Karnataka Municipal Corporations Act, Tumkur City Citizen Charter,
 * PWD Road Safety Norms, BESCOM Emergency Rules, KUWSDB Water Supply Regulations
 */

const CIVIC_POLICY_KNOWLEDGE_BASE = [
  {
    id: 'POL-PWD-01',
    title: 'PWD Pothole & Road Distress Repair Standards',
    titleKn: 'ಲೋಕೋಪಯೋಗಿ ಇಲಾಖೆ ರಸ್ತೆ ಗುಂಡಿ ದುರಸ್ತಿ ನಿಯಮಗಳು',
    department: 'Public Works Department (PWD)',
    categoryCode: 'POTHOLE',
    keywords: ['pothole', 'road', 'crater', 'asphalt', 'tar', 'highway', 'ಗುಂಡಿ', 'ರಸ್ತೆ', 'ಡಾಂಬರು', 'ಹೊಂಡ'],
    standardSLA: '72 Hours',
    emergencySLA: '12 Hours (Phase 4 Critical Hazard)',
    citation: 'Karnataka State Highway Authority & IRC:SP:20 Road Maintenance Guidelines',
    summaryEn: 'Under PWD standards, any pothole deeper than 10cm or on major transit arteries must be prioritized under Phase 4 Emergency (12h SLA) with cold/hot bituminous asphalt mix. Routine residential potholes must be inspected and filled within 72 hours.',
    summaryKn: 'ಪಿಡಬ್ಲ್ಯೂಡಿ ನಿಯಮಾವಳಿಗಳ ಪ್ರಕಾರ, 10 ಸೆಂ.ಮೀ ಗಿಂತ ಹೆಚ್ಚು ಆಳವಿರುವ ಅಥವಾ ಪ್ರಮುಖ ರಸ್ತೆಗಳಲ್ಲಿನ ಅಪಾಯಕಾರಿ ಗುಂಡಿಗಳನ್ನು ಹಂತ 4 ರ ತುರ್ತು ಪರಿಹಾರ (12 ಗಂಟೆಗಳ SLA) ಅಡಿಯಲ್ಲಿ ದುರಸ್ತಿ ಮಾಡಬೇಕು. ಸಾಮಾನ್ಯ ರಸ್ತೆ ಗುಂಡಿಗಳನ್ನು 72 ಗಂಟೆಗಳಲ್ಲಿ ಮುಚ್ಚಬೇಕು.',
    actionEn: 'Dispatch road maintenance division with rapid-setting asphalt patcher. Photographic before-and-after proof required.',
    actionKn: 'ತ್ವರಿತ ಡಾಂಬರು ಪ್ಯಾಚಿಂಗ್ ತಂಡವನ್ನು ಕಳುಹಿಸುವುದು. ಕಾಮಗಾರಿ ಮುಗಿದ ನಂತರ ಫೋಟೋ ಪುರಾವೆ ಕಡ್ಡಾಯ.',
    sampleComplaint: {
      title: 'Dangerous road crater requiring emergency asphalt patch',
      categoryCode: 'POTHOLE',
      urgency: 'HIGH',
    },
  },
  {
    id: 'POL-BES-02',
    title: 'BESCOM High-Voltage Electrical Safety & Streetlights',
    titleKn: 'ಬೆಸ್ಕಾಂ ವಿದ್ಯುತ್ ಸುರಕ್ಷತೆ ಮತ್ತು ಬೀದಿ ದೀಪಗಳ ನಿಯಮ',
    department: 'BESCOM (Bangalore Electricity Supply Company)',
    categoryCode: 'ELECTRICITY',
    keywords: ['wire', 'spark', 'shock', 'electric', 'transformer', 'pole', 'current', 'ವಿದ್ಯುತ್', 'ತಂತಿ', 'ಕರೆಂಟ್', 'ಶಾಕ್', 'ಸ್ಪಾರ್ಕ್'],
    standardSLA: '24-48 Hours',
    emergencySLA: '12 Hours (Phase 4 Life Hazard)',
    citation: 'Central Electricity Authority (Safety & Electric Supply) Regulations Section 74',
    summaryEn: 'Snapped high-tension wires, dangling cables, or sparking transformers constitute an immediate public safety emergency. Power must be tripped remotely within 15 minutes and on-site repair crew dispatched within 12 hours.',
    summaryKn: 'ತುಂಡಾದ ವಿದ್ಯುತ್ ತಂತಿಗಳು, ಸ್ಪಾರ್ಕ್ ಅಥವಾ ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ದೋಷಗಳು ತಕ್ಷಣದ ಸಾರ್ವಜನಿಕ ಪ್ರಾಣಾಪಾಯ ಉಂಟುಮಾಡುತ್ತವೆ. ಲೈನ್‌ಮನ್‌ಗಳು ತಕ್ಷಣ ವಿದ್ಯುತ್ ಸ್ಥಗಿತಗೊಳಿಸಿ 12 ಗಂಟೆಗಳ ಒಳಗೆ ಸರಿಪಡಿಸಬೇಕು.',
    actionEn: 'De-energize feeder line immediately. Send emergency linemen squad to re-string conductors.',
    actionKn: 'ಫೀಡರ್ ಲೈನ್ ವಿದ್ಯುತ್ ತಕ್ಷಣ ಕಡಿತಗೊಳಿಸಿ ತುರ್ತು ಲೈನ್‌ಮನ್ ತಂಡವನ್ನು ನಿಯೋಜಿಸುವುದು.',
    sampleComplaint: {
      title: 'Dangling electric wire posing immediate danger to pedestrians',
      categoryCode: 'ELECTRICITY',
      urgency: 'EMERGENCY',
    },
  },
  {
    id: 'POL-KUW-03',
    title: 'KUWSDB Pipeline Leakage & Safe Drinking Water',
    titleKn: 'ಕರ್ನಾಟಕ ನಗರ ನೀರು ಸರಬರಾಜು ಮಂಡಳಿ ಪೈಪ್‌ಲೈನ್ ನೀತಿ',
    department: 'Karnataka Urban Water Supply Board (KUWSDB)',
    categoryCode: 'PIPE_LEAK',
    keywords: ['water', 'pipe', 'leak', 'drinking water', 'tap', 'burst', 'ನೀರು', 'ಪೈಪ್', 'ಸೋರಿಕೆ', 'ಕುಡಿಯುವ ನೀರು'],
    standardSLA: '24 Hours',
    emergencySLA: '12 Hours',
    citation: 'Karnataka Urban Water Supply & Drainage Board Act 1973',
    summaryEn: 'Major municipal water pipeline bursts causing road flooding or contaminated drinking water must be addressed within 24 hours. Valves must be isolated to prevent water wastage and public road erosion.',
    summaryKn: 'ಮುಖ್ಯ ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್‌ಲೈನ್ ಒಡೆದು ನೀರು ವ್ಯರ್ಥವಾಗುತ್ತಿದ್ದರೆ ಅಥವಾ ರಸ್ತೆ ಕೊಚ್ಚಿ ಹೋಗುತ್ತಿದ್ದರೆ 24 ಗಂಟೆಗಳ ಒಳಗೆ ವಾಲ್ವ್ ಬಂದ್ ಮಾಡಿ ಪೈಪ್ ರಿಪೇರಿ ಮಾಡಬೇಕು.',
    actionEn: 'Isolate supply valve, excavate damaged pipe segment, install collar clamp, and flush line.',
    actionKn: 'ವಾಲ್ವ್ ಬಂದ್ ಮಾಡಿ, ಒಡೆದ ಪೈಪ್ ಭಾಗವನ್ನು ಕಾಲರ್ ಕ್ಲ್ಯಾಂಪ್ ಮೂಲಕ ಸರಿಪಡಿಸುವುದು.',
    sampleComplaint: {
      title: 'Main drinking water pipeline burst causing road overflow',
      categoryCode: 'PIPE_LEAK',
      urgency: 'HIGH',
    },
  },
  {
    id: 'POL-TCC-04',
    title: 'Tumkur City Corporation Solid Waste & Drainage Management',
    titleKn: 'ತುಮಕೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ ತ್ಯಾಜ್ಯ ಮತ್ತು ಚರಂಡಿ ನಿಯಮಾವಳಿ',
    department: 'Tumkur City Corporation (TCC)',
    categoryCode: 'GARBAGE',
    keywords: ['garbage', 'waste', 'trash', 'drainage', 'gutter', 'sewer', 'smell', 'ಕಸ', 'ತ್ಯಾಜ್ಯ', 'ಚರಂಡಿ', 'ಗಟಾರ'],
    standardSLA: '24 Hours',
    emergencySLA: '18 Hours',
    citation: 'Solid Waste Management Rules 2016 & Karnataka Municipal Corporations Act Sec 134',
    summaryEn: 'Overflowing public bins, unauthorized black spots, and blocked stormwater drains must be cleared within 24 hours by the municipal sanitation squad to prevent dengue, cholera, and monsoon waterlogging.',
    summaryKn: 'ಸಾರ್ವಜನಿಕ ಕಸದ ತೊಟ್ಟಿಗಳು ತುಂಬಿ ತುಳುಕುತ್ತಿದ್ದರೆ ಅಥವಾ ಚರಂಡಿ ಕಟ್ಟಿಕೊಂಡು ನೀರು ನಿಂತಿದ್ದರೆ 24 ಗಂಟೆಗಳ ಒಳಗೆ ಪೌರಕಾರ್ಮಿಕರು ಮತ್ತು ಜೆಟ್ ಯಂತ್ರಗಳ ಮೂಲಕ ತೆರವುಗೊಳಿಸಬೇಕು.',
    actionEn: 'Deploy compactor truck and sanitation team. Spray disinfectant and lime powder.',
    actionKn: 'ಕಸದ ವಾಹನ ಮತ್ತು ಸ್ವಚ್ಛತಾ ಸಿಬ್ಬಂದಿಯನ್ನು ಕಳುಹಿಸಿ ಬ್ಲೀಚಿಂಗ್ ಪುಡಿ ಸಿಂಪಡಿಸುವುದು.',
    sampleComplaint: {
      title: 'Uncollected garbage heap blocking street and causing foul smell',
      categoryCode: 'GARBAGE',
      urgency: 'MEDIUM',
    },
  },
  {
    id: 'POL-CIT-05',
    title: 'Citizen Grievance Redressal & Ticket Reopen Rights',
    titleKn: 'ನಾಗರಿಕರ ಹಕ್ಕುಗಳು ಮತ್ತು ದೂರು ಮರುತೆರೆಯುವ ನಿಯಮ',
    department: 'District Administrative Governance',
    categoryCode: 'REOPEN',
    keywords: ['reopen', 'unsatisfied', 'fake resolution', 'complaint status', 'rights', 'ಮರುತೆರೆ', 'ಅಸಮಾಧಾನ', 'ಪರಿಹಾರವಾಗಿಲ್ಲ'],
    standardSLA: 'Instant Reopen (7-Day Citizen Window)',
    emergencySLA: 'N/A',
    citation: 'Karnataka Sakala Services Act 2011 & Citizen Charter',
    summaryEn: 'Citizens have the legal right under the Sakala Act to inspect any resolved civic complaint. If the repair is sub-standard or falsely reported as closed, the citizen can click "Reopen Issue" within 7 days, which triggers an automated audit alert to the District Collector.',
    summaryKn: 'ಸಮಸ್ಯೆ ಸರಿಯಾಗಿ ಬಗೆಹರಿಯದೆ ಅಧಿಕಾರಿಗಳು ಮುಕ್ತಾಯಗೊಳಿಸಿದ್ದರೆ, ಸಕಾಲ ಕಾಯ್ದೆಯಡಿ ನಾಗರಿಕರು 7 ದಿನಗಳ ಒಳಗೆ "Reopen (ಮರುತೆರೆಯಿರಿ)" ಬಟನ್ ಒತ್ತುವ ಮೂಲಕ ದೂರನ್ನು ಮರುಪರಿಶೀಲನೆಗೆ ಕಳುಹಿಸಬಹುದು.',
    actionEn: 'Citizen triggers ticket reopen modal on the issue detail page with mandatory explanation.',
    actionKn: 'ದೂರಿನ ವಿವರಗಳ ಪುಟದಲ್ಲಿ "ದೂರು ಮರುತೆರೆಯಿರಿ" ಆಯ್ಕೆ ಬಳಸಿ ಕಾರಣ ದಾಖಲಿಸಿ.',
    sampleComplaint: {
      title: 'Civic issue reopened due to incomplete ground work',
      categoryCode: 'REOPEN',
      urgency: 'HIGH',
    },
  },
];

/**
 * RAG Semantic Search & Answer Generation
 * Retrieves relevant municipal policy documents based on citizen query
 */
function queryCivicPolicyRAG({ query = '', language = 'en' }) {
  const normalized = (query || '').toLowerCase().trim();
  const isKn = language === 'kn' || /[\u0C80-\u0CFF]/.test(normalized);

  if (!normalized) {
    return {
      success: true,
      query,
      answer: isKn
        ? 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಪರಿಷ್ಕಾರ AI ನೀತಿ ಸಹಾಯಕ. ರಸ್ತೆ ಗುಂಡಿ, ವಿದ್ಯುತ್, ನೀರು ಅಥವಾ ಕಸದ ನಿಯಮಗಳು ಮತ್ತು SLA ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.'
        : 'Hello! I am your Parishkara AI Policy Assistant. Ask any question about Tumkur municipal bylaws, PWD road standards, BESCOM electrical safety, or SLA timelines.',
      matchedPolicy: null,
      suggestedComplaint: null,
    };
  }

  // Score each policy document based on token / semantic overlap
  let bestDoc = null;
  let maxScore = 0;

  for (const doc of CIVIC_POLICY_KNOWLEDGE_BASE) {
    let score = 0;
    const allKeywords = [...doc.keywords, doc.categoryCode.toLowerCase(), doc.department.toLowerCase()];
    
    for (const kw of allKeywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += kw.length > 5 ? 3 : 1.5;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestDoc = doc;
    }
  }

  // Fallback to PWD or General Policy if no strong keyword hit
  if (!bestDoc || maxScore === 0) {
    bestDoc = CIVIC_POLICY_KNOWLEDGE_BASE[0]; // Default to PWD road safety
  }

  const answerEn = `According to the **${bestDoc.title}** (${bestDoc.citation}):
- **Standard Resolution SLA**: ${bestDoc.standardSLA}
- **Emergency Priority**: ${bestDoc.emergencySLA}
- **Department Responsible**: ${bestDoc.department}

**Policy Guidance**: ${bestDoc.summaryEn}

**Recommended Action**: ${bestDoc.actionEn}`;

  const answerKn = `**${bestDoc.titleKn}** (${bestDoc.citation}) ಪ್ರಕಾರ:
- **ಸಾಮಾನ್ಯ ಪರಿಹಾರ ಅವಧಿ (SLA)**: ${bestDoc.standardSLA}
- **ತುರ್ತು ಅಪಾಯದ ಗಡುವು**: ${bestDoc.emergencySLA}
- **ಸಂಬಂಧಪಟ್ಟ ಇಲಾಖೆ**: ${bestDoc.department}

**ನಿಯಮಾವಳಿ ವಿವರಣೆ**: ${bestDoc.summaryKn}

**ಸೂಚಿಸಲಾದ ಕ್ರಮ**: ${bestDoc.actionKn}`;

  return {
    success: true,
    query,
    language: isKn ? 'kn' : 'en',
    answer: isKn ? answerKn : answerEn,
    matchedPolicy: {
      id: bestDoc.id,
      title: isKn ? bestDoc.titleKn : bestDoc.title,
      department: bestDoc.department,
      standardSLA: bestDoc.standardSLA,
      emergencySLA: bestDoc.emergencySLA,
      citation: bestDoc.citation,
    },
    suggestedComplaint: bestDoc.sampleComplaint,
  };
}

module.exports = {
  queryCivicPolicyRAG,
  CIVIC_POLICY_KNOWLEDGE_BASE,
};
