import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import api from '../api/client';
import IssueCard from '../components/IssueCard';
import {
  FileText,
  ThumbsUp,
  WifiOff,
  RefreshCw,
  PlusCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyReports() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { queue, syncQueue, isSyncing, removeFromQueue } = useOffline();
  const isKannada = i18n.language === 'kn';

  const [activeTab, setActiveTab] = useState('reported'); // 'reported' | 'offline'
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyIssues();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchMyIssues = async () => {
    setLoading(true);
    try {
      const res = await api.get('/issues?myReports=true');
      if (res.data.success) {
        setMyIssues(res.data.issues);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {t('nav.myReports')}
          </h1>
          <p className="text-xs text-slate-500">
            {isKannada ? 'ನೀವು ಸಲ್ಲಿಸಿದ ಮತ್ತು ಟ್ರ್ಯಾಕ್ ಮಾಡುತ್ತಿರುವ ದೂರುಗಳು' : 'Track your submitted grievances and offline drafts'}
          </p>
        </div>

        <Link
          to="/report"
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('hero.ctaReport')}</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('reported')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === 'reported'
              ? 'border-amber-600 text-amber-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isKannada ? 'ನನ್ನ ದೂರುಗಳು' : 'Reported Issues'} ({myIssues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('offline')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === 'offline'
              ? 'border-amber-600 text-amber-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <WifiOff className="w-4 h-4" />
          <span>{isKannada ? 'ಆಫ್‌ಲೈನ್ ಕ್ಯೂ' : 'Offline Queue'} ({queue.length})</span>
        </button>
      </div>

      {/* Tab Content: Reported Issues */}
      {activeTab === 'reported' && (
        <div>
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              Loading your reports...
            </div>
          ) : myIssues.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-700 font-bold text-sm">
                {isKannada ? 'ನೀವು ಇನ್ನೂ ಯಾವುದೇ ದೂರು ದಾಖಲಿಸಿಲ್ಲ' : 'You have not submitted any reports yet'}
              </p>
              <Link
                to="/report"
                className="inline-flex items-center space-x-1 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('hero.ctaReport')}</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Offline Queue */}
      {activeTab === 'offline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-4 rounded-2xl">
            <div className="text-xs text-blue-900">
              <p className="font-bold">{t('offline.queued')}</p>
              <p>{isKannada ? 'ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಬಂದಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸರ್ವರ್‌ಗೆ ಸಲ್ಲಿಕೆಯಾಗುತ್ತದೆ.' : 'Reports saved locally will auto-sync when online.'}</p>
            </div>
            {queue.length > 0 && (
              <button
                onClick={syncQueue}
                disabled={isSyncing}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{t('offline.syncNow')}</span>
              </button>
            )}
          </div>

          {queue.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              {isKannada ? 'ಆಫ್‌ಲೈನ್ ಕ್ಯೂನಲ್ಲಿ ಯಾವುದೇ ದೂರುಗಳಿಲ್ಲ.' : 'Offline queue is currently empty.'}
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => (
                <div key={item.tempId} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      Saved: {new Date(item.queuedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromQueue(item.tempId)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
