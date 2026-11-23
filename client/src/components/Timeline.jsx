import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  AlertCircle,
  RotateCcw,
  Shield,
  Send,
} from 'lucide-react';

export default function Timeline({ events = [] }) {
  const { t, i18n } = useTranslation();
  const isKannada = i18n.language === 'kn';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <Send className="w-4 h-4 text-amber-600" />;
      case 'VERIFIED':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'ASSIGNED':
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 'IN_PROGRESS':
        return <Wrench className="w-4 h-4 text-cyan-600" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'CLOSED':
        return <CheckCircle2 className="w-4 h-4 text-slate-600" />;
      case 'REOPENED':
        return <RotateCcw className="w-4 h-4 text-rose-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusDotBg = (status) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-amber-100 border-amber-300';
      case 'VERIFIED': return 'bg-blue-100 border-blue-300';
      case 'ASSIGNED': return 'bg-indigo-100 border-indigo-300';
      case 'IN_PROGRESS': return 'bg-cyan-100 border-cyan-300';
      case 'RESOLVED': return 'bg-emerald-100 border-emerald-300';
      case 'CLOSED': return 'bg-slate-100 border-slate-300';
      case 'REOPENED': return 'bg-rose-100 border-rose-300';
      default: return 'bg-slate-100 border-slate-300';
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        {isKannada ? 'ಯಾವುದೇ ಇತಿಹಾಸ ಲಭ್ಯವಿಲ್ಲ' : 'No timeline events recorded yet'}
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event, index) => {
        const action = isKannada ? (event.actionKn || event.actionEn) : (event.actionEn || event.actionKn);
        const date = new Date(event.createdAt);
        const formattedDate = date.toLocaleDateString(isKannada ? 'kn-IN' : 'en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={event.id || index} className="relative group">
            {/* Step Icon Indicator */}
            <div
              className={`absolute -left-[30px] top-0 w-7 h-7 rounded-full border-2 flex items-center justify-center bg-white shadow-sm transition-transform group-hover:scale-110 ${getStatusDotBg(
                event.status
              )}`}
            >
              {getStatusIcon(event.status)}
            </div>

            {/* Event Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <span className="font-bold text-slate-900 text-sm">
                  {action}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formattedDate}</span>
                </span>
              </div>

              {/* Notes */}
              {event.notes && (
                <p className="text-xs text-slate-600 mt-1 bg-white p-2 rounded-lg border border-slate-100">
                  {event.notes}
                </p>
              )}

              {/* Actor Tag */}
              <div className="mt-2 flex items-center space-x-2 text-[11px] text-slate-500">
                <span className="font-medium text-slate-700">
                  {event.actorName || 'System'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-semibold text-[10px] uppercase">
                  {event.actorRole}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
