import React, { useEffect, useRef, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  Circle,
} from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, ExternalLink, ThumbsUp } from 'lucide-react';

// Custom Pin Icon generator using CSS DivIcon for 100% reliable SVG rendering
const createCustomPin = (status = 'SUBMITTED', isEmergency = false) => {
  let color = '#d97706'; // default amber
  if (isEmergency) color = '#dc2626'; // red
  else if (status === 'RESOLVED' || status === 'CLOSED') color = '#059669'; // green
  else if (status === 'IN_PROGRESS' || status === 'ASSIGNED') color = '#0284c7'; // blue

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid #ffffff;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to handle map clicks and move pin in draggable mode
function MapEventsHandler({ onPositionChange, isDraggable }) {
  useMapEvents({
    click(e) {
      if (isDraggable && onPositionChange) {
        onPositionChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Component to recenter map view when coordinates change
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 14);
    }
  }, [center, zoom, map]);
  return null;
}

export default function IssueMap({
  center = [13.3409, 77.1010], // Tumkur City default coordinates
  zoom = 13,
  issues = [],
  isDraggable = false,
  pinnedPosition = null,
  onPositionChange = null,
  showHeatmap = false,
  height = '400px',
}) {
  const { t, i18n } = useTranslation();
  const isKannada = i18n.language === 'kn';
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null && onPositionChange) {
          const latlng = marker.getLatLng();
          onPositionChange(latlng.lat, latlng.lng);
        }
      },
    }),
    [onPositionChange]
  );

  const activePosition = pinnedPosition || center;

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer
        center={activePosition}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <ChangeView center={activePosition} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEventsHandler
          isDraggable={isDraggable}
          onPositionChange={onPositionChange}
        />

        {/* Draggable Single Pin Mode (Report Issue Page) */}
        {isDraggable && (
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={activePosition}
            ref={markerRef}
            icon={createCustomPin('SUBMITTED')}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-amber-900">
                  {isKannada ? 'ಗುರುತಿಸಲಾದ ಸ್ಥಳ' : 'Selected Location'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {Number(activePosition[0]).toFixed(4)}°, {Number(activePosition[1]).toFixed(4)}°
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {t('report.dragPinHelp')}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Multi-Issue Markers (Map View & Home Feed) */}
        {!isDraggable &&
          issues.map((issue) => {
            const isEmergency = issue.urgency === 'EMERGENCY';
            const catName = isKannada ? issue.category?.nameKn : issue.category?.nameEn;

            return (
              <React.Fragment key={issue.id}>
                <Marker
                  position={[issue.latitude, issue.longitude]}
                  icon={createCustomPin(issue.status, isEmergency)}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                          {catName}
                        </span>
                        <span className="font-bold text-[10px] text-slate-500 font-mono">
                          {issue.trackingNumber}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">
                        {issue.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center space-x-1 mb-2">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{issue.addressText || `${issue.latitude.toFixed(3)}, ${issue.longitude.toFixed(3)}`}</span>
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {t(`status.${issue.status}`) || issue.status}
                        </span>

                        <Link
                          to={`/issue/${issue.id}`}
                          className="font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
                        >
                          <span>{isKannada ? 'ನೋಡಿ' : 'View'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Heatmap density circles if enabled */}
                {showHeatmap && (
                  <Circle
                    center={[issue.latitude, issue.longitude]}
                    radius={250}
                    pathOptions={{
                      fillColor: isEmergency ? '#ef4444' : '#f59e0b',
                      fillOpacity: 0.25,
                      color: isEmergency ? '#dc2626' : '#d97706',
                      weight: 1,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
      </MapContainer>
    </div>
  );
}
