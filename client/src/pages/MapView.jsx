import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import IssueMap from '../components/IssueMap';
import { Filter, Layers, Flame, MapPin, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MapView() {
  const { t, i18n } = useTranslation();
  const isKannada = i18n.language === 'kn';

  const [issues, setIssues] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapCenter, setMapCenter] = useState([13.3409, 77.1010]);
  const [zoomLevel, setZoomLevel] = useState(12);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [selectedTaluk, selectedCategory, selectedStatus]);

  const loadFilters = async () => {
    try {
      const [tRes, dRes] = await Promise.all([
        api.get('/taluks'),
        api.get('/departments'),
      ]);
      if (tRes.data.success) setTaluks(tRes.data.taluks);
      if (dRes.data.success) {
        const all = dRes.data.departments.flatMap((d) => d.categories || []);
        setCategories(all);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedTaluk) params.talukId = selectedTaluk;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;

      const res = await api.get('/issues', { params });
      if (res.data.success) {
        setIssues(res.data.issues);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTalukSelect = (talukId) => {
    setSelectedTaluk(talukId);
    if (!talukId) {
      setMapCenter([13.3409, 77.1010]);
      setZoomLevel(11);
    } else {
      const found = taluks.find((t) => t.id === talukId);
      if (found) {
        setMapCenter([found.latitude, found.longitude]);
        setZoomLevel(13);
      }
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            {isKannada ? 'ತುಮಕೂರು ಜಿಲ್ಲಾ ಸಾರ್ವಜನಿಕ ನಕ್ಷೆ' : 'Tumkur District Civic Issue Map'}
          </h1>
          <p className="text-xs text-slate-500">
            {issues.length} {isKannada ? 'ದೂರುಗಳು ನಕ್ಷೆಯಲ್ಲಿ ಗುರುತಿಸಲಾಗಿದೆ' : 'active issues plotted across the district'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Taluk Dropdown */}
          <select
            value={selectedTaluk}
            onChange={(e) => handleTalukSelect(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">{isKannada ? 'ಎಲ್ಲಾ ತಾಲೂಕುಗಳು' : 'All Taluks'}</option>
            {taluks.map((t) => (
              <option key={t.id} value={t.id}>
                {isKannada ? t.nameKn : t.nameEn}
              </option>
            ))}
          </select>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">{isKannada ? 'ಎಲ್ಲಾ ವರ್ಗಗಳು' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {isKannada ? c.nameKn : c.nameEn}
              </option>
            ))}
          </select>

          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              showHeatmap
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isKannada ? 'ಹಾಟ್‌ಸ್ಪಾಟ್ (Heatmap)' : 'Hotspots'}</span>
          </button>
        </div>
      </div>

      {/* Map Display */}
      <div className="relative">
        <IssueMap
          center={mapCenter}
          zoom={zoomLevel}
          issues={issues}
          showHeatmap={showHeatmap}
          height="580px"
        />

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-1000 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-lg text-[11px] font-semibold space-y-1.5">
          <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
            {isKannada ? 'ಚಿಹ್ನೆಗಳ ವಿವರ' : 'Legend'}
          </p>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span>{t('status.SUBMITTED')} / {t('status.VERIFIED')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
            <span>{t('status.IN_PROGRESS')} / {t('status.ASSIGNED')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>{t('status.RESOLVED')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
            <span>{t('urgency.EMERGENCY')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
