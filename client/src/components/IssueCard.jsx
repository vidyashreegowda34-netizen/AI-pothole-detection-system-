import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  ThumbsUp,
  MessageSquare,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Flame,
  Zap,
} from 'lucide-react';

export default function IssueCard({ issue, onUpvoteToggle }) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isUpvoted, setIsUpvoted] = useState(issue.isUpvotedByMe);
  const [upvotesCount, setUpvotesCount] = useState(issue.upvotesCount || 0);
  const [upvoting, setUpvoting] = useState(false);

  const isKannada = i18n.language === 'kn';
  const categoryName = isKannada ? issue.category?.nameKn : issue.category?.nameEn;
  const talukName = isKannada ? issue.taluk?.nameKn : issue.taluk?.nameEn;
  const wardName = issue.ward ? (isKannada ? issue.ward?.nameKn : issue.ward?.nameEn) : null;

  // Status badge styling
  const statusColors = {
    SUBMITTED: 'bg-amber-100 text-amber-800 border-amber-200',
    VERIFIED: 'bg-blue-100 text-blue-800 border-blue-200',
    ASSIGNED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    IN_PROGRESS: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CLOSED: 'bg-slate-100 text-slate-800 border-slate-200',
    REOPENED: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (upvoting) return;
    setUpvoting(true);

    try {
      const res = await api.post(`/issues/${issue.id}/upvote`);
      if (res.data.success) {
        setIsUpvoted(res.data.upvoted);
        setUpvotesCount(res.data.upvotesCount);
        if (onUpvoteToggle) onUpvoteToggle(issue.id, res.data.upvoted, res.data.upvotesCount);
      }
    } catch (err) {
      console.error('Failed to upvote:', err);
    } finally {
      setUpvoting(false);
    }
  };

  // SLA Time Remaining calculation
  const getSlaRemainingText = () => {
    if (issue.status === 'RESOLVED' || issue.status === 'CLOSED') {
      return null;
    }
    const diffMs = new Date(issue.slaDeadline) - new Date();
    if (diffMs <= 0) {
      return { text: t('status.OVERDUE'), isOverdue: true };
    }
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return {
      text: `${diffHours} ${t('stats.hours')} ${t('detail.slaRemaining')}`,
      isOverdue: false,
    };
  };

  const slaInfo = getSlaRemainingText();
  const firstPhoto = issue.photoUrls?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80';

  return (
    <div className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col group ${
      issue.urgency === 'EMERGENCY'
        ? 'border-red-300 ring-2 ring-red-500/20 shadow-md shadow-red-500/10'
        : issue.urgency === 'HIGH'
        ? 'border-orange-200 hover:shadow-md'
        : 'border-slate-200/80 hover:shadow-md'
    }`}>
      {/* Card Header & Media with Emergency Phase Banner */}
      <div className="relative h-48 bg-slate-900 overflow-hidden">
        <img
          src={firstPhoto}
          alt={issue.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30"></div>

        {/* PROMINENT EMERGENCY PHASE BANNER DIRECTLY ON THE PICTURE */}
        <div className="absolute top-0 left-0 right-0 z-10">
          {issue.urgency === 'EMERGENCY' ? (
            <div className="bg-red-600/95 text-white text-[11px] font-black px-3 py-1.5 flex items-center justify-between shadow-md animate-pulse border-b border-red-400">
              <span className="flex items-center space-x-1.5 uppercase tracking-wide">
                <Flame className="w-4 h-4 text-yellow-300" />
                <span>🚨 {isKannada ? 'ಹಂತ 4: ತುರ್ತು ಅಪಾಯ' : 'PHASE 4: EMERGENCY HAZARD'}</span>
              </span>
              <span className="text-[10px] bg-white text-red-700 px-1.5 py-0.2 rounded font-extrabold font-mono">
                12h SLA
              </span>
            </div>
          ) : issue.urgency === 'HIGH' ? (
            <div className="bg-orange-600/90 text-white text-[10px] font-extrabold px-3 py-1 flex items-center justify-between shadow-xs">
              <span className="flex items-center space-x-1 uppercase tracking-wide">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-200" />
                <span>⚠️ {isKannada ? 'ಹಂತ 3: ಹೆಚ್ಚಿನ ಆದ್ಯತೆ' : 'PHASE 3: HIGH PRIORITY'}</span>
              </span>
              <span className="text-[9px] bg-black/40 text-orange-200 px-1 rounded font-bold font-mono">
                24h SLA
              </span>
            </div>
          ) : issue.urgency === 'MEDIUM' ? (
            <div className="bg-slate-900/70 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-3 py-0.5 flex items-center justify-between">
              <span>⚡ {isKannada ? 'ಹಂತ 2: ಮಧ್ಯಮ' : 'PHASE 2: MEDIUM'}</span>
              <span className="text-[9px] text-slate-300 font-mono">48h SLA</span>
            </div>
          ) : (
            <div className="bg-slate-900/60 backdrop-blur-xs text-emerald-300 text-[9px] font-semibold px-3 py-0.5 flex items-center justify-between">
              <span>ℹ️ {isKannada ? 'ಹಂತ 1: ಸಾಮಾನ್ಯ' : 'PHASE 1: ROUTINE'}</span>
              <span className="text-[9px] text-slate-300 font-mono">72h SLA</span>
            </div>
          )}
        </div>

        {/* Status Badge & YOLO11n AI Badge */}
        <div className="absolute top-9 left-3 flex flex-wrap gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-sm ${
              statusColors[issue.status] || 'bg-slate-100 text-slate-800'
            }`}
          >
            {t(`status.${issue.status}`) || issue.status}
          </span>
          {(issue.category?.code === 'POTHOLE' || issue.title?.toLowerCase().includes('pothole') || issue.title?.includes('ಗುಂಡಿ')) && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-black/75 text-amber-300 border border-amber-400/50 backdrop-blur-md shadow-sm flex items-center space-x-1">
              <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              <span>YOLO11n</span>
            </span>
          )}
        </div>

        {/* SLA / Overdue pill */}
        {slaInfo && (
          <div className="absolute top-9 right-3">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 backdrop-blur-md shadow-sm ${
                slaInfo.isOverdue
                  ? 'bg-red-500/95 text-white animate-pulse'
                  : 'bg-black/60 text-white border border-white/20'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{slaInfo.text}</span>
            </span>
          </div>
        )}

        {/* Tracking Number pill */}
        <div className="absolute bottom-2.5 left-3">
          <span className="text-[11px] font-mono font-semibold text-white/95 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
            {issue.trackingNumber}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Location */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {categoryName}
            </span>
            <div className="flex items-center space-x-1 text-slate-500 truncate max-w-[140px]">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{talukName}{wardName ? `, ${wardName}` : ''}</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/issue/${issue.id}`} className="block">
            <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-amber-600 transition-colors">
              {issue.title}
            </h3>
          </Link>

          {/* Description Snippet */}
          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Card Footer: Upvote, Comments, Details Link */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Upvote Button */}
            <button
              onClick={handleUpvote}
              disabled={upvoting}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                isUpvoted
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-white' : ''}`} />
              <span>{upvotesCount}</span>
            </button>

            {/* Comments Counter */}
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{issue.commentsCount || 0}</span>
            </div>
          </div>

          <Link
            to={`/issue/${issue.id}`}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
          >
            <span>{isKannada ? 'ವಿವರಗಳು' : 'Details'}</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
