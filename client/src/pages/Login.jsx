import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Phone,
  KeyRound,
  ShieldCheck,
  Building2,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const isKannada = i18n.language === 'kn';

  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' | 'officer'

  // Citizen State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Officer State
  const [officerId, setOfficerId] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [officerLoading, setOfficerLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setOtpLoading(true);

    try {
      const res = await api.post('/auth/send-otp', { phoneNumber });
      if (res.data.success) {
        setOtpSent(true);
        setOtp('1234'); // Pre-fill demo OTP
        setSuccessMsg(t('auth.demoHint'));
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setVerifyLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        phoneNumber,
        otp,
        name: userName,
      });

      if (res.data.success) {
        localStorage.removeItem('tumakuru_guest');
        loginWithToken(res.data.token, res.data.user);
        navigate(redirectPath === '/login' ? '/' : redirectPath);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Officer Login
  const handleOfficerLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setOfficerLoading(true);

    try {
      const res = await api.post('/auth/officer-login', {
        identifier: officerId,
        password: officerPassword,
      });

      if (res.data.success) {
        localStorage.removeItem('tumakuru_guest');
        loginWithToken(res.data.token, res.data.user);
        if (res.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/officer');
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid officer credentials');
    } finally {
      setOfficerLoading(false);
    }
  };

  // Quick Demo Login helper
  const quickDemoLogin = async (identifier, password, role) => {
    setErrorMsg('');
    try {
      if (role === 'CITIZEN') {
        const res = await api.post('/auth/verify-otp', {
          phoneNumber: identifier,
          otp: '1234',
        });
        if (res.data.success) {
          localStorage.removeItem('tumakuru_guest');
          loginWithToken(res.data.token, res.data.user);
          navigate(redirectPath === '/login' ? '/' : redirectPath);
        }
      } else {
        const res = await api.post('/auth/officer-login', { identifier, password });
        if (res.data.success) {
          localStorage.removeItem('tumakuru_guest');
          loginWithToken(res.data.token, res.data.user);
          navigate(role === 'ADMIN' ? '/admin' : '/officer');
        }
      }
    } catch (err) {
      setErrorMsg('Demo login failed');
    }
  };

  const handleContinueAsGuest = () => {
    localStorage.setItem('tumakuru_guest', 'true');
    navigate(redirectPath === '/login' ? '/' : redirectPath);
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6 pb-20">
      {/* Brand card */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-tr from-amber-600 to-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {t('appName')}
        </h1>
        <p className="text-xs text-slate-500">
          {t('appSubtitle')}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
        <button
          onClick={() => { setActiveTab('citizen'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeTab === 'citizen' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('auth.citizenTab')}
        </button>
        <button
          onClick={() => { setActiveTab('officer'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeTab === 'officer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('auth.officerTab')}
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Citizen Login Form */}
      {activeTab === 'citizen' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('auth.phoneLabel')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('auth.phonePlaceholder')}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('auth.nameLabel')}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading || phoneNumber.length < 10}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {otpLoading ? 'Sending...' : t('auth.sendOtp')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('auth.otpLabel')}
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="1234"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <p className="text-[11px] text-slate-500 mt-1 text-center font-medium">
                  {t('auth.demoHint')}
                </p>
              </div>

              <button
                type="submit"
                disabled={verifyLoading || otp.length < 4}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {verifyLoading ? 'Verifying...' : t('auth.verifyOtp')}
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-xs font-bold text-amber-700 hover:underline"
              >
                Change mobile number
              </button>
            </form>
          )}
        </div>
      )}

      {/* Officer / Admin Form */}
      {activeTab === 'officer' && (
        <form onSubmit={handleOfficerLogin} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('auth.officerIdentifier')}
            </label>
            <input
              type="text"
              required
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              placeholder="e.g. 9880000003 or officer_pwd"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('auth.passwordLabel')}
            </label>
            <input
              type="password"
              required
              value={officerPassword}
              onChange={(e) => setOfficerPassword(e.target.value)}
              placeholder="tumkur123"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={officerLoading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {officerLoading ? 'Authenticating...' : t('auth.officerLoginBtn')}
          </button>
        </form>
      )}

      {/* One-Click Quick Demo Accounts Bar */}
      <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2.5">
        <p className="text-xs font-bold text-amber-950">
          {t('auth.demoAccounts')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => quickDemoLogin('9880000005', '1234', 'CITIZEN')}
            className="bg-white hover:bg-amber-100/60 border border-amber-200 p-2 rounded-xl text-left font-semibold text-slate-800"
          >
            👤 Citizen (Ramesh Gowda)
          </button>

          <button
            type="button"
            onClick={() => quickDemoLogin('9880000003', 'tumkur123', 'OFFICER')}
            className="bg-white hover:bg-blue-50 border border-blue-200 p-2 rounded-xl text-left font-semibold text-blue-900"
          >
            🚧 PWD Officer (Anand Kumar)
          </button>

          <button
            type="button"
            onClick={() => quickDemoLogin('9880000002', 'tumkur123', 'OFFICER')}
            className="bg-white hover:bg-blue-50 border border-blue-200 p-2 rounded-xl text-left font-semibold text-blue-900"
          >
            🧹 TCC Officer (Suresh Patil)
          </button>

          <button
            type="button"
            onClick={() => quickDemoLogin('9880000001', 'admin123', 'ADMIN')}
            className="bg-white hover:bg-purple-50 border border-purple-200 p-2 rounded-xl text-left font-semibold text-purple-900"
          >
            🏛️ District Admin (Collector)
          </button>
        </div>
      </div>

      {/* Continue as Guest Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleContinueAsGuest}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-extrabold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center space-x-2 active:scale-95"
        >
          <span>{isKannada ? '👀 ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಯಿರಿ (Explore as Guest)' : '👀 Continue as Guest / Explore Public Feed'}</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
