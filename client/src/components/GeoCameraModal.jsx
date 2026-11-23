import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { stampGeoTagOnImage } from '../utils/geoTag';
import {
  Camera,
  RotateCcw,
  Check,
  X,
  Navigation,
  RefreshCw,
  AlertCircle,
  SwitchCamera,
  Image as ImageIcon,
} from 'lucide-react';

export default function GeoCameraModal({
  isOpen,
  onClose,
  onCapture,
  defaultLocationName = 'Tumkur, Karnataka',
}) {
  const { t, i18n } = useTranslation();
  const isKannada = i18n.language === 'kn';

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // GPS state
  const [coords, setCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [gpsError, setGpsError] = useState(null);

  // Capture preview state
  const [capturedData, setCapturedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentGps();
      startCamera();
    } else {
      stopCamera();
      setCapturedData(null);
      setCameraError(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  // 1. Fetch High Accuracy GPS
  const fetchCurrentGps = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      setCoords({ latitude: 13.3409, longitude: 77.1010, accuracy: 10 });
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 5,
        });
        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS error in camera modal:', err.message);
        // Fallback to Tumkur City
        setCoords({ latitude: 13.3409, longitude: 77.1010, accuracy: 15 });
        setGpsError('Could not get precise GPS. Using Tumkur district coordinates.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // 2. Start Live Video Stream
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC Camera is not supported in this environment');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('getUserMedia error:', err);
      setCameraActive(false);
      setCameraError(
        'Unable to access live camera stream. You can still use the device camera or upload a photo below.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Toggle front/back camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // 3. Shutter Click: Snap photo from live video feed
  const takeLiveSnapshot = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');

      // Draw current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);

      // Burn Geo-Tag Watermark
      const geoResult = await stampGeoTagOnImage(rawDataUrl, {
        latitude: coords?.latitude || 13.3409,
        longitude: coords?.longitude || 77.1010,
        accuracy: coords?.accuracy || 5,
        locationName: defaultLocationName,
        timestamp: new Date(),
      });

      setCapturedData(geoResult);
    } catch (err) {
      console.error('Snapshot failed:', err);
      alert('Failed to process image with geo-tag: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. File Input fallback (Native Device Camera)
  const handleNativeCameraCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const geoResult = await stampGeoTagOnImage(file, {
        latitude: coords?.latitude || 13.3409,
        longitude: coords?.longitude || 77.1010,
        accuracy: coords?.accuracy || 5,
        locationName: defaultLocationName,
        timestamp: new Date(),
      });

      setCapturedData(geoResult);
    } catch (err) {
      console.error('Native capture failed:', err);
      alert('Failed to geo-tag image: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Confirm and use the geo-tagged photo
  const handleConfirmPhoto = () => {
    if (!capturedData) return;
    onCapture({
      file: capturedData.file,
      dataUrl: capturedData.dataUrl,
      latitude: capturedData.latitude,
      longitude: capturedData.longitude,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between text-white p-4 overflow-hidden">
      {/* Top Bar: Title, GPS Status & Close Button */}
      <div className="flex items-center justify-between z-10">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
              {isKannada ? 'ಜಿಯೋ-ಟ್ಯಾಗ್ ಕ್ಯಾಮೆರಾ' : 'Geo-Tagged Civic Camera'}
            </h2>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-slate-300 font-mono">
            <Navigation className={`w-3 h-3 text-emerald-400 ${gpsLoading ? 'animate-spin' : ''}`} />
            {coords ? (
              <span>
                {coords.latitude.toFixed(5)}°N, {coords.longitude.toFixed(5)}°E (±{Math.round(coords.accuracy)}m)
              </span>
            ) : (
              <span>Fetching GPS position...</span>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Viewfinder / Preview Area */}
      <div className="relative flex-1 my-3 flex items-center justify-center rounded-3xl overflow-hidden bg-slate-950 border border-slate-800">
        {capturedData ? (
          /* Preview of captured & watermarked photo */
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <img
              src={capturedData.dataUrl}
              alt="Geo-Tagged Civic Preview"
              className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-amber-500/30"
            />
            <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-md">
              <Check className="w-3.5 h-3.5" />
              <span>{isKannada ? 'ಜಿಯೋ-ಟ್ಯಾಗ್ ಯಶಸ್ವಿ' : 'Geo-Tag Embedded'}</span>
            </div>
          </div>
        ) : cameraActive ? (
          /* Live Camera Stream Viewfinder */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />

            {/* Viewfinder Target Reticle / Grid Overlay */}
            <div className="absolute inset-8 border border-white/20 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-amber-400/80 rounded-full"></div>
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400"></div>
            </div>

            {/* Live GPS overlay pill on viewfinder */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs flex items-center justify-between">
              <span className="text-amber-300 font-bold truncate">
                📍 {defaultLocationName}
              </span>
              <span className="font-mono text-[11px] text-white/90 shrink-0">
                {coords ? `${coords.latitude.toFixed(4)}°, ${coords.longitude.toFixed(4)}°` : 'Locating...'}
              </span>
            </div>
          </div>
        ) : (
          /* Camera Error / Fallback Card */
          <div className="text-center p-6 max-w-sm space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <p className="text-xs text-slate-300 leading-relaxed">
              {cameraError || 'Camera stream is unavailable. Please click below to open your device camera.'}
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-lg flex items-center justify-center space-x-2 mx-auto"
            >
              <Camera className="w-4 h-4" />
              <span>{isKannada ? 'ಡಿವೈಸ್ ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ' : 'Open Device Camera'}</span>
            </button>
          </div>
        )}

        {/* Hidden Native Camera Input with capture="environment" */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNativeCameraCapture}
          className="hidden"
        />

        {/* Processing Spinner */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center space-y-3 z-30">
            <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
            <p className="text-xs font-bold text-amber-200">
              {isKannada ? 'ಜಿಯೋ-ಟ್ಯಾಗ್ ಮುದ್ರಿಸಲಾಗುತ್ತಿದೆ...' : 'Burning Geo-Tag Watermark...'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="py-2 z-10">
        {capturedData ? (
          /* Confirm or Retake Controls */
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setCapturedData(null)}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isKannada ? 'ಮತ್ತೆ ತೆಗೆಯಿರಿ' : 'Retake Photo'}</span>
            </button>

            <button
              onClick={handleConfirmPhoto}
              className="flex items-center space-x-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{isKannada ? 'ಈ ಫೋಟೋ ಬಳಸಿ' : 'Use Geo-Tagged Photo'}</span>
            </button>
          </div>
        ) : (
          /* Camera Shutter & Tools Controls */
          <div className="flex items-center justify-around max-w-sm mx-auto">
            {/* Native device file trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              title="Upload / Native Camera"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Central Big Shutter Button */}
            <button
              type="button"
              onClick={cameraActive ? takeLiveSnapshot : () => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform shadow-xl shadow-amber-500/20"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400"></div>
            </button>

            {/* Flip Camera Button */}
            <button
              type="button"
              onClick={toggleFacingMode}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              title="Flip Camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
