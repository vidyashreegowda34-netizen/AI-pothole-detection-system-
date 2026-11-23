import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  Video,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Radio,
  Eye,
  CheckCircle2,
  Clock,
  Car,
  Layers,
  ArrowRight,
  RefreshCw,
  Cpu,
} from 'lucide-react';

export default function CctvMonitoring() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKannada = i18n.language === 'kn';

  const [cameras, setCameras] = useState([]);
  const [selectedCam, setSelectedCam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(null);

  useEffect(() => {
    fetchCctvFeeds();
  }, []);

  const fetchCctvFeeds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/smartcity/cctv');
      if (res.data.success) {
        setCameras(res.data.cameras);
        if (res.data.cameras.length > 0) {
          setSelectedCam(res.data.cameras[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch CCTV feeds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDispatch = async (hazard) => {
    if (!selectedCam) return;
    setDispatching(true);
    setDispatchSuccess(null);

    try {
      const res = await api.post('/smartcity/cctv/auto-report', {
        cameraName: isKannada ? selectedCam.nameKn : selectedCam.nameEn,
        hazardClass: hazard.class,
        severity: hazard.severity,
        depthEstimate: hazard.depthEstimate,
        latitude: selectedCam.latitude,
        longitude: selectedCam.longitude,
      });

      if (res.data.success) {
        setDispatchSuccess(res.data.issue);
      }
    } catch (err) {
      console.error('Auto dispatch error:', err);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 rounded-3xl border border-amber-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 mb-1">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span>{isKannada ? 'ಲೈವ್ ಸಿಸಿಟಿವಿ ರಸ್ತೆ ನಿಗಾ ಜಾಲ' : 'LIVE HIGHWAY & INTERSECTION CCTV GRID'}</span>
            <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.2 rounded font-black">
              LIVE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {isKannada ? 'ಸ್ಮಾರ್ಟ್ ಸಿಟಿ ಲೈವ್ ಸಿಸಿಟಿವಿ ಕ್ಯಾಮೆರಾ ವಿಶ್ಲೇಷಣೆ' : 'Live CCTV Automated Road Hazard Surveillance'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            {isKannada
              ? 'ತುಮಕೂರು ಜಿಲ್ಲೆಯ ಪ್ರಮುಖ ಹೆದ್ದಾರಿ ಮತ್ತು ವೃತ್ತಗಳ ಸಿಸಿಟಿವಿ ದೃಶ್ಯಾವಳಿಗಳಿಂದ ಯೋಲೋ11n ಮೂಲಕ ರಸ್ತೆ ಗುಂಡಿಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಹಚ್ಚುವ ವ್ಯವಸ್ಥೆ.'
              : 'Real-time CCTV stream analysis powered by YOLO11n neural vision for automated pothole segmentation and urgent field crew dispatching.'}
          </p>
        </div>

        <button
          onClick={fetchCctvFeeds}
          className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isKannada ? 'ನವೀಕರಿಸಿ' : 'Refresh Feeds'}</span>
        </button>
      </div>

      {/* Main Grid: Active Player + Stream Feed List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Video Viewfinder & Detection HUD */}
        <div className="lg:col-span-2 space-y-4">
          {selectedCam ? (
            <div className="bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl relative">
              {/* Top Stream Status HUD */}
              <div className="bg-black/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-white/10 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-mono font-bold text-white text-xs">
                    {selectedCam.id} • {isKannada ? selectedCam.nameKn : selectedCam.nameEn}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                  <span>{selectedCam.resolution}</span>
                  <span>{selectedCam.fps} FPS</span>
                  <span className="text-amber-400 flex items-center space-x-1">
                    <Car className="w-3.5 h-3.5" />
                    <span>{selectedCam.vehicleCountMinute} veh/min</span>
                  </span>
                </div>
              </div>

              {/* Video Player Area with Neon Bounding Boxes */}
              <div className="relative aspect-video bg-black overflow-hidden group">
                <img
                  src={selectedCam.feedUrl}
                  alt={selectedCam.nameEn}
                  className="w-full h-full object-cover brightness-95 contrast-105"
                />

                {/* Laser scan lines effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_51%)] bg-[length:100%_4px] opacity-40" />

                {/* YOLO11n Automated Detections on CCTV Frame */}
                {selectedCam.activeDetections && selectedCam.activeDetections.map((det, idx) => (
                  <div
                    key={det.id || idx}
                    style={{
                      left: `${det.normalizedBox.x}%`,
                      top: `${det.normalizedBox.y}%`,
                      width: `${det.normalizedBox.width}%`,
                      height: `${det.normalizedBox.height}%`,
                    }}
                    className="absolute border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)] rounded-lg pointer-events-none animate-pulse"
                  >
                    {/* Corner Crosshairs */}
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />

                    {/* Tag badge */}
                    <div className="absolute -top-6 left-0 bg-red-600 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded shadow flex items-center space-x-1">
                      <Zap className="w-2.5 h-2.5 fill-white" />
                      <span>
                        CCTV AI: {det.class} {(det.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}

                {/* Bottom Left Watermark */}
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-xs text-amber-300 text-[10px] font-mono px-2 py-1 rounded border border-amber-400/30 flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>YOLO11n Edge Vision • Tumkur Smart Corridor</span>
                </div>

                {/* Bottom Right Coordinates */}
                <div className="absolute bottom-3 right-3 bg-black/80 text-white font-mono text-[10px] px-2 py-1 rounded">
                  {selectedCam.latitude.toFixed(4)}°N, {selectedCam.longitude.toFixed(4)}°E
                </div>
              </div>

              {/* Bottom Control Bar */}
              <div className="bg-slate-900 p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-300 block">
                    {isKannada ? 'ಸ್ಥಳ ವಿವರ:' : 'Corridor Location:'}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {selectedCam.taluk} • GPS: {selectedCam.latitude}, {selectedCam.longitude}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Active Telemetry</span>
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Alert Success Banner */}
          {dispatchSuccess && (
            <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl flex items-center justify-between text-xs animate-fade-in shadow-md">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-emerald-950 text-sm">
                    {isKannada ? 'ಸ್ವಯಂಚಾಲಿತ ದೂರು ದಾಖಲಾಗಿದೆ!' : 'Automated Municipal Ticket Dispatched!'}
                  </p>
                  <p className="text-emerald-800 text-[11px]">
                    Ticket: <strong>{dispatchSuccess.trackingNumber}</strong> • Assigned to PWD Road Maintenance Division (12h SLA).
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/issue/${dispatchSuccess.id}`)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shrink-0"
              >
                {isKannada ? 'ವೀಕ್ಷಿಸಿ' : 'View Ticket'}
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Active Detections & Camera Switcher */}
        <div className="space-y-4">
          {/* Active Detected Hazards in Current Stream */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{isKannada ? 'ಸಿಸಿಟಿವಿಯಲ್ಲಿ ಪತ್ತೆಯಾದ ಅಪಾಯಗಳು' : 'Active Detected Hazards'}</span>
            </h3>

            {selectedCam && selectedCam.activeDetections?.length > 0 ? (
              <div className="space-y-2.5">
                {selectedCam.activeDetections.map((hazard, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl border-2 border-red-300 bg-red-50/70 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-red-950 text-xs flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        <span>{hazard.class.toUpperCase()}</span>
                      </span>
                      <span className="bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        {(hazard.confidence * 100).toFixed(1)}% Conf
                      </span>
                    </div>

                    <p className="text-[11px] text-red-900 font-medium">
                      <strong>{isKannada ? 'ಅಂದಾಜು ಆಳ:' : 'Depth:'}</strong> {hazard.depthEstimate}
                    </p>

                    <button
                      onClick={() => handleAutoDispatch(hazard)}
                      disabled={dispatching}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>
                        {dispatching
                          ? (isKannada ? 'ನಿಯೋಜಿಸಲಾಗುತ್ತಿದೆ...' : 'Dispatching...')
                          : (isKannada ? '⚡ PWD ತುರ್ತು ಪರಿಹಾರ ನಿಯೋಜಿಸಿ (12h)' : '⚡ Auto-Dispatch PWD Crew (12h)')}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <span>{isKannada ? 'ಈ ಕಾರಿಡಾರ್‌ನಲ್ಲಿ ಯಾವುದೇ ರಸ್ತೆ ಗುಂಡಿ ಪತ್ತೆಯಾಗಿಲ್ಲ.' : 'No active road hazards detected on this corridor. Pavement stable.'}</span>
              </div>
            )}
          </div>

          {/* Camera Selector List */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center space-x-2">
              <Video className="w-4 h-4 text-amber-600" />
              <span>{isKannada ? 'ಸಿಸಿಟಿವಿ ಕ್ಯಾಮೆರಾ ಪಟ್ಟಿ' : 'Select CCTV Stream'}</span>
            </h3>

            <div className="space-y-2">
              {cameras.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => {
                    setSelectedCam(cam);
                    setDispatchSuccess(null);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    selectedCam?.id === cam.id
                      ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-amber-300 bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="font-extrabold text-xs text-slate-900">
                      {isKannada ? cam.nameKn : cam.nameEn}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {cam.id} • {cam.activeDetections?.length || 0} {isKannada ? 'ಅಪಾಯಗಳು' : 'hazards'}
                    </p>
                  </div>

                  {cam.activeDetections?.length > 0 ? (
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      ALERT
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      CLEAR
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
