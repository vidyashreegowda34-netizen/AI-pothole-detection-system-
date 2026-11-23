import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  AlertCircle,
  Building2,
  Lock,
} from 'lucide-react';

export default function Transparency() {
  const { t, i18n } = useTranslation();
  const isKannada = i18n.language === 'kn';

  const [summary, setSummary] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransparencyData();
  }, []);

  const fetchTransparencyData = async () => {
    setLoading(true);
    try {
      const [sumRes, deptRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/departments'),
      ]);
      if (sumRes.data.success) setSummary(sumRes.data.summary);
      if (deptRes.data.success) setDepartments(deptRes.data.departments);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-3">
        <div className="inline-flex items-center space-x-1.5 bg-emerald-700/60 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span>{isKannada ? 'ಸಾರ್ವಜನಿಕ ಪಾರದರ್ಶಕತೆ ವೇದಿಕೆ' : 'Public Accountability & Transparency Portal'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          {isKannada ? 'ನಮ್ಮ ತುಮಕೂರು ಪಾರದರ್ಶಕತೆ ವರದಿ' : 'Namma Tumakuru Transparency Report'}
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
          {isKannada
            ? 'ಪ್ರತಿಯೊಂದು ಸಾರ್ವಜನಿಕ ದೂರು, ಇಲಾಖೆಯ ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ ಮತ್ತು ಪರಿಹಾರದ ವಿವರಗಳನ್ನು ಸಾರ್ವಜನಿಕವಾಗಿ ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತದೆ. ಭ್ರಷ್ಟಾಚಾರ ಮುಕ್ತ ಮತ್ತು ಪಾರದರ್ಶಕ ಆಡಳಿತ ನಮ್ಮ ಧ್ಯೇಯ.'
            : 'Every citizen grievance, departmental SLA response time, and verified proof of resolution is publicly accessible. Ensuring transparent, accountable district governance.'}
        </p>
      </div>

      {/* Live KPIs */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold">{t('stats.total')}</span>
            <p className="text-2xl font-black text-slate-900">{summary.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold">{t('stats.resolved')}</span>
            <p className="text-2xl font-black text-emerald-600">{summary.resolved}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold">{t('stats.inProgress')}</span>
            <p className="text-2xl font-black text-blue-600">{summary.inProgress}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold">{t('stats.avgTime')}</span>
            <p className="text-2xl font-black text-purple-600">{summary.avgResolutionHours}h</p>
          </div>
        </div>
      )}

      {/* SLA Standards Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="font-extrabold text-slate-900 text-base">
          {isKannada ? 'ಇಲಾಖಾವಾರು ಅಧಿಕೃತ ಪರಿಹಾರ ಕಾಲಾವಧಿ (SLA)' : 'Department Official Resolution SLAs'}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">{isKannada ? 'ಇಲಾಖೆ' : 'Department'}</th>
                <th className="py-2.5 px-3">{isKannada ? 'ಸಮಸ್ಯೆಗಳ ವರ್ಗಗಳು' : 'Categories'}</th>
                <th className="py-2.5 px-3">{isKannada ? 'ಗರಿಷ್ಠ ಗಡುವು (SLA)' : 'Target SLA'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {isKannada ? dept.nameKn : dept.nameEn}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {dept.categories?.map((c) => (isKannada ? c.nameKn : c.nameEn)).join(', ')}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                    {dept.categories?.[0]?.slaHours || 48} Hours
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
