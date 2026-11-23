import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Home, PlusCircle, Map, FileText, UserCheck, BarChart2 } from 'lucide-react';

export default function BottomNav() {
  const { t } = useTranslation();
  const { isAuthenticated, isOfficer, isAdmin } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-amber-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>{t('nav.home')}</span>
        </NavLink>

        <NavLink
          to="/map"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-amber-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <Map className="w-5 h-5 mb-0.5" />
          <span>{t('nav.map')}</span>
        </NavLink>

        {/* Central Floating Action Button: Report Issue */}
        <NavLink
          to="/report"
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 border-4 border-white active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6 stroke-[2.4]" />
          </div>
          <span className="text-[10px] font-bold text-amber-700 mt-0.5">
            {t('nav.report')}
          </span>
        </NavLink>

        {isOfficer ? (
          <NavLink
            to="/officer"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`
            }
          >
            <UserCheck className="w-5 h-5 mb-0.5" />
            <span>{t('nav.officer')}</span>
          </NavLink>
        ) : isAdmin ? (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-purple-600 font-bold' : 'text-slate-500'
              }`
            }
          >
            <BarChart2 className="w-5 h-5 mb-0.5" />
            <span>{t('nav.admin')}</span>
          </NavLink>
        ) : (
          <NavLink
            to={isAuthenticated ? "/my-reports" : "/login"}
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-amber-600 font-bold' : 'text-slate-500'
              }`
            }
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span>{t('nav.myReports')}</span>
          </NavLink>
        )}
      </div>
    </div>
  );
}
