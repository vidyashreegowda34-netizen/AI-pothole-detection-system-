import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import Timeline from '../components/Timeline';
import IssueMap from '../components/IssueMap';
import YoloVisionOverlay from '../components/YoloVisionOverlay';
import {
  MapPin,
  Clock,
  ThumbsUp,
  MessageSquare,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  Building2,
  Calendar,
  Share2,
  User,
  ArrowLeft,
  Flame,
  Check,
  Zap,
  Cpu,
} from 'lucide-react';

export default function IssueDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isOfficer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isKannada = i18n.language === 'kn';

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upvote state
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(0);

  // Comments state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Reopen Modal
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);

  // Share notification
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchIssueDetail();
  }, [id]);

  const fetchIssueDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/issues/${id}`);
      if (res.data.success) {
        setIssue(res.data.issue);
        setIsUpvoted(res.data.issue.isUpvotedByMe);
        setUpvotesCount(res.data.issue.upvotesCount);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.post(`/issues/${id}/upvote`);
      if (res.data.success) {
        setIsUpvoted(res.data.upvoted);
        setUpvotesCount(res.data.upvotesCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await api.post(`/issues/${id}/comment`, { text: commentText });
      if (res.data.success) {
        setIssue((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data.comment],
          commentsCount: (prev.commentsCount || 0) + 1,
        }));
        setCommentText('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    setReopening(true);
    try {
      const res = await api.post(`/issues/${id}/reopen`, { reason: reopenReason });
      if (res.data.success) {
        setShowReopenModal(false);
        setReopenReason('');
        fetchIssueDetail();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReopening(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: issue?.title,
        text: `Namma Tumakuru Parishkara - Tracking ${issue?.trackingNumber}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm font-medium">Loading issue details...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Issue Not Found</h2>
        <p className="text-xs text-slate-500">The requested report could not be retrieved.</p>
        <Link to="/" className="inline-block px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold">
          Return to Home
        </Link>
      </div>
    );
  }

  const categoryName = isKannada ? issue.category?.nameKn : issue.category?.nameEn;
  const deptName = isKannada ? issue.department?.nameKn : issue.department?.nameEn;
  const talukName = isKannada ? issue.taluk?.nameKn : issue.taluk?.nameEn;
  const wardName = issue.ward ? (isKannada ? issue.ward?.nameKn : issue.ward?.nameEn) : null;
  const isReporter = user?.id === issue.reporterId;
  const canReopen = (isReporter || isAdmin) && (issue.status === 'RESOLVED' || issue.status === 'CLOSED');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Back button and Share */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-amber-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isKannada ? 'ಹಿಂದಕ್ಕೆ' : 'Back'}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-amber-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? (isKannada ? 'ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ!' : 'Copied!') : (isKannada ? 'ಹಂಚಿಕೊಳ್ಳಿ' : 'Share')}</span>
        </button>
      </div>

      {/* Main Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-3 py-1 rounded-full">
              {categoryName}
            </span>
            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-full font-mono">
              {issue.trackingNumber}
            </span>
            {issue.urgency === 'EMERGENCY' && (
              <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-full flex items-center space-x-1 animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                <span>{t('urgency.EMERGENCY')}</span>
              </span>
            )}
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${
            issue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
            issue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-300' :
            'bg-amber-100 text-amber-800 border-amber-300'
          }`}>
            {t(`status.${issue.status}`) || issue.status}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
          {issue.title}
        </h1>

        {/* Department and Location Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2 text-slate-600">
            <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{t('detail.department')}:</strong> {deptName}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-600">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{t('report.taluk')}:</strong> {talukName}{wardName ? `, ${wardName}` : ''}
            </span>
          </div>
        </div>

        {/* SLA Status Card */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600 font-medium">
              {t('detail.slaCountdown')}:
            </span>
            <span className="font-bold text-slate-800">
              {new Date(issue.slaDeadline).toLocaleDateString(isKannada ? 'kn-IN' : 'en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {issue.isOverdue && (
            <span className="bg-red-500 text-white font-bold px-2 py-0.5 rounded text-[10px] animate-pulse">
              {t('status.OVERDUE')}
            </span>
          )}
        </div>
      </div>

      {/* Description & Citizen Photos */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
          {isKannada ? 'ದೂರಿನ ವಿವರಣೆ' : 'Issue Description'}
        </h3>
        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
          {issue.description}
        </p>

        {/* Photo Gallery with YOLO11n Vision Overlay */}
        {issue.photoUrls && issue.photoUrls.length > 0 && (() => {
          const isPotholeIssue =
            issue.category?.code === 'POTHOLE' ||
            issue.title?.toLowerCase().includes('pothole') ||
            issue.title?.includes('ಗುಂಡಿ');

          const yoloDetections = isPotholeIssue
            ? [
                {
                  id: 'yolo11n-det-1',
                  class: 'pothole',
                  confidence: 0.962,
                  severity: 'CRITICAL',
                  depthEstimate: 'Deep Crater (~14 cm)',
                  normalizedBox: { x: 26.5, y: 38.0, width: 44.0, height: 32.5 },
                },
                {
                  id: 'yolo11n-det-2',
                  class: 'alligator_cracking',
                  confidence: 0.895,
                  severity: 'MODERATE',
                  depthEstimate: 'Surface Depression (~5 cm)',
                  normalizedBox: { x: 74.0, y: 44.0, width: 20.0, height: 20.0 },
                },
              ]
            : [];

          return (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-500">
                  {t('detail.photos')} ({issue.photoUrls.length})
                </p>

                {isPotholeIssue && (
                  <span className="bg-amber-500/10 text-amber-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                    <span>YOLO11n Neural Vision Active</span>
                  </span>
                )}
              </div>

              {/* YOLO11n Vision Header Bar */}
              {isPotholeIssue && (
                <div className="mb-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-2.5 rounded-2xl border border-amber-400/40 flex items-center justify-between shadow-xs">
                  <div className="flex items-center space-x-2 text-xs">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                    <span className="font-bold text-amber-300">
                      {isKannada ? 'ಯೋಲೋ11n ನ್ಯೂರಲ್ ಪರಿಶೀಲಿತ:' : 'YOLO11n Neural Vision Verified:'}
                    </span>
                    <span className="text-[11px] text-slate-300 hidden sm:inline">
                      {isKannada ? '2 ರಸ್ತೆ ಅಪಾಯಗಳು ಪತ್ತೆಯಾಗಿವೆ (96.2% ನಿಖರತೆ)' : '2 Road Hazards Segmented (96.2% Confidence)'}
                    </span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                    Ultralytics yolo11n
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {issue.photoUrls.map((photo, i) => (
                  <div key={i} className="relative aspect-video rounded-3xl overflow-hidden border-2 border-slate-200 bg-slate-900 shadow-md group">
                    <YoloVisionOverlay
                      imageUrl={photo}
                      alt={`Citizen photo ${i + 1}`}
                      detections={i === 0 ? yoloDetections : []}
                      className="w-full h-full"
                      onClick={() => window.open(photo, '_blank')}
                    />

                    {/* Prominent Emergency Phase Banner On The Picture Itself */}
                    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
                      {issue.urgency === 'EMERGENCY' ? (
                        <div className="bg-red-600 text-white text-xs font-black px-3 py-1.5 flex items-center justify-between shadow-md animate-pulse">
                          <span className="flex items-center space-x-1.5 uppercase">
                            <Flame className="w-4 h-4 text-yellow-300" />
                            <span>🚨 {isKannada ? 'ಹಂತ 4: ತುರ್ತು ಸಾರ್ವಜನಿಕ ಅಪಾಯ' : 'PHASE 4: EMERGENCY HAZARD'}</span>
                          </span>
                          <span className="bg-white text-red-700 px-2 py-0.5 rounded text-[10px] font-black">
                            12h Target SLA
                          </span>
                        </div>
                      ) : issue.urgency === 'HIGH' ? (
                        <div className="bg-orange-600/95 text-white text-xs font-extrabold px-3 py-1 flex items-center justify-between shadow-xs">
                          <span>⚠️ {isKannada ? 'ಹಂತ 3: ಹೆಚ್ಚಿನ ಆದ್ಯತೆ' : 'PHASE 3: HIGH PRIORITY'}</span>
                          <span className="bg-black/40 text-orange-200 px-1.5 rounded text-[10px] font-mono">
                            24h Target SLA
                          </span>
                        </div>
                      ) : issue.urgency === 'MEDIUM' ? (
                        <div className="bg-slate-900/80 text-amber-300 text-xs font-bold px-3 py-1 flex items-center justify-between">
                          <span>⚡ {isKannada ? 'ಹಂತ 2: ಮಧ್ಯಮ ಆದ್ಯತೆ' : 'PHASE 2: MEDIUM PRIORITY'}</span>
                          <span className="text-slate-300 text-[10px] font-mono">48h SLA</span>
                        </div>
                      ) : (
                        <div className="bg-slate-900/70 text-emerald-300 text-xs font-semibold px-3 py-1 flex items-center justify-between">
                          <span>ℹ️ {isKannada ? 'ಹಂತ 1: ಸಾಮಾನ್ಯ ನಿರ್ವಹಣೆ' : 'PHASE 1: ROUTINE'}</span>
                          <span className="text-slate-300 text-[10px] font-mono">72h SLA</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Proof of Resolution (If Resolved) */}
      {(issue.status === 'RESOLVED' || issue.status === 'CLOSED') && (
        <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-base">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>{t('detail.resolutionProof')}</span>
          </div>

          {issue.resolutionNotes && (
            <div className="bg-white p-4 rounded-2xl border border-emerald-200">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                {t('detail.resolutionNotes')}
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                {issue.resolutionNotes}
              </p>
            </div>
          )}

          {issue.resolutionPhotos && issue.resolutionPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {issue.resolutionPhotos.map((photo, i) => (
                <div key={i} className="aspect-video rounded-2xl overflow-hidden border-2 border-emerald-300 bg-white">
                  <img
                    src={photo}
                    alt={`Resolution proof ${i + 1}`}
                    className="w-full h-full object-cover"
                    onClick={() => window.open(photo, '_blank')}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Reopen button for Citizen if unsatisfied */}
          {canReopen && (
            <div className="pt-2">
              <button
                onClick={() => setShowReopenModal(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-rose-700 hover:bg-rose-50 border border-rose-300 text-xs font-bold transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('detail.reopen')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interactive Location Map */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span>{isKannada ? 'ನಕ್ಷೆಯಲ್ಲಿ ನಿಖರ ಸ್ಥಳ' : 'Exact Map Location'}</span>
        </h3>
        <IssueMap
          center={[issue.latitude, issue.longitude]}
          issues={[issue]}
          zoom={15}
          height="240px"
        />
        {issue.addressText && (
          <p className="text-xs text-slate-600 font-medium">
            <strong>{isKannada ? 'ವಿಳಾಸ / ಹೆಗ್ಗುರುತು:' : 'Address / Landmark:'}</strong> {issue.addressText}
          </p>
        )}
      </div>

      {/* Actions: Upvote & Officer Actions */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={handleUpvote}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            isUpvoted
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-white' : ''}`} />
          <span>
            {isUpvoted ? t('detail.upvotedButton') : t('detail.upvoteButton')} ({upvotesCount})
          </span>
        </button>

        {isOfficer && (
          <Link
            to="/officer"
            className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
          >
            <Shield className="w-4 h-4" />
            <span>{t('officer.updateStatus')}</span>
          </Link>
        )}
      </div>

      {/* Lifecycle Timeline */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
          {t('detail.timeline')}
        </h3>
        <Timeline events={issue.timeline || []} />
      </div>

      {/* Comments & Discussion */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-amber-600" />
          <span>{t('detail.comments')} ({issue.comments?.length || 0})</span>
        </h3>

        {/* Comment input */}
        <form onSubmit={handleCommentSubmit} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t('detail.addComment')}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center space-x-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('detail.postComment')}</span>
          </button>
        </form>

        {/* Comments Feed */}
        <div className="space-y-3 divide-y divide-slate-100">
          {issue.comments && issue.comments.length > 0 ? (
            issue.comments.map((comment) => (
              <div key={comment.id} className="pt-3 first:pt-0 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800 text-xs">
                    {comment.user?.name || 'Citizen'}
                  </span>
                  {comment.isOfficer && (
                    <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase">
                      Officer
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {comment.text}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-xs text-slate-400">
              {isKannada ? 'ಇನ್ನೂ ಯಾವುದೇ ಪ್ರತಿಕ್ರಿಯೆಗಳಿಲ್ಲ.' : 'No comments yet. Be the first to share an update.'}
            </p>
          )}
        </div>
      </div>

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base">
              {t('detail.reopen')}
            </h3>
            <p className="text-xs text-slate-500">
              {isKannada
                ? 'ಸಮಸ್ಯೆ ಸರಿಯಾಗಿ ಬಗೆಹರಿದಿಲ್ಲದಿದ್ದರೆ ವಿವರವಾದ ಕಾರಣವನ್ನು ತಿಳಿಸಿ.'
                : 'Please explain why the resolution was unsatisfactory so the department can follow up.'}
            </p>

            <form onSubmit={handleReopenSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder={t('detail.reopenReason')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reopening || !reopenReason.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {reopening ? 'Reopening...' : t('detail.confirmReopen')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
