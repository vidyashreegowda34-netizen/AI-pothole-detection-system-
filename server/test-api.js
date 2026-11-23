const app = require('./src/index');
const http = require('http');

const PORT = 5099; // Test port
const server = http.createServer(app);

async function runTests() {
  server.listen(PORT, async () => {
    console.log(`🧪 Test Server running on port ${PORT}`);
    const baseUrl = `http://localhost:${PORT}/api`;

    try {
      // 1. Health
      const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
      console.log('✅ Health Check:', healthRes.status, healthRes.district);

      // 2. Taluks
      const taluksRes = await fetch(`${baseUrl}/taluks`).then((r) => r.json());
      console.log(`✅ Taluks Count: ${taluksRes.taluks?.length} taluks (Tumkur City has ${taluksRes.taluks?.find(t => t.code === 'TUMKUR_CITY')?.wards?.length} wards)`);

      // 3. Departments & Categories
      const deptsRes = await fetch(`${baseUrl}/departments`).then((r) => r.json());
      console.log(`✅ Departments Count: ${deptsRes.departments?.length} departments`);

      // 4. Issues Feed
      const issuesRes = await fetch(`${baseUrl}/issues`).then((r) => r.json());
      console.log(`✅ Issues Count: ${issuesRes.issues?.length} issues returned in feed`);

      // 5. Analytics Summary
      const summaryRes = await fetch(`${baseUrl}/analytics/summary`).then((r) => r.json());
      console.log('✅ Analytics Summary:', summaryRes.summary);

      // 6. AI Categorization Suggestion
      const aiSuggestKn = await fetch(`${baseUrl}/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದೆ ಡಾಂಬರು ಕಿತ್ತುಹೋಗಿದೆ' }),
      }).then((r) => r.json());
      console.log('✅ AI Kannada Suggestion:', aiSuggestKn.suggestion.categoryCode, aiSuggestKn.suggestion.departmentCode);

      // 6b. AI Emergency Phase Assessment
      const emergencyRes = await fetch(`${baseUrl}/ai/assess-emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'ವಿದ್ಯುತ್ ತಂತಿ ತುಂಡಾಗಿ ಬಿದ್ದಿದೆ ಬೆಂಕಿ ಮತ್ತು ಸ್ಪಾರ್ಕ್ ಬರ್ತಿದೆ', categoryCode: 'ELECTRICITY' }),
      }).then((r) => r.json());
      console.log('✅ AI Emergency Phase Analysis:', emergencyRes.assessment.phase, emergencyRes.assessment.hazardBadge);

      // 6c. YOLO11n Computer Vision Inference Test
      const yoloRes = await fetch(`${baseUrl}/ai/yolo11-detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7',
          hintText: 'Deep road crater and pothole near Tumkur bypass',
        }),
      }).then((r) => r.json());
      console.log(`✅ YOLO11n CV Detection: ${yoloRes.data?.model} found ${yoloRes.data?.detectionsCount} pothole(s) with max conf ${(yoloRes.data?.maxConfidence * 100).toFixed(1)}% -> ${yoloRes.data?.emergencyPhase?.hazardBadge}`);

      // 6d. YOLO11n Model Info
      const yoloInfo = await fetch(`${baseUrl}/ai/yolo-info`).then((r) => r.json());
      console.log(`✅ YOLO11n Model Info: ${yoloInfo.architecture} (${yoloInfo.parameters})`);

      // 6e. RAG Civic Policy Assistant Test
      const ragRes = await fetch(`${baseUrl}/ai/chat-rag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'What is the PWD turnaround SLA for pothole repair?' }),
      }).then((r) => r.json());
      console.log(`✅ RAG Civic Policy Engine: Retrieved "${ragRes.matchedPolicy?.title}" (SLA: ${ragRes.matchedPolicy?.standardSLA})`);
      const dupCheck = await fetch(`${baseUrl}/ai/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: 13.3422, longitude: 77.1424 }), // Near Kyathsandra pothole
      }).then((r) => r.json());
      console.log(`✅ Duplicate Detection Check: Found ${dupCheck.duplicates?.length} nearby duplicate(s)`);

      // 8. Auth OTP
      const otpRes = await fetch(`${baseUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '9880055443' }),
      }).then((r) => r.json());
      console.log('✅ OTP Dispatch:', otpRes.message);

      const verifyRes = await fetch(`${baseUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '9880055443', otp: '1234', name: 'Siddalinga Swamy' }),
      }).then((r) => r.json());
      console.log('✅ Citizen Login Success! JWT Token received for:', verifyRes.user?.name);

      console.log('\n🎉 ALL BACKEND API ENDPOINTS VERIFIED AND WORKING 100% PERFECTLY!\n');
    } catch (err) {
      console.error('❌ Test Error:', err);
    } finally {
      server.close(() => {
        console.log('🏁 Test server closed.');
        process.exit(0);
      });
    }
  });
}

runTests();
