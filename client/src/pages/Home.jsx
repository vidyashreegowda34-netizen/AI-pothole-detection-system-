import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import IssueCard from '../components/IssueCard';
import {
  MapPin,
  PlusCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Filter,
  Search,
  Sparkles,
  Map,
  ArrowRight,
  ShieldCheck,
  Building,
  Flame,
  AlertTriangle,
  Layers,
  Zap,
} from 'lucide-react';

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKannada = i18n.language === 'kn';

  const [issues, setIssues] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [selectedTaluk, selectedCategory, selectedStatus]);

  const fetchInitialData = async () => {
    try {
      const [talukRes, deptRes, summaryRes] = await Promise.all([
        api.get('/taluks'),
        api.get('/departments'),
        api.get('/analytics/summary'),
      ]);

      if (talukRes.data.success) setTaluks(talukRes.data.taluks);
      if (summaryRes.data.success) setSummary(summaryRes.data.summary);

      if (deptRes.data.success) {
        // Flatten categories
        const allCats = deptRes.data.departments.flatMap((d) => d.categories || []);
        setCategories(allCats);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedTaluk) params.talukId = selectedTaluk;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/issues', { params });
      if (res.data.success) {
        setIssues(res.data.issues);
      }
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIssues();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white p-6 sm:p-10 shadow-xl">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 bg-amber-500/30 backdrop-blur-md border border-amber-300/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-100">
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span>{t('hero.badge')}</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 bg-black/40 backdrop-blur-md border border-amber-400/40 px-3 py-1 rounded-full text-[11px] font-bold font-mono text-amber-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{isKannada ? 'ಯೋಲೋ11n ರಸ್ತೆ ಗುಂಡಿ AI ಸಕ್ರಿಯ' : 'YOLO11n AI Vision Assisted'}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {t('hero.title')}
          </h1>

          <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/report"
              className="flex items-center space-x-2 bg-white text-amber-900 hover:bg-amber-50 px-5 py-3 rounded-xl font-extrabold text-sm shadow-lg shadow-black/10 active:scale-95 transition-all"
            >
              <PlusCircle className="w-5 h-5 text-amber-600" />
              <span>{t('hero.ctaReport')}</span>
            </Link>

            <Link
              to="/map"
              className="flex items-center space-x-2 bg-amber-500/30 hover:bg-amber-500/40 border border-amber-300/40 text-white px-5 py-3 rounded-xl font-bold text-sm backdrop-blur-md active:scale-95 transition-all"
            >
              <Map className="w-4 h-4 text-amber-200" />
              <span>{t('hero.ctaMap')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* District Analytics Summary Counter Bar */}
      {summary && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{summary.total}</p>
              <p className="text-xs font-semibold text-slate-500">{t('stats.total')}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-600">{summary.resolved}</p>
              <p className="text-xs font-semibold text-slate-500">{t('stats.resolved')}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-blue-600">{summary.inProgress}</p>
              <p className="text-xs font-semibold text-slate-500">{t('stats.inProgress')}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-purple-600">{summary.resolutionRate}%</p>
              <p className="text-xs font-semibold text-slate-500">{t('stats.resolutionRate')}</p>
            </div>
          </div>
        </section>
      )}

      {/* 11 Tumkur Taluks & Active Categories Directory */}
      <section className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Building className="w-5 h-5 text-amber-600" />
              <span>{isKannada ? 'ತುಮಕೂರು ಜಿಲ್ಲೆಯ 11 ತಾಲೂಕುಗಳು ಮತ್ತು ವರ್ಗಗಳ ಪರಿವೀಕ್ಷಣೆ' : 'Tumkur District Taluks & Categories Directory'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isKannada
                ? 'ಯಾವುದೇ ತಾಲೂಕಿನ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ, ಆ ತಾಲೂಕಿನ ಸಕ್ರಿಯ ವರ್ಗಗಳು ಮತ್ತು ತುರ್ತು ಹಂತಗಳನ್ನು (Emergency Phase) ಪರಿಶೀಲಿಸಿ'
                : 'Click any taluk to explore its civic issues, active categories, and live emergency phase status'}
            </p>
          </div>

          {selectedTaluk && (
            <button
              onClick={() => setSelectedTaluk('')}
              className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors"
            >
              {isKannada ? 'ಎಲ್ಲಾ ತಾಲೂಕುಗಳು' : 'Show All Taluks'}
            </button>
          )}
        </div>

        {/* 11 Taluks Interactive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {taluks.map((t) => {
            const isSelected = selectedTaluk === t.id;
            const talukIssues = issues.filter((i) => i.talukId === t.id);
            const emergencyCount = talukIssues.filter((i) => i.urgency === 'EMERGENCY').length;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTaluk(isSelected ? '' : t.id)}
                className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/80 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-amber-300 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
                      {isKannada ? t.nameKn : t.nameEn}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                      t.isUrban ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {t.isUrban ? (isKannada ? 'ನಗರ' : 'Urban') : (isKannada ? 'ಗ್ರಾಮೀಣ' : 'Rural')}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono">
                    {t.latitude.toFixed(2)}°N, {t.longitude.toFixed(2)}°E
                  </p>
                </div>

                {/* Emergency Phase Alert Badge & Issue Counter */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  {emergencyCount > 0 ? (
                    <span className="bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full flex items-center space-x-0.5 animate-pulse shadow-xs">
                      <Flame className="w-2.5 h-2.5 text-yellow-300" />
                      <span>{emergencyCount} {isKannada ? 'ತುರ್ತು ಅಪಾಯ' : 'Emergency'}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">
                      {isKannada ? 'ಸಾಮಾನ್ಯ ಸ್ಥಿತಿ' : 'Normal'}
                    </span>
                  )}

                  <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {t.issuesCount || talukIssues.length || t._count?.issues || 0} {isKannada ? 'ದೂರುಗಳು' : 'issues'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={isKannada ? "ದೂರು ಅಥವಾ ರಸ್ತೆ ಹುಡುಕಿ..." : "Search issues or location..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </form>

          {/* Taluk Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedTaluk}
              onChange={(e) => setSelectedTaluk(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
            >
              <option value="">{isKannada ? 'ಎಲ್ಲಾ 11 ತಾಲೂಕುಗಳು' : 'All 11 Taluks'}</option>
              {taluks.map((t) => (
                <option key={t.id} value={t.id}>
                  {isKannada ? t.nameKn : t.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
            >
              <option value="">{isKannada ? 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು' : 'All Statuses'}</option>
              <option value="SUBMITTED">{t('status.SUBMITTED')}</option>
              <option value="IN_PROGRESS">{t('status.IN_PROGRESS')}</option>
              <option value="RESOLVED">{t('status.RESOLVED')}</option>
              <option value="REOPENED">{t('status.REOPENED')}</option>
            </select>
          </div>
        </div>

        {/* Category Quick Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
              selectedCategory === ''
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isKannada ? 'ಎಲ್ಲಾ ವರ್ಗಗಳು' : 'All Categories'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isKannada ? cat.nameKn : cat.nameEn}
            </button>
          ))}
        </div>
      </section>

      {/* Issues Feed Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isKannada ? 'ಇತ್ತೀಚಿನ ಸಾರ್ವಜನಿಕ ದೂರುಗಳು' : 'Recent Civic Reports'}
            </h2>
            <p className="text-xs text-slate-500">
              {isKannada ? 'ತುಮಕೂರು ಜಿಲ್ಲೆಯಲ್ಲಿ ವರದಿಯಾದ ಸಮಸ್ಯೆಗಳು' : 'Live reports from citizens across Tumkur'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {issues.length} {isKannada ? 'ದೂರುಗಳು' : 'Issues'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 border border-slate-200 animate-pulse p-4 flex flex-col justify-between">
                <div className="bg-slate-200 h-40 rounded-xl"></div>
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              {isKannada ? 'ಯಾವುದೇ ದೂರುಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No issues found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isKannada
                ? 'ಆಯ್ಕೆಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ತಕ್ಕಂತೆ ಯಾವುದೇ ದೂರುಗಳು ದಾಖಲಾಗಿಲ್ಲ.'
                : 'Try clearing your filters or report a new civic issue in your area.'}
            </p>
            <Link
              to="/report"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-sm hover:bg-amber-700"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('hero.ctaReport')}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
