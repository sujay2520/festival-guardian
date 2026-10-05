'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ShieldAlert, Radio, AlertTriangle, Shield, LayoutDashboard, Video } from 'lucide-react';

import Header from '@/components/Header';
import CameraRiskScreen from '@/components/CameraRiskScreen';
import SosButton from '@/components/SosButton';
import AlertPanel from '@/components/AlertPanel';
import VolunteerList from '@/components/VolunteerList';
import OnboardingModal from '@/components/OnboardingModal';
import OrganizerControlRoom from '@/components/OrganizerControlRoom';

import { useCamera } from '@/hooks/useCamera';
import { useRiskScore } from '@/hooks/useRiskScore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAlerts } from '@/hooks/useAlerts';
import { useMeshRelay } from '@/hooks/useMeshRelay';
import { AlertFactory } from '@/lib/alert-factory';
import { requestNotificationPermission } from '@/lib/delivery-bridge';
import { DemoScenario } from '@/types';

type TabId = 'scanner' | 'alerts' | 'mesh' | 'sos';
type UserRole = 'people' | 'organizer';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>('scanner');
  const [userRole, setUserRole] = useState<UserRole>('people');
  const [demoScenario, setDemoScenario] = useState<DemoScenario>('surge');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const {
    videoRef,
    isActive: isCameraActive,
    videoMode,
    currentSampleUrl,
    error: cameraError,
    startCamera,
    loadSampleVideo,
    stopCamera,
    toggleFacing,
  } = useCamera();

  const {
    riskData,
    detections,
    isModelReady,
    isLoading: isModelLoading,
    initModel,
  } = useRiskScore(videoRef, isCameraActive, demoScenario);

  const handleStartCamera = useCallback(() => {
    setDemoScenario('off');
    initModel();
    startCamera();
  }, [startCamera, initModel]);

  const handleLoadSampleVideo = useCallback((url: string = '/concert-crowd.webm') => {
    setDemoScenario('off');
    initModel();
    loadSampleVideo(url);
  }, [loadSampleVideo, initModel]);

  const handleSelectScenario = useCallback((scenario: DemoScenario) => {
    if (isCameraActive) {
      stopCamera();
    }
    setDemoScenario(scenario);
  }, [isCameraActive, stopCamera]);

  const { getCurrentPosition } = useGeolocation();
  const { alerts, addAlert, clearAlerts, dismissAlert } = useAlerts();
  const { isActive: isRelayActive, peers, peerCount } = useMeshRelay();

  // Request notification permission and preload AI model after initial render settles
  useEffect(() => {
    requestNotificationPermission();
    const timer = setTimeout(() => {
      initModel();
    }, 1200);
    return () => clearTimeout(timer);
  }, [initModel]);

  // Auto-send crowd risk alert when score goes critical
  useEffect(() => {
    if (riskData.score >= 85 && isCameraActive) {
      const pos = getCurrentPosition();
      const alert = AlertFactory.crowdRisk(
        riskData.score,
        pos.lat,
        pos.lng,
        `Guardian-${Math.random().toString(36).slice(-4)}`
      );
      addAlert(alert);
    }
  }, [riskData.level, riskData.score, isCameraActive, getCurrentPosition, addAlert]);

  const handleSos = useCallback(() => {
    const pos = getCurrentPosition();
    const alert = AlertFactory.sos(pos.lat, pos.lng);
    addAlert(alert);
  }, [getCurrentPosition, addAlert]);

  const handleTheft = useCallback(() => {
    const pos = getCurrentPosition();
    const alert = AlertFactory.theft(pos.lat, pos.lng);
    addAlert(alert);
  }, [getCurrentPosition, addAlert]);

  const handleVolunteerRequest = useCallback(() => {
    const pos = getCurrentPosition();
    const alert = AlertFactory.volunteerRequest(pos.lat, pos.lng);
    addAlert(alert);
  }, [getCurrentPosition, addAlert]);

  const handleFirstAid = useCallback(() => {
    const pos = getCurrentPosition();
    const alert = AlertFactory.volunteerRequest(pos.lat, pos.lng);
    alert.message = 'Medical First Aid requested urgently!';
    addAlert(alert);
  }, [getCurrentPosition, addAlert]);

  const handleBroadcastAdvisory = useCallback((msg: string) => {
    const pos = getCurrentPosition();
    const alert = AlertFactory.crowdRisk(60, pos.lat, pos.lng, 'Central-Dispatch');
    alert.message = msg;
    addAlert(alert);
  }, [getCurrentPosition, addAlert]);

  const renderTabContent = () => {
    // If Organizer role is active, show the master Organizer Command Center
    if (userRole === 'organizer') {
      return (
        <motion.div
          key="organizer-control-room"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="w-full"
        >
          <OrganizerControlRoom
            alerts={alerts}
            peers={peers}
            onDismissAlert={dismissAlert}
            onClearAlerts={clearAlerts}
            onBroadcastAdvisory={handleBroadcastAdvisory}
            onSwitchToFieldNode={() => setUserRole('people')}
          />
        </motion.div>
      );
    }

    // Otherwise, show Field Volunteer Node tabs
    switch (activeTab) {
      case 'scanner':
        return (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <CameraRiskScreen
              videoRef={videoRef}
              isActive={isCameraActive}
              videoMode={videoMode}
              currentSampleUrl={currentSampleUrl}
              demoScenario={demoScenario}
              onSelectScenario={handleSelectScenario}
              riskData={riskData}
              detections={detections}
              isModelReady={isModelReady}
              isModelLoading={isModelLoading}
              onStartCamera={handleStartCamera}
              onLoadSampleVideo={handleLoadSampleVideo}
              onStopCamera={stopCamera}
              onToggleFacing={toggleFacing}
              onInitModel={initModel}
              cameraError={cameraError}
            />
          </motion.div>
        );
      case 'alerts':
        return (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full space-y-3"
          >
            {/* Quick Banner Linking to Organizer Control Room */}
            <div className="bg-gradient-to-r from-guardian-cyan/15 to-blue-600/10 border border-guardian-cyan/30 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={15} className="text-guardian-cyan shrink-0" />
                <span className="text-zinc-200">Looking for multi-zone venue map & CCTV streams?</span>
              </div>
              <button
                onClick={() => setUserRole('organizer')}
                className="px-2.5 py-1 rounded-lg bg-guardian-cyan text-black font-bold whitespace-nowrap hover:bg-[#38bdf8] transition-colors"
              >
                OPEN DISPATCH
              </button>
            </div>

            <AlertPanel
              alerts={alerts}
              onDismiss={dismissAlert}
              onClear={clearAlerts}
            />
          </motion.div>
        );
      case 'mesh':
        return (
          <motion.div
            key="mesh"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <VolunteerList peers={peers} isRelayActive={isRelayActive} />
          </motion.div>
        );
      case 'sos':
        return (
          <motion.div
            key="sos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full h-full flex flex-col items-center justify-center pt-10"
          >
            <SosButton
              onSos={handleSos}
              onTheft={handleTheft}
              onVolunteerRequest={handleVolunteerRequest}
              onFirstAid={handleFirstAid}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-guardian-bg text-slate-100 flex flex-col font-sans selection:bg-guardian-accent selection:text-black relative">
      <Header
        isRelayActive={isRelayActive}
        peerCount={peerCount}
        currentRole={userRole}
        onRoleChange={setUserRole}
        onOpenInfo={() => setIsInfoOpen(true)}
      />
      <OnboardingModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      <main className="flex-1 pt-16 pb-28 px-3 max-w-lg mx-auto w-full relative">
        {/* Tactical Operational Role Switcher Banner */}
        <div className="w-full flex items-center justify-between mb-3 bg-black/50 border border-white/10 rounded-xl p-1.5 font-mono text-[11px] shadow-md">
          <div className="flex items-center gap-1.5 pl-1.5 text-guardian-muted">
            <span className={`w-2 h-2 rounded-full ${userRole === 'people' ? 'bg-[#FF6600]' : 'bg-guardian-cyan'} animate-pulse`} />
            <span className="text-[10px] tracking-wider uppercase hidden xs:inline">ROLE:</span>
          </div>

          <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setUserRole('people')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                userRole === 'people'
                  ? 'bg-[#FF6600] text-black shadow-[0_0_8px_rgba(255,102,0,0.3)]'
                  : 'text-guardian-muted hover:text-white'
              }`}
            >
              <Shield size={12} />
              <span>PEOPLE</span>
            </button>
            <button
              onClick={() => setUserRole('organizer')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                userRole === 'organizer'
                  ? 'bg-guardian-cyan text-black shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'text-guardian-muted hover:text-white'
              }`}
            >
              <LayoutDashboard size={12} />
              <span>ORGANIZER</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Dock */}
      <div className="fixed bottom-3 left-3 right-3 z-50 max-w-lg mx-auto">
        <div className="rounded-2xl p-1.5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] bg-guardian-surface/80 backdrop-blur-md flex items-center justify-between gap-1">
          {/* Scanner Tab */}
          <button
            onClick={() => {
              setUserRole('people');
              setActiveTab('scanner');
            }}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all ${
              userRole === 'people' && activeTab === 'scanner'
                ? 'bg-gradient-to-b from-[#FF6600]/20 to-red-600/20 border border-[#FF6600]/60 shadow-[0_0_15px_rgba(255,102,0,0.3)]'
                : 'border border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Camera className={`w-5 h-5 ${userRole === 'people' && activeTab === 'scanner' ? 'text-[#FF6600] drop-shadow-[0_0_8px_rgba(255,102,0,0.8)]' : ''}`} />
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase">Scanner</span>
          </button>

          {/* Dispatch/Alerts Tab */}
          <button
            onClick={() => {
              setActiveTab('alerts');
            }}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all ${
              activeTab === 'alerts' && userRole === 'people'
                ? 'bg-gradient-to-b from-[#FF6600]/20 to-red-600/20 border border-[#FF6600]/60 shadow-[0_0_15px_rgba(255,102,0,0.3)]'
                : 'border border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="relative">
              <ShieldAlert className={`w-5 h-5 ${activeTab === 'alerts' && userRole === 'people' ? 'text-[#FF6600] drop-shadow-[0_0_8px_rgba(255,102,0,0.8)]' : ''}`} />
              {alerts.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-guardian-red text-white text-[10px] font-bold px-1.5 rounded-full border border-black min-w-[18px] text-center">
                  {alerts.length}
                </span>
              )}
            </div>
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase">Dispatch</span>
          </button>

          {/* Mesh P2P Tab */}
          <button
            onClick={() => {
              setUserRole('people');
              setActiveTab('mesh');
            }}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all ${
              userRole === 'people' && activeTab === 'mesh'
                ? 'bg-gradient-to-b from-[#FF6600]/20 to-red-600/20 border border-[#FF6600]/60 shadow-[0_0_15px_rgba(255,102,0,0.3)]'
                : 'border border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Radio className={`w-5 h-5 ${userRole === 'people' && activeTab === 'mesh' ? 'text-[#FF6600] drop-shadow-[0_0_8px_rgba(255,102,0,0.8)]' : ''}`} />
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase">Relay</span>
          </button>

          {/* SOS Tab */}
          <button
            onClick={() => {
              setUserRole('people');
              setActiveTab('sos');
            }}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all ${
              userRole === 'people' && activeTab === 'sos'
                ? 'bg-gradient-to-b from-[#FF6600]/20 to-red-600/20 border border-[#FF6600]/60 shadow-[0_0_15px_rgba(255,102,0,0.3)]'
                : 'border border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <AlertTriangle className={`w-5 h-5 ${userRole === 'people' && activeTab === 'sos' ? 'text-[#FF6600] drop-shadow-[0_0_8px_rgba(255,102,0,0.8)]' : ''}`} />
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase">SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
