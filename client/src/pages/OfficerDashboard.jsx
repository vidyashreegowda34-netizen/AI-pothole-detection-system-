import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import GeoCameraModal from '../components/GeoCameraModal';
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  UserCheck,
  Filter,
  Flame,
  Camera,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function OfficerDashboard() {
  const { t, i18n } = useTranslation();
  const { user, isOfficer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isKannada = i18n.language === 'kn';

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'IN_PROGRESS' | 'OVERDUE' | 'RESOLVED'

  // Update Status Modal
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [officerNotes, setOfficerNotes] = useState('');
  const [proofPhotos, setProofPhotos] = useState([]);
  const [proofPreviews, setProofPreviews] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [isOfficerCameraOpen, setIsOfficerCameraOpen] = useState(false);

  const handleOfficerCameraCapture = ({ file, dataUrl }) => {
    setProofPhotos((prev) => [...prev, file].slice(0, 3));
    setProofPreviews((prev) => [...prev, dataUrl].slice(0, 3));
  };

  useEffect(() => {
    fetchOfficerIssues();
  }, [filter]);

  const fetchOfficerIssues = async () => {
    setLoading(true);
    try {
      const res = await api.get('/issues?assignedToMe=true');
      if (res.data.success) {
        setIssues(res.data.issues);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    setProofPhotos([...proofPhotos, ...files].slice(0, 3));
    const previews = [...proofPhotos, ...files].slice(0, 3).map((f) => URL.createObjectURL(f));
    setProofPreviews(previews);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      if (officerNotes) formData.append('notes', officerNotes);

      proofPhotos.forEach((photo) => {
        formData.append('resolutionPhotos', photo);
      });

      const res = await api.patch(`/issues/${selectedIssue.id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSelectedIssue(null);
        setOfficerNotes('');
        setProofPhotos([]);
        setProofPreviews([]);
        fetchOfficerIssues();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'IN_PROGRESS') return issue.status === 'IN_PROGRESS' || issue.status === 'ASSIGNED';
    if (filter === 'RESOLVED') return issue.status === 'RESOLVED' || issue.status === 'CLOSED';
    if (filter === 'OVERDUE') return issue.isOverdue;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Officer Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-3xl shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              {user?.department?.nameEn || 'Municipal Department'}
            </span>
          </div>
          <span className="bg-blue-800/80 px-2.5 py-0.5 rounded-full text-xs font-bold text-blue-100">
            {user?.name}
          </span>
        </div>
        <h1 className="text-2xl font-black">{t('officer.title')}</h1>
        <p className="text-xs text-blue-200/80">
          {isKannada
            ? 'ನಿಮ್ಮ ಇಲಾಖೆ ಮತ್ತು ತಾಲೂಕಿಗೆ ಸಂಬಂಧಿಸಿದ ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳ ಪರಿಹಾರ ಕಾರ್ಯಾಚರಣೆ'
            : 'Track, dispatch crews, and resolve assigned civic complaints with photographic proof'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto text-xs font-bold">
        {['ALL', 'IN_PROGRESS', 'OVERDUE', 'RESOLVED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'ALL' && t('officer.filterAll')}
            {f === 'IN_PROGRESS' && t('officer.filterPending')}
            {f === 'OVERDUE' && t('officer.filterOverdue')}
            {f === 'RESOLVED' && t('status.RESOLVED')}
          </button>
        ))}
      </div>

      {/* Issues Queue */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading queue...</div>
        ) : filteredIssues.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
            No issues match this queue filter.
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs hover:border-blue-300 transition-all"
            >
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    {issue.trackingNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {isKannada ? issue.category?.nameKn : issue.category?.nameEn}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {t(`status.${issue.status}`)}
                  </span>
                  {issue.isOverdue && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {t('status.OVERDUE')}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{issue.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{issue.addressText || issue.description}</p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>SLA: {new Date(issue.slaDeadline).toLocaleDateString()}</span>
                  </span>
                  <span>Upvotes: {issue.upvotesCount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  to={`/issue/${issue.id}`}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => {
                    setSelectedIssue(issue);
                    setNewStatus(issue.status === 'RESOLVED' ? 'CLOSED' : 'IN_PROGRESS');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  {t('officer.updateStatus')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Status Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{t('officer.updateStatus')}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedIssue.trackingNumber}</p>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('officer.newStatus')}</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="VERIFIED">{t('status.VERIFIED')}</option>
                  <option value="ASSIGNED">{t('status.ASSIGNED')}</option>
                  <option value="IN_PROGRESS">{t('status.IN_PROGRESS')}</option>
                  <option value="RESOLVED">{t('status.RESOLVED')}</option>
                  <option value="CLOSED">{t('status.CLOSED')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('officer.officerNotes')}</label>
                <textarea
                  rows={3}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder={isKannada ? "ಕಾಮಗಾರಿ ವಿವರಗಳು ಮತ್ತು ಅಧಿಕಾರಿ ಟಿಪ್ಪಣಿ..." : "Field remarks, crew deployed, or resolution details..."}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Photo Proof Upload with Geo-Tag Camera */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">{t('officer.uploadProof')}</label>
                  {proofPhotos.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setIsOfficerCameraOpen(true)}
                      className="flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isKannada ? 'ಜಿಯೋ ಕ್ಯಾಮೆರಾ' : 'Geo Camera'}</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  {proofPreviews.map((p, i) => (
                    <div key={i} className="relative w-20 h-16 rounded-xl overflow-hidden border-2 border-emerald-500">
                      <img src={p} alt="Proof" className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 bg-black/70 text-emerald-300 text-[8px] font-bold px-1 rounded">
                        Geo-Tagged
                      </div>
                    </div>
                  ))}
                  {proofPhotos.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setIsOfficerCameraOpen(true)}
                      className="w-20 h-16 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4 text-blue-500 mb-0.5" />
                      <span className="text-[10px] font-bold text-blue-700">Geo Photo</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIssue(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-50"
                >
                  {updating ? 'Saving...' : t('officer.saveUpdate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Officer Geo-Tagged Proof Camera Modal */}
      <GeoCameraModal
        isOpen={isOfficerCameraOpen}
        onClose={() => setIsOfficerCameraOpen(false)}
        onCapture={handleOfficerCameraCapture}
        defaultLocationName={selectedIssue?.addressText || 'Tumkur Field Inspection'}
      />
    </div>
  );
}
