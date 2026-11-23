import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import {
  BarChart3,
  Download,
  Award,
  TrendingUp,
  Clock,
  ShieldCheck,
  Building2,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const isKannada = i18n.language === 'kn';

  const [talukStats, setTalukStats] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    setLoading(true);
    try {
      const [sumRes, talukRes, leadRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/taluks'),
        api.get('/analytics/leaderboard'),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.summary);
      if (talukRes.data.success) setTalukStats(talukRes.data.talukStats);
      if (leadRes.data.success) setLeaderboard(leadRes.data.leaderboard);
    } catch (e) {
      console.error('Analytics load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const response = await api.get('/analytics/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `namma-tumakuru-civic-issues-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-purple-800/80 px-2.5 py-0.5 rounded-full text-xs font-bold text-purple-200">
            Tumkur District Administration Portal
          </span>
          <h1 className="text-2xl font-black mt-1">{t('admin.title')}</h1>
          <p className="text-xs text-purple-200/80">
            {isKannada ? '11 ತಾಲೂಕುಗಳ ಕಾರ್ಯಕ್ಷಮತೆ ಮತ್ತು ಇಲಾಖಾ SLA ಪಾಲನೆ ವಿಶ್ಲೇಷಣೆ' : 'Real-time governance, SLA compliance, and taluk performance leaderboard'}
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-purple-900 hover:bg-purple-50 font-extrabold text-xs shadow-md transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-purple-700" />
          <span>{exporting ? 'Exporting...' : t('admin.exportCsv')}</span>
        </button>
      </div>

      {/* District KPI Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold">{t('stats.total')}</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{summary.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold">{t('stats.resolved')}</span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{summary.resolved}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold">{t('stats.avgTime')}</span>
            <p className="text-2xl font-black text-blue-600 mt-0.5">{summary.avgResolutionHours}h</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold">{t('stats.resolutionRate')}</span>
            <p className="text-2xl font-black text-purple-600 mt-0.5">{summary.resolutionRate}%</p>
          </div>
        </div>
      )}

      {/* Department Performance Leaderboard */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>{t('admin.deptLeaderboard')}</span>
        </h2>

        <div className="space-y-3">
          {leaderboard.map((dept, index) => (
            <div
              key={dept.id}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                  index === 0 ? 'bg-amber-400 text-amber-950 shadow-sm' :
                  index === 1 ? 'bg-slate-300 text-slate-800' :
                  index === 2 ? 'bg-orange-300 text-orange-950' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  #{index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {isKannada ? dept.nameKn : dept.nameEn}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Total: {dept.totalIssues} • Resolved: {dept.resolvedIssues} • Pending: {dept.pendingIssues}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900">{dept.slaCompliance}%</span>
                  <p className="text-[10px] text-slate-400">{t('admin.compliance')}</p>
                </div>
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-xl font-black text-xs">
                  {dept.score} {t('admin.score')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Taluk-Wise Distribution across 11 Tumkur Taluks */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-amber-600" />
          <span>{t('admin.talukStats')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {talukStats.map((taluk) => (
            <div key={taluk.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">
                  {isKannada ? taluk.nameKn : taluk.nameEn}
                </h4>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {taluk.resolutionRate}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${taluk.resolutionRate}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Total: {taluk.totalIssues}</span>
                <span>Resolved: {taluk.resolvedIssues}</span>
                <span>Pending: {taluk.pendingIssues}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
