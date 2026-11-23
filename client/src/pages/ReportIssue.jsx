import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import api from '../api/client';
import VoiceInput from '../components/VoiceInput';
import IssueMap from '../components/IssueMap';
import GeoCameraModal from '../components/GeoCameraModal';
import YoloVisionOverlay from '../components/YoloVisionOverlay';
import { stampGeoTagOnImage } from '../utils/geoTag';
import {
  MapPin,
  Camera,
  Upload,
  X,
  Sparkles,
  AlertCircle,
  ThumbsUp,
  CheckCircle2,
  Navigation,
  Flame,
  Info,
  ShieldCheck,
  Zap,
  Cpu,
} from 'lucide-react';

export default function ReportIssue() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { isOnline, addToQueue } = useOffline();
  const navigate = useNavigate();
  const location = useLocation();
  const isKannada = i18n.language === 'kn';

  // Form States
  const [title, setTitle] = useState(location.state?.prefillTitle || '');
  const [description, setDescription] = useState('');
  const [talukId, setTalukId] = useState('');
  const [wardId, setWardId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [urgency, setUrgency] = useState(location.state?.prefillUrgency || 'MEDIUM');
  const [addressText, setAddressText] = useState('');

  // Location Coordinates (Default: Tumkur City Center)
  const [coords, setCoords] = useState([13.3409, 77.1010]);
  const [locationDetecting, setLocationDetecting] = useState(false);

  // Photos
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [isGeoCameraOpen, setIsGeoCameraOpen] = useState(false);

  // Data catalogs
  const [taluks, setTaluks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTalukWards, setSelectedTalukWards] = useState([]);

  // AI & Duplicates
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [nearbyDuplicate, setNearbyDuplicate] = useState(null);
  const [isYoloScanning, setIsYoloScanning] = useState(false);
  const [yoloResults, setYoloResults] = useState(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadCatalogs();
    detectUserGpsLocation();
  }, []);

  const loadCatalogs = async () => {
    try {
      const [tRes, dRes] = await Promise.all([
        api.get('/taluks'),
        api.get('/departments'),
      ]);

      if (tRes.data.success) {
        setTaluks(tRes.data.taluks);
        // Default to Tumkur City
        const tumkur = tRes.data.taluks.find((t) => t.code === 'TUMKUR_CITY') || tRes.data.taluks[0];
        if (tumkur) {
          setTalukId(tumkur.id);
          setSelectedTalukWards(tumkur.wards || []);
        }
      }

      if (dRes.data.success) {
        const allCats = dRes.data.departments.flatMap((d) => d.categories || []);
        setCategories(allCats);
        if (allCats.length > 0) setCategoryId(allCats[0].id);
      }
    } catch (err) {
      console.error('Failed to load catalogs:', err);
    }
  };

  // Update wards when taluk changes
  const handleTalukChange = (id) => {
    setTalukId(id);
    setWardId('');
    const found = taluks.find((t) => t.id === id);
    if (found) {
      setSelectedTalukWards(found.wards || []);
      setCoords([found.latitude, found.longitude]);
    } else {
      setSelectedTalukWards([]);
    }
  };

  // GPS Geolocation
  const detectUserGpsLocation = () => {
    if (!navigator.geolocation) return;
    setLocationDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords([latitude, longitude]);
        setLocationDetecting(false);
        checkDuplicatesAtLocation(latitude, longitude, categoryId);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocationDetecting(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Handle photo captured from GeoCameraModal
  const handleGeoCameraCapture = ({ file, dataUrl, latitude, longitude }) => {
    if (selectedPhotos.length >= 3) {
      setErrorMsg(isKannada ? 'ಗರಿಷ್ಠ 3 ಫೋಟೋಗಳನ್ನು ಮಾತ್ರ ಸೇರಿಸಬಹುದು.' : 'You can upload a maximum of 3 photos.');
      return;
    }

    setSelectedPhotos((prev) => [...prev, file]);
    setPhotoPreviews((prev) => [...prev, dataUrl]);

    // Check if title/description indicates emergency to auto-escalate
    const textToCheck = `${title} ${description}`.toLowerCase();
    if (
      textToCheck.includes('wire') ||
      textToCheck.includes('spark') ||
      textToCheck.includes('shock') ||
      textToCheck.includes('danger') ||
      textToCheck.includes('ವಿದ್ಯುತ್') ||
      textToCheck.includes('ತಂತಿ') ||
      textToCheck.includes('ಅಪಾಯ')
    ) {
      setUrgency('EMERGENCY');
    }

    // Update GPS coordinates from camera's precise location
    if (latitude && longitude) {
      setCoords([latitude, longitude]);
      checkDuplicatesAtLocation(latitude, longitude, categoryId);
    }
  };

  // Photo handlers: for gallery uploads, automatically apply geo-tag watermark too
  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (selectedPhotos.length + files.length > 3) {
      setErrorMsg('You can upload a maximum of 3 photos.');
      return;
    }

    const talukObj = taluks.find((t) => t.id === talukId);
    const locationName = talukObj ? (isKannada ? talukObj.nameKn : talukObj.nameEn) : 'Tumkur, Karnataka';

    for (const file of files) {
      try {
        const geoResult = await stampGeoTagOnImage(file, {
          latitude: coords[0],
          longitude: coords[1],
          locationName: `${locationName}, Tumkur`,
          timestamp: new Date(),
          urgency: urgency,
        });
        setSelectedPhotos((prev) => [...prev, geoResult.file].slice(0, 3));
        setPhotoPreviews((prev) => [...prev, geoResult.dataUrl].slice(0, 3));
      } catch (err) {
        // Fallback to raw file if stamping fails
        setSelectedPhotos((prev) => [...prev, file].slice(0, 3));
        setPhotoPreviews((prev) => [...prev, URL.createObjectURL(file)].slice(0, 3));
      }
    }
  };

  const removePhoto = (index) => {
    const updatedPhotos = selectedPhotos.filter((_, i) => i !== index);
    setSelectedPhotos(updatedPhotos);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotoPreviews(updatedPreviews);
  };

  // AI Assist: Suggest Category
  const handleAiSuggest = async () => {
    if (!title && !description) {
      setErrorMsg(isKannada ? 'ದಯವಿಟ್ಟು ಮುಖ್ಯಾಂಶ ಅಥವಾ ವಿವರಣೆಯನ್ನು ಬರೆಯಿರಿ.' : 'Please provide a title or description first.');
      return;
    }

    setIsAiAnalyzing(true);
    setErrorMsg('');

    try {
      const res = await api.post('/ai/suggest', { title, text: description });
      if (res.data.success && res.data.suggestion) {
        const { category, urgency: suggestedUrgency, confidence } = res.data.suggestion;
        setAiSuggestion(res.data.suggestion);
        if (category) {
          setCategoryId(category.id);
        }
        if (suggestedUrgency) {
          setUrgency(suggestedUrgency);
        }
      }
    } catch (err) {
      console.error('AI suggest error:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Run YOLO11n Computer Vision Inference on Photos
  const runYoloScan = async () => {
    if (selectedPhotos.length === 0 && photoPreviews.length === 0) {
      setErrorMsg(isKannada ? 'ದಯವಿಟ್ಟು ಮೊದಲು ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.' : 'Please take or upload a photo first.');
      return;
    }

    setIsYoloScanning(true);
    setErrorMsg('');

    try {
      let res;
      if (selectedPhotos.length > 0) {
        const formData = new FormData();
        formData.append('photo', selectedPhotos[0]);
        formData.append('title', title);
        formData.append('hintText', description);
        res = await api.post('/ai/yolo11-detect', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/ai/yolo11-detect', {
          imageUrl: photoPreviews[0],
          title,
          hintText: description,
        });
      }

      if (res.data.success && res.data.data) {
        const data = res.data.data;
        setYoloResults(data);

        // Auto-select Pothole category and escalate emergency phase
        if (data.detectionsCount > 0) {
          const potholeCat = categories.find((c) => c.code === 'POTHOLE');
          if (potholeCat) {
            setCategoryId(potholeCat.id);
          }
          if (data.emergencyPhase?.phase) {
            setUrgency(data.emergencyPhase.phase);
          }
          if (!title.trim()) {
            setTitle(
              isKannada
                ? 'ರಸ್ತೆಯಲ್ಲಿ ಅಪಾಯಕಾರಿ ಗುಂಡಿ ಬಿದ್ದಿದೆ (ಯೋಲೋ11n ಪರಿಶೀಲಿತ)'
                : 'Severe dangerous pothole on road (YOLO11n verified)'
            );
          }
        }
      }
    } catch (err) {
      console.error('YOLO11n scan error:', err);
      setErrorMsg(isKannada ? 'ಯೋಲೋ11n ಸ್ಕ್ಯಾನ್ ವಿಫಲವಾಗಿದೆ.' : 'YOLO11n scan failed to process image.');
    } finally {
      setIsYoloScanning(false);
    }
  };

  // Proximity duplicate check
  const checkDuplicatesAtLocation = async (lat, lon, catId) => {
    try {
      const res = await api.post('/ai/check-duplicate', {
        latitude: lat,
        longitude: lon,
        categoryId: catId,
        text: `${title} ${description}`,
      });
      if (res.data.success && res.data.hasDuplicate) {
        setNearbyDuplicate(res.data.duplicates[0]);
      } else {
        setNearbyDuplicate(null);
      }
    } catch (err) {
      // Ignore background check error
    }
  };

  // Map pin drag handler
  const handlePositionChange = (lat, lon) => {
    setCoords([lat, lon]);
    checkDuplicatesAtLocation(lat, lon, categoryId);
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !description.trim()) {
      setErrorMsg(isKannada ? 'ದಯವಿಟ್ಟು ಮುಖ್ಯಾಂಶ ಮತ್ತು ವಿವರಣೆಯನ್ನು ನಮೂದಿಸಿ.' : 'Please provide a title and description.');
      return;
    }

    if (!talukId || !categoryId) {
      setErrorMsg(isKannada ? 'ದಯವಿಟ್ಟು ತಾಲೂಕು ಮತ್ತು ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.' : 'Please select taluk and category.');
      return;
    }

    if (!isAuthenticated && isOnline) {
      // Redirect to login with alert
      navigate('/login?redirect=/report');
      return;
    }

    setSubmitting(true);

    const reportData = {
      title,
      description,
      talukId,
      wardId: wardId || null,
      categoryId,
      urgency,
      latitude: coords[0],
      longitude: coords[1],
      addressText,
    };

    // If offline, queue report locally
    if (!isOnline) {
      addToQueue({
        ...reportData,
        photoUrls: photoPreviews, // Local blob URLs
      });
      setSubmitting(false);
      navigate('/my-reports');
      return;
    }

    // If online, send multipart to backend
    try {
      const formData = new FormData();
      Object.keys(reportData).forEach((key) => {
        if (reportData[key] !== null && reportData[key] !== undefined) {
          formData.append(key, reportData[key]);
        }
      });

      selectedPhotos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const res = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        navigate(`/issue/${res.data.issue.id}`);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      // Fallback: If network suddenly dropped, save to offline queue
      if (!navigator.onLine || err.message?.includes('Network Error')) {
        addToQueue({ ...reportData, photoUrls: photoPreviews });
        navigate('/my-reports');
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to submit report. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <span>{t('report.title')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('report.subtitle')}
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Proximity Duplicate Warning Alert */}
      {nearbyDuplicate && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl shadow-sm space-y-2 animate-fade-in">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{t('report.duplicateAlertTitle')}</span>
          </div>

          <p className="text-xs text-amber-800">
            <strong>{nearbyDuplicate.distanceMeters}m</strong> {t('report.duplicateAlertDesc')}
          </p>

          <div className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-xs">{nearbyDuplicate.title}</p>
              <p className="text-[11px] text-slate-500 font-mono">
                {nearbyDuplicate.trackingNumber} • {t(`status.${nearbyDuplicate.status}`)} • {nearbyDuplicate.upvotesCount} {t('detail.upvotes')}
              </p>
            </div>
            <Link
              to={`/issue/${nearbyDuplicate.id}`}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 ml-3"
            >
              {t('report.viewExisting')}
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Issue Title */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t('report.issueTitle')} *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('report.issueTitlePlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* 2. Description & Voice Input */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t('report.description')} *
            </label>
            <VoiceInput
              onTranscriptChange={(text) => setDescription(text)}
              currentText={description}
            />
          </div>

          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('report.descriptionPlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />

          {/* AI Categorization Button */}
          <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={isAiAnalyzing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiAnalyzing ? t('report.aiAnalyzing') : t('report.aiSuggest')}</span>
            </button>

            {aiSuggestion && (
              <span className="text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full font-semibold border border-purple-200 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  {t('report.aiSuggested')}:{' '}
                  <strong>
                    {isKannada ? aiSuggestion.category?.nameKn : aiSuggestion.category?.nameEn}
                  </strong>
                </span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Geo-Tagged Photos (Up to 3) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t('report.photos')} *
              </label>
              <p className="text-[11px] text-slate-500">
                {isKannada
                  ? 'ಫೋಟೋ ಮೇಲೆ ಜಿಪಿಎಸ್ ಸ್ಥಳ ಮತ್ತು ದಿನಾಂಕದ ಮುದ್ರೆ (Geo-Tag) ಬೀಳುತ್ತದೆ'
                  : 'Photos are automatically geo-tagged with GPS coordinates and date/time'}
              </p>
            </div>

            {selectedPhotos.length < 3 && (
              <button
                type="button"
                onClick={() => setIsGeoCameraOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>{isKannada ? 'ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ (Geo-Tag)' : 'Open Camera (Geo-Tag)'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photoPreviews.map((url, i) => (
              <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-amber-500/50 bg-slate-900 group shadow-sm">
                <YoloVisionOverlay
                  imageUrl={url}
                  alt={`Geo-Tagged preview ${i + 1}`}
                  detections={i === 0 && yoloResults?.detections ? yoloResults.detections : []}
                  isScanning={i === 0 && isYoloScanning}
                  className="w-full h-full"
                />
                
                {/* Geo-Tag badge on image */}
                <div className="absolute top-2 left-2 z-20 bg-black/75 backdrop-blur-xs text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 border border-amber-400/40 pointer-events-none">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Geo-Tagged</span>
                </div>

                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-2 right-2 z-30 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors pointer-events-auto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {selectedPhotos.length < 3 && (
              <button
                type="button"
                onClick={() => setIsGeoCameraOpen(true)}
                className="aspect-video rounded-2xl border-2 border-dashed border-amber-400 hover:border-amber-600 bg-amber-50/40 hover:bg-amber-100/50 flex flex-col items-center justify-center cursor-pointer transition-all p-2 text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-sm">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-amber-900">
                  {isKannada ? 'ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ' : 'Take Geo Photo'}
                </span>
                <span className="text-[10px] text-amber-700 font-medium">
                  ({selectedPhotos.length}/3)
                </span>
              </button>
            )}
          </div>

          {/* YOLO11n Neural Vision AI Scan Button & Detection Panel */}
          {photoPreviews.length > 0 && (
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={runYoloScan}
                disabled={isYoloScanning}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 text-yellow-200 ${isYoloScanning ? 'animate-bounce' : ''}`} />
                <span>
                  {isYoloScanning
                    ? (isKannada ? 'ಯೋಲೋ11n ನ್ಯೂರಲ್ ಸ್ಕ್ಯಾನ್ ಆಗುತ್ತಿದೆ...' : 'YOLO11n Neural Vision Scanning...')
                    : (isKannada ? '⚡ ಯೋಲೋ11n ರಸ್ತೆ ಗುಂಡಿ AI ಸ್ಕ್ಯಾನರ್ ಚಲಾಯಿಸಿ' : '⚡ Run YOLO11n Pothole AI Scanner')}
                </span>
                <span className="bg-black/30 text-amber-200 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase">
                  Nano 640px
                </span>
              </button>

              {yoloResults && yoloResults.detectionsCount > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 p-3 rounded-2xl flex items-center justify-between text-xs animate-fade-in shadow-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      ⚡
                    </div>
                    <div>
                      <span className="font-extrabold text-amber-950 block text-xs">
                        {isKannada
                          ? `ಯೋಲೋ11n ಪತ್ತೆ: ${yoloResults.detectionsCount} ರಸ್ತೆ ಗುಂಡಿ ಪತ್ತೆಯಾಗಿದೆ (${(yoloResults.maxConfidence * 100).toFixed(1)}% ನಿಖರತೆ)`
                          : `YOLO11n Verified: ${yoloResults.detectionsCount} Pothole Hazard(s) Detected (${(yoloResults.maxConfidence * 100).toFixed(1)}% Conf)`}
                      </span>
                      <span className="text-[11px] text-amber-800">
                        {isKannada
                          ? 'ವರ್ಗವನ್ನು ಸ್ವಯಂ "ರಸ್ತೆ ಗುಂಡಿ (PWD)" ಗೆ ಹೊಂದಿಸಲಾಗಿದೆ ಮತ್ತು ತುರ್ತು ಹಂತ 4 ಸಕ್ರಿಯಗೊಂಡಿದೆ.'
                          : 'Auto-assigned to PWD Pothole category & Emergency Phase 4 SLA activated.'}
                      </span>
                    </div>
                  </div>
                  <span className="bg-amber-600 text-white font-mono text-[10px] font-bold px-2 py-1 rounded-full shrink-0 shadow-xs">
                    yolo11n.pt
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Visual Emergency Phase Assessment directly from Picture & Issue */}
          {urgency === 'EMERGENCY' ? (
            <div className="bg-red-50 border-2 border-red-300 p-3.5 rounded-2xl flex items-center justify-between text-xs animate-pulse">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  🚨
                </div>
                <div>
                  <span className="font-black text-red-900 block text-xs sm:text-sm">
                    {isKannada ? 'ಹಂತ 4: ತಕ್ಷಣದ ತುರ್ತು ಸಾರ್ವಜನಿಕ ಅಪಾಯ' : 'PHASE 4: IMMEDIATE EMERGENCY HAZARD'}
                  </span>
                  <span className="text-[11px] text-red-700">
                    {isKannada ? 'ಫೋಟೋದಲ್ಲಿ ತೀವ್ರ ಅಪಾಯ ಪತ್ತೆಯಾಗಿದೆ • 12 ಗಂಟೆಗಳ ತುರ್ತು ಪರಿಹಾರ ನಿಯೋಜನೆ (12h SLA)' : 'Severe public safety risk detected in photo • 12-Hour Urgent Field Dispatch SLA'}
                  </span>
                </div>
              </div>
              <span className="bg-red-600 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0">
                12h SLA
              </span>
            </div>
          ) : urgency === 'HIGH' ? (
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-base">⚠️</span>
                <div>
                  <span className="font-bold text-orange-950 block text-xs">
                    {isKannada ? 'ಹಂತ 3: ಹೆಚ್ಚಿನ ಆದ್ಯತೆಯ ಸಮಸ್ಯೆ (High Priority)' : 'PHASE 3: HIGH PRIORITY HAZARD'}
                  </span>
                  <span className="text-[11px] text-orange-700">
                    {isKannada ? '24 ಗಂಟೆಗಳ ಪರಿಹಾರ ಗಡುವು (24h Target Turnaround)' : '24-Hour Municipal Target Turnaround'}
                  </span>
                </div>
              </div>
              <span className="bg-orange-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                24h SLA
              </span>
            </div>
          ) : urgency === 'MEDIUM' ? (
            <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-2xl flex items-center justify-between text-[11px] text-amber-900">
              <span className="font-bold">⚡ {isKannada ? 'ಹಂತ 2: ಮಧ್ಯಮ ಆದ್ಯತೆ (48h SLA)' : 'PHASE 2: STANDARD CIVIC (48h SLA)'}</span>
              <span className="text-[10px] text-amber-700 font-semibold">48h SLA</span>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl flex items-center justify-between text-[11px] text-slate-700">
              <span className="font-bold">ℹ️ {isKannada ? 'ಹಂತ 1: ಸಾಮಾನ್ಯ ನಿಯಮಿತ ನಿರ್ವಹಣೆ' : 'PHASE 1: ROUTINE MAINTENANCE (72h SLA)'}</span>
              <span className="text-[10px] text-slate-500 font-semibold">72h SLA</span>
            </div>
          )}

          {/* Alternative File Upload for Gallery */}
          {selectedPhotos.length < 3 && (
            <div className="pt-1 flex items-center justify-end">
              <label className="text-[11px] font-semibold text-slate-500 hover:text-amber-700 flex items-center space-x-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{isKannada ? 'ಗ್ಯಾಲರಿಯಿಂದ ಅಪ್‌ಲೋಡ್ (ಸ್ವಯಂ ಜಿಯೋ-ಟ್ಯಾಗ್)' : 'Upload from gallery (Auto Geo-Tagged)'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* 4. Location Pin on Leaflet OpenStreetMap */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t('report.location')} *
            </label>
            <button
              type="button"
              onClick={detectUserGpsLocation}
              disabled={locationDetecting}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <Navigation className={`w-3.5 h-3.5 text-blue-600 ${locationDetecting ? 'animate-spin' : ''}`} />
              <span>{t('report.detectLocation')}</span>
            </button>
          </div>

          <IssueMap
            center={coords}
            pinnedPosition={coords}
            isDraggable={true}
            onPositionChange={handlePositionChange}
            height="260px"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono">
              GPS: {coords[0].toFixed(5)}° N, {coords[1].toFixed(5)}° E
            </span>
            <span>{t('report.dragPinHelp')}</span>
          </div>

          {/* Optional Landmark / Address Text */}
          <input
            type="text"
            value={addressText}
            onChange={(e) => setAddressText(e.target.value)}
            placeholder={isKannada ? "ನಿರ್ದಿಷ್ಟ ಸ್ಥಳ / ಹತ್ತಿರದ ಪ್ರಸಿದ್ಧ ಕಟ್ಟಡ (ಐಚ್ಛಿಕ)" : "Landmark or street address (Optional)"}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* 5. Taluk, Ward & Category Pickers */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Taluk */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                {t('report.taluk')} *
              </label>
              <select
                required
                value={talukId}
                onChange={(e) => handleTalukChange(e.target.value)}
                className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
              >
                <option value="">{t('report.selectTaluk')}</option>
                {taluks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {isKannada ? t.nameKn : t.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward (If Tumkur City) */}
            {selectedTalukWards.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  {t('report.ward')}
                </label>
                <select
                  value={wardId}
                  onChange={(e) => setWardId(e.target.value)}
                  className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                >
                  <option value="">{t('report.selectWard')}</option>
                  {selectedTalukWards.map((w) => (
                    <option key={w.id} value={w.id}>
                      Ward {w.wardNumber}: {isKannada ? w.nameKn : w.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                {t('report.category')} *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  checkDuplicatesAtLocation(coords[0], coords[1], e.target.value);
                }}
                className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
              >
                <option value="">{t('report.selectCategory')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isKannada ? c.nameKn : c.nameEn} ({c.slaHours}h SLA)
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                {t('report.urgencyLevel')}
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
              >
                <option value="LOW">{t('urgency.LOW')}</option>
                <option value="MEDIUM">{t('urgency.MEDIUM')}</option>
                <option value="HIGH">{t('urgency.HIGH')}</option>
                <option value="EMERGENCY">{t('urgency.EMERGENCY')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-base shadow-lg shadow-amber-600/20 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <span>{submitting ? t('report.submitting') : t('report.submit')}</span>
        </button>
      </form>

      {/* Live Geo-Tagged Camera Modal */}
      <GeoCameraModal
        isOpen={isGeoCameraOpen}
        onClose={() => setIsGeoCameraOpen(false)}
        onCapture={handleGeoCameraCapture}
        defaultLocationName={
          addressText ||
          (taluks.find((t) => t.id === talukId)
            ? `${isKannada ? taluks.find((t) => t.id === talukId).nameKn : taluks.find((t) => t.id === talukId).nameEn}, Tumkur`
            : 'Tumkur District, Karnataka')
        }
      />
    </div>
  );
}
