import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import OfflineBanner from './components/OfflineBanner';
import AiCivicChatbot from './components/AiCivicChatbot';

import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import IssueDetail from './pages/IssueDetail';
import MapView from './pages/MapView';
import MyReports from './pages/MyReports';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Transparency from './pages/Transparency';
import Login from './pages/Login';
import CctvMonitoring from './pages/CctvMonitoring';
import IotGrid from './pages/IotGrid';
import PredictiveRepair from './pages/PredictiveRepair';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      <OfflineBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/issue/:id" element={<IssueDetail />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/officer" element={<OfficerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cctv" element={<CctvMonitoring />} />
          <Route path="/iot" element={<IotGrid />} />
          <Route path="/predictive" element={<PredictiveRepair />} />
        </Routes>
      </main>

      <AiCivicChatbot />
      <BottomNav />
    </div>
  );
}
