import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  Activity,
  AlertTriangle,
  Zap,
  Droplets,
  Trash2,
  Lightbulb,
  Gauge,
  CheckCircle2,
  RefreshCw,
  Bell,
  ArrowRight,
  ShieldCheck,
  Thermometer,
} from 'lucide-react';

export default function IotGrid() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKannada = i18n.language === 'kn';

  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [dispatchedTicket, setDispatchedTicket] = useState(null);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/smartcity/iot');
      if (res.data.success) {
        setSensors(res.data.sensors);
      }
    } catch (err) {
      console.error('Failed to fetch IoT sensors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateAlert = async (sensor) => {
    setTriggering(true);
    setDispatchedTicket(null);
    try {
      const res = await api.post('/smartcity/iot/trigger-alert', {
        sensorId: sensor.id,
        sensorName: isKannada ? sensor.nameKn : sensor.nameEn,
        department: sensor.department,
        value: sensor.currentValue,
        unit: sensor.unit,
      });

      if (res.data.success) {
        setDispatchedTicket(res.data.issue);
      }
    } catch (err) {
      console.error('Failed to trigger alert:', err);
    } finally {
      setTriggering(false);
    }
  };

  const getSensorIcon = (type) => {
    switch (type) {
      case 'PRESSURE_SENSOR':
      case 'LIQUID_LEVEL_SENSOR':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'FILL_LEVEL_SENSOR':
        return <Trash2 className="w-5 h-5 text-emerald-500" />;
      case 'POWER_AMPERAGE_SENSOR':
        return <Lightbulb className="w-5 h-5 text-amber-500" />;
      case 'THERMAL_SURGE_SENSOR':
        return <Thermometer className="w-5 h-5 text-rose-500" />;
      default:
        return <Gauge className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-blue-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-400 mb-1">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{isKannada ? 'ಸ್ಮಾರ್ಟ್ ಸಿಟಿ ಐಒಟಿ ಸೆನ್ಸರ್ ಜಾಲ' : 'MUNICIPAL IOT SENSOR & TELEMETRY MESH'}</span>
            <span className="bg-emerald-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-black">
              CONNECTED
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {isKannada ? 'ನಗರ ಮೂಲಸೌಕರ್ಯ ರಿಯಲ್-ಟೈಮ್ ಐಒಟಿ ಸೆನ್ಸರ್‌ಗಳು' : 'Smart City IoT Real-Time Telemetry Grid'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            {isKannada
              ? 'ತುಮಕೂರು ಜಿಲ್ಲೆಯ ನೀರು ಪೈಪ್ ಒತ್ತಡ, ಕಸದ ತೊಟ್ಟಿ ಮಟ್ಟ ಮತ್ತು ವಿದ್ಯುತ್ ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್‌ಗಳ ಸ್ವಯಂಚಾಲಿತ ಸೆನ್ಸರ್ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ.'
              : 'Continuous LoRaWAN/MQTT telemetry monitoring underground pipe pressures, waste capacities, and grid thermals with automated SLA dispatching.'}
          </p>
        </div>

        <button
          onClick={fetchSensors}
          className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isKannada ? 'ನವೀಕರಿಸಿ' : 'Refresh Telemetry'}</span>
        </button>
      </div>

      {/* Dispatched Ticket Notification */}
      {dispatchedTicket && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl flex items-center justify-between text-xs animate-fade-in shadow-md">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold text-emerald-950 text-sm">
                {isKannada ? 'ಐಒಟಿ ಸ್ವಯಂಚಾಲಿತ ದೂರು ದಾಖಲಾಗಿದೆ!' : 'Automated IoT Ticket Dispatched!'}
              </p>
              <p className="text-emerald-800 text-[11px]">
                Ticket <strong>{dispatchedTicket.trackingNumber}</strong> • Sent to {dispatchedTicket.department?.nameEn} engineers for immediate on-site repair.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/issue/${dispatchedTicket.id}`)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shrink-0"
          >
            {isKannada ? 'ವೀಕ್ಷಿಸಿ' : 'View Ticket'}
          </button>
        </div>
      )}

      {/* Grid of IoT Sensors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sensors.map((sensor) => {
          const isCritical = sensor.status === 'CRITICAL_ALERT';
          const isWarning = sensor.status === 'WARNING_DISPATCH';

          return (
            <div
              key={sensor.id}
              className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                isCritical
                  ? 'border-red-300 ring-2 ring-red-400/20 bg-red-50/20'
                  : isWarning
                  ? 'border-amber-300 ring-2 ring-amber-400/20'
                  : 'border-slate-200/90 hover:shadow-md'
              }`}
            >
              <div>
                {/* Top Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                      {getSensorIcon(sensor.type)}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-slate-500 font-bold block">
                        {sensor.id}
                      </span>
                      <span className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-1">
                        {isKannada ? sensor.nameKn : sensor.nameEn}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full font-mono uppercase tracking-wide ${
                      isCritical
                        ? 'bg-red-600 text-white animate-pulse'
                        : isWarning
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {sensor.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Telemetry Gauge & Value */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-3 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {sensor.currentValue} <span className="text-xs text-slate-500">{sensor.unit}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Norm: {sensor.normalRange}
                    </span>
                  </div>

                  {/* Progress bar visual */}
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical
                          ? 'bg-red-600'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          sensor.unit === '%' ? sensor.currentValue : (sensor.currentValue / 3.5) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                    {isKannada ? sensor.alertMessageKn : sensor.alertMessageEn}
                  </p>
                </div>

                {/* Metadata */}
                <div className="text-[11px] text-slate-500 space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>{isKannada ? 'ಇಲಾಖೆ:' : 'Department:'}</span>
                    <strong className="text-slate-700">{sensor.department}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isKannada ? 'ಸ್ಥಳ:' : 'Location:'}</span>
                    <span className="text-slate-700 font-medium truncate max-w-[180px]">{sensor.location}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Trigger Test Alert / Auto-Dispatch */}
              <button
                type="button"
                onClick={() => handleSimulateAlert(sensor)}
                disabled={triggering}
                className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 active:scale-95 disabled:opacity-50 ${
                  isCritical
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20'
                    : 'bg-slate-900 hover:bg-black text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-white text-yellow-300" />
                <span>
                  {triggering
                    ? (isKannada ? 'ರವಾನಿಸಲಾಗುತ್ತಿದೆ...' : 'Dispatching...')
                    : (isKannada ? '⚡ ತುರ್ತು ದೂರು ರವಾನಿಸಿ (Auto-Dispatch)' : '⚡ Trigger Automated Dispatch Ticket')}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
