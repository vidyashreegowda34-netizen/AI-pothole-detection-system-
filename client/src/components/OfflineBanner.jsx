import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOffline } from '../context/OfflineContext';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function OfflineBanner() {
  const { t } = useTranslation();
  const { isOnline, queue, isSyncing, syncSuccessMessage, syncQueue } = useOffline();

  if (isOnline && queue.length === 0 && !syncSuccessMessage) {
    return null;
  }

  return (
    <div className="sticky top-16 z-40">
      {/* Offline Alert */}
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-md">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 animate-bounce" />
            <span>{t('report.offlineNotice')}</span>
          </div>
          {queue.length > 0 && (
            <span className="bg-amber-700 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
              {queue.length} {t('offline.queued')}
            </span>
          )}
        </div>
      )}

      {/* Online Sync Pending Banner */}
      {isOnline && queue.length > 0 && (
        <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-medium shadow-md">
          <span>
            {queue.length} {t('offline.queued')}
          </span>
          <button
            onClick={syncQueue}
            disabled={isSyncing}
            className="flex items-center space-x-1 bg-white text-blue-700 hover:bg-blue-50 px-3 py-1 rounded text-xs font-bold transition-colors disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? t('offline.syncing') : t('offline.syncNow')}</span>
          </button>
        </div>
      )}

      {/* Success Notification */}
      {syncSuccessMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncSuccessMessage}</span>
        </div>
      )}
    </div>
  );
}
