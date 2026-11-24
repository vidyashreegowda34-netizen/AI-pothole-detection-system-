import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Languages,
  User,
  LogOut,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  Building2,
  FileText,
  Eye,
  Video,
  Activity,
  TrendingUp,
  Zap,
} from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout, isOfficer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'kn' ? 'en' : 'kn';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('tumakuru_lang', nextLang);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight">
                  {i18n.language === 'kn' ? 'ನಮ್ಮ ತುಮಕೂರು' : 'Namma Tumakuru'}
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {i18n.language === 'kn' ? 'ಪರಿಷ್ಕಾರ' : 'Parishkara'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {t('appSubtitle')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-amber-700 bg-amber-50' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/report"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/report') ? 'text-amber-700 bg-amber-50' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>{t('nav.report')}</span>
            </Link>
            <Link
              to="/map"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/map') ? 'text-amber-700 bg-amber-50' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              {t('nav.map')}
            </Link>
            <Link
              to="/transparency"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/transparency') ? 'text-amber-700 bg-amber-50' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.transparency')}</span>
            </Link>

            <Link
              to="/cctv"
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isActive('/cctv') ? 'text-red-700 bg-red-50' : 'text-slate-600 hover:text-red-600 hover:bg-slate-50'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-red-500" />
              <span>{i18n.language === 'kn' ? 'ಸಿಸಿಟಿವಿ' : 'CCTV'}</span>
            </Link>

            <Link
              to="/iot"
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isActive('/iot') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>IoT</span>
            </Link>

            <Link
              to="/predictive"
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isActive('/predictive') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>{i18n.language === 'kn' ? 'ಮುನ್ಸೂಚನೆ' : 'Predictive'}</span>
            </Link>

            <Link
              to="/potholes"
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                isActive('/potholes') || isActive('/pothole-analyzer')
                  ? 'text-amber-800 bg-amber-100 border-amber-300'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
              }`}
              title="Mini Project: AI Pothole Detection & Mapping"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>{i18n.language === 'kn' ? 'ಗುಂಡಿ AI ವಿಶ್ಲೇಷಕ' : 'AI Pothole Analyzer'}</span>
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  isActive('/login') ? 'text-amber-700 bg-amber-50' : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 text-amber-600" />
                <span>{t('nav.login')}</span>
              </Link>
            )}

            {/* Role specific links */}
            {isOfficer && (
              <Link
                to="/officer"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/officer') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>{t('nav.officer')}</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/admin') ? 'text-purple-700 bg-purple-50' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>{t('nav.admin')}</span>
              </Link>
            )}

            {isAuthenticated && !isOfficer && !isAdmin && (
              <Link
                to="/my-reports"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/my-reports') ? 'text-amber-700 bg-amber-50' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
                }`}
              >
                {t('nav.myReports')}
              </Link>
            )}
          </nav>

          {/* Right Action Icons: Language Toggle & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all shadow-sm"
              title="Toggle Kannada / English"
            >
              <Languages className="w-3.5 h-3.5 text-amber-700" />
              <span>{i18n.language === 'kn' ? 'English' : 'ಕನ್ನಡ'}</span>
            </button>

            {/* Auth Button or User Badge */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-slate-100 py-1 px-2.5 rounded-full border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden sm:inline-block">
                    {user?.name || user?.phoneNumber}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isAdmin ? 'bg-purple-100 text-purple-700' : isOfficer ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs sm:text-sm font-semibold hover:from-amber-700 hover:to-amber-600 transition-all shadow-sm shadow-amber-500/20"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('nav.login')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
