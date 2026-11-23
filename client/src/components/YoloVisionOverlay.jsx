import React, { useState } from 'react';
import { Eye, EyeOff, Zap, ShieldAlert, Cpu } from 'lucide-react';

/**
 * YoloVisionOverlay Component
 * Renders real-time YOLO11n neural bounding boxes, confidence tags, and laser scanning overlay
 */
export default function YoloVisionOverlay({
  imageUrl,
  alt = 'Road imagery',
  detections = [],
  isScanning = false,
  showToggle = true,
  className = '',
  imageClassName = '',
  onClick,
}) {
  const [showBoxes, setShowBoxes] = useState(true);

  return (
    <div className={`relative overflow-hidden group select-none ${className}`}>
      {/* Base Image */}
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-300 ${imageClassName}`}
        onClick={onClick}
      />

      {/* Laser Scanning Animation when AI Inference is Active */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden bg-black/30 backdrop-blur-[1px]">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-2">
            <div className="flex items-center space-x-2 bg-black/80 px-4 py-1.5 rounded-full border border-amber-400/50 shadow-lg">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-amber-300">
                YOLO11n NEURAL SCANNING...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* YOLO11n Bounding Boxes Overlay */}
      {showBoxes && !isScanning && detections && detections.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {detections.map((det, idx) => {
            const isCritical = det.severity === 'CRITICAL' || det.confidence > 0.94;
            const borderColor = isCritical ? 'border-red-500' : 'border-amber-400';
            const glowColor = isCritical
              ? 'shadow-[0_0_12px_rgba(239,68,68,0.8)]'
              : 'shadow-[0_0_12px_rgba(245,158,11,0.8)]';
            const badgeBg = isCritical ? 'bg-red-600' : 'bg-amber-500';

            const x = det.normalizedBox?.x ?? 25;
            const y = det.normalizedBox?.y ?? 40;
            const w = det.normalizedBox?.width ?? 45;
            const h = det.normalizedBox?.height ?? 30;

            return (
              <div
                key={det.id || idx}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${w}%`,
                  height: `${h}%`,
                }}
                className={`absolute border-2 ${borderColor} ${glowColor} rounded-lg transition-all duration-300`}
              >
                {/* 4 Corner Crosshairs */}
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />

                {/* Floating Tag */}
                <div className="absolute -top-6 left-0 flex items-center space-x-1 whitespace-nowrap">
                  <span
                    className={`${badgeBg} text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded shadow-md flex items-center space-x-1 border border-white/20`}
                  >
                    <Zap className="w-2.5 h-2.5 fill-white" />
                    <span>
                      YOLO11n: {det.class} {(det.confidence * 100).toFixed(1)}%
                    </span>
                  </span>
                  {det.depthEstimate && (
                    <span className="bg-black/80 text-amber-300 text-[8px] font-mono px-1 py-0.5 rounded hidden sm:inline-block border border-white/10">
                      {det.depthEstimate}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Model Watermark Badge */}
      <div className="absolute bottom-1.5 right-1.5 z-10 flex items-center space-x-1 bg-black/75 backdrop-blur-xs text-white/90 text-[8px] font-mono px-1.5 py-0.5 rounded border border-white/15 pointer-events-none">
        <Cpu className="w-2.5 h-2.5 text-amber-400" />
        <span>Ultralytics YOLO11n</span>
      </div>

      {/* Bounding Box Visibility Toggle Pill */}
      {showToggle && detections && detections.length > 0 && !isScanning && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowBoxes(!showBoxes);
          }}
          className="absolute top-2 right-2 z-20 bg-black/80 hover:bg-black text-white text-[10px] font-mono font-bold px-2 py-1 rounded-full flex items-center space-x-1 shadow-md border border-white/20 transition-all pointer-events-auto"
        >
          {showBoxes ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
          <span>{showBoxes ? 'YOLO11n ON' : 'YOLO11n OFF'}</span>
        </button>
      )}
    </div>
  );
}
