import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Calendar,
  CloudRain,
  DollarSign,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Layers,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function PredictiveRepair() {
  const { t, i18n } = useTranslation();
  const isKannada = i18n.language === 'kn';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterVulnerability, setFilterVulnerability] = useState('ALL');

  useEffect(() => {
    fetchPredictiveData();
  }, []);

  const fetchPredictiveData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/smartcity/predictive');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch predictive repair data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTaluks = data?.taluks?.filter((t) => {
    if (filterVulnerability === 'ALL') return true;
    return t.monsoonVulnerability === filterVulnerability;
  }) || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-3xl border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{isKannada ? 'ಮುನ್ಸೂಚನಾ ರಸ್ತೆ ಸವೆತ ಮತ್ತು ದುರಸ್ತಿ AI ಮಾದರಿ' : 'AI PREDICTIVE ROAD INFRASTRUCTURE & WEAR FORECAST'}</span>
            <span className="bg-emerald-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-black">
              RDI-v2
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {isKannada ? 'ರಸ್ತೆ ಸವೆತ ಸೂಚ್ಯಂಕ ಮತ್ತು ಮುನ್ಸೂಚನಾ ದುರಸ್ತಿ' : 'Predictive Road Degradation & Preventive Maintenance'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            {isKannada
              ? 'ವಾಹನ ದಟ್ಟಣೆ, ಮಳೆ ಪ್ರಮಾಣ ಮತ್ತು ಹಿಂದಿನ ಗುಂಡಿಗಳ ಸಾಂದ್ರತೆಯ ಆಧಾರದ ಮೇಲೆ ಮುಂದಿನ 30 ದಿನಗಳಲ್ಲಿ ಬೀಳಬಹುದಾದ ರಸ್ತೆ ಗುಂಡಿಗಳ ಮುನ್ಸೂಚನೆ.'
              : 'Machine learning forecasting pavement fatigue, weather degradation, and potential crater formation before fatal accidents occur.'}
          </p>
        </div>

        <button
          onClick={fetchPredictiveData}
          className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isKannada ? 'ನವೀಕರಿಸಿ' : 'Refresh Forecast'}</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Average Road Health */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isKannada ? 'ಜಿಲ್ಲಾ ಸರಾಸರಿ ರಸ್ತೆ ಆರೋಗ್ಯ' : 'District Avg Road Health'}
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-2xl font-black text-slate-900">{data.avgHealthScore}</span>
                <span className="text-xs text-slate-500 font-bold">/ 100</span>
              </div>
              <span className="text-[11px] text-amber-700 font-semibold">
                {isKannada ? 'ಮಧ್ಯಮ ಸವೆತ ಮಟ್ಟ' : 'Moderate Wear Level'}
              </span>
            </div>
          </div>

          {/* Predicted Potholes */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isKannada ? '30 ದಿನಗಳ ಮುನ್ಸೂಚಿತ ಗುಂಡಿಗಳು' : '30-Day Potholes Forecast'}
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-2xl font-black text-red-600">{data.totalPotholesPredicted30Days}</span>
                <span className="text-xs text-slate-500 font-bold">{isKannada ? 'ಹೊಸ ಗುಂಡಿಗಳು' : 'new craters'}</span>
              </div>
              <span className="text-[11px] text-red-700 font-semibold">
                Across 11 Tumkur Taluks
              </span>
            </div>
          </div>

          {/* Projected Savings */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-300 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isKannada ? 'ಮುನ್ಸೂಚನಾ ಉಳಿತಾಯ ದರ' : 'Proactive Resurfacing Savings'}
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-2xl font-black text-emerald-600">52.4%</span>
                <span className="text-xs text-emerald-700 font-bold">Cost Saved</span>
              </div>
              <span className="text-[11px] text-emerald-800 font-semibold">
                {isKannada ? 'ತುರ್ತು ದುರಸ್ತಿಗಿಂತ ಕಡಿಮೆ ವೆಚ್ಚ' : 'vs emergency cold-patching'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-slate-500 mr-1">
          {isKannada ? 'ಮಳೆ ಅಪಾಯ ಮಟ್ಟ:' : 'Monsoon Risk:'}
        </span>
        {['ALL', 'CRITICAL', 'SEVERE', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterVulnerability(lvl)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterVulnerability === lvl
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Taluk Road Degradation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTaluks.map((taluk) => (
          <div
            key={taluk.talukCode}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {isKannada ? taluk.talukNameKn : taluk.talukNameEn}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {taluk.trafficVolumePerDay.toLocaleString()} {isKannada ? 'ವಾಹನಗಳು/ದಿನ' : 'veh/day'}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className="text-lg font-black font-mono block leading-none"
                    style={{ color: taluk.riskColor }}
                  >
                    {taluk.healthScore}/100
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Health Score
                  </span>
                </div>
              </div>

              {/* Road Health Progress Bar */}
              <div className="mt-3 space-y-1">
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${taluk.healthScore}%`,
                      backgroundColor: taluk.riskColor,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Critical (0)</span>
                  <span>Optimal (100)</span>
                </div>
              </div>

              {/* Forecast Details */}
              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isKannada ? 'ಮುಂದಿನ 30 ದಿನಗಳ ಗುಂಡಿಗಳು:' : '30-Day New Potholes:'}</span>
                  </span>
                  <strong className="text-red-600 font-bold">{taluk.potholesPredicted30Days} predicted</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium flex items-center space-x-1">
                    <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                    <span>{isKannada ? 'ಮಳೆ ಕೊರೆತ ಅಪಾಯ:' : 'Monsoon Vulnerability:'}</span>
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase"
                    style={{
                      backgroundColor: `${taluk.riskColor}20`,
                      color: taluk.riskColor,
                    }}
                  >
                    {taluk.monsoonVulnerability}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-600 font-medium">{isKannada ? 'ಅಂದಾಜು ಉಳಿತಾಯ:' : 'Net Projected Savings:'}</span>
                  <strong className="text-emerald-700 font-black">{taluk.projectedSavingsPct}% saved</strong>
                </div>
              </div>

              {/* Critical Corridors */}
              <div className="mt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {isKannada ? 'ಆದ್ಯತೆಯ ರಸ್ತೆ ಕಾರಿಡಾರ್‌ಗಳು:' : 'Top Priority Corridors:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {taluk.topCriticalCorridors.map((c, i) => (
                    <span
                      key={i}
                      className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-lg"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Proactive Action Note */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isKannada ? 'ಮುನ್ಸೂಚನಾ ವೇಳಾಪಟ್ಟಿ ಸಿದ್ಧ' : 'Proactive Plan Ready'}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">PWD Plan 2026</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
