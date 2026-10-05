'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Activity,
  LayoutDashboard,
  Radio,
  ScanLine,
  Siren,
} from 'lucide-react';

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
import { audioEngine } from '@/lib/audio-engine';
import { DemoScenario } from '@/types';

type TabId = 'scanner' | 'dispatch' | 'relay' | 'sos' | 'ops';

const TABS: { id: TabId; label: string; icon: typeof ScanLine }[] = [
  { id: 'scanner', label: 'Scanner', icon: ScanLine },
  { id: 'dispatch', label: 'Dispatch', icon: Activity },
  { id: 'relay', label: 'Relay', icon: Radio },
  { id: 'sos', label: 'SOS', icon: Siren },
  { id: 'ops', label: 'Ops', icon: LayoutDashboard },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>('scanner');
  const [demoScenario, setDemoScenario] = useState<DemoScenario>('surge');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Sync tab with URL query parameter for presentations & deep linking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabId;
      if (tabParam && TABS.some((t) => t.id === tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

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

  const handleLoadSampleVideo = useCallback(
    (url: string = '/concert-crowd.webm') => {
      setDemoScenario('off');
      initModel();
      loadSampleVideo(url);
    },
    [loadSampleVideo, initModel]
  );

  const handleSelectScenario = useCallback(
    (scenario: DemoScenario) => {
      if (isCameraActive) {
        stopCamera();
      }
      setDemoScenario(scenario);
    },
    [isCameraActive, stopCamera]
  );

  const { getCurrentPosition } = useGeolocation();
  const { alerts, addAlert, clearAlerts, dismissAlert } = useAlerts();
  const { isActive: isRelayActive, peers, peerCount } = useMeshRelay();

  // Preload notification permissions and AI model
  useEffect(() => {
    requestNotificationPermission();
    const timer = setTimeout(() => {
      initModel();
    }, 1200);
    return () => clearTimeout(timer);
  }, [initModel]);

  // Critical risk auto-alert
  useEffect(() => {
    if (riskData.score >= 85 && isCameraActive) {
      const pos = getCurrentPosition();
      const alert = AlertFactory.crowdRisk(
        riskData.score,
        pos.lat,
        pos.lng,
        `Gate3-Node-${Math.random().toString(36).slice(-4)}`
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

  const handleBroadcastAdvisory = useCallback(
    (msg: string) => {
      const pos = getCurrentPosition();
      const alert = AlertFactory.crowdRisk(60, pos.lat, pos.lng, 'Central-Dispatch');
      alert.message = msg;
      addAlert(alert);
    },
    [getCurrentPosition, addAlert]
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-bg text-fg lg:max-w-5xl lg:flex-row font-sans">
      {/* Mobile Top Header */}
      <Header
        isRelayActive={isRelayActive}
        peerCount={peerCount}
        onOpenInfo={() => setIsInfoOpen(true)}
      />

      <OnboardingModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-border p-5 lg:flex bg-bg">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-[10px] border border-border bg-surface-2 font-display text-xs font-bold tracking-wide text-accent">
              FG
            </span>
            <div>
              <p className="font-display text-sm font-semibold leading-none">Festival Guardian</p>
              <p className="mt-1 text-[11px] text-muted">Predict. Respond. Relay.</p>
            </div>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-1.5">
            {TABS.map((t) => {
              const isOps = t.id === 'ops';
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    audioEngine.play('click');
                    setActiveTab(t.id);
                  }}
                  className={`flex h-11 items-center gap-3 rounded-[12px] px-3 text-sm font-medium transition-all duration-150 ${
                    isOps
                      ? isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.35)] font-semibold'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.15)] font-semibold'
                      : isActive
                      ? 'bg-surface-2 text-fg shadow-sm border border-border'
                      : 'text-muted hover:bg-surface hover:text-fg'
                  }`}
                >
                  <t.icon className={`size-4 ${isOps ? 'text-cyan-400' : ''}`} strokeWidth={1.75} />
                  <span>{t.label}</span>
                  {isOps && (
                    <span className="ml-auto rounded bg-cyan-500/30 border border-cyan-400/50 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 font-mono tracking-wider animate-pulse">
                      CCTV
                    </span>
                  )}
                  {t.id === 'dispatch' && alerts.length > 0 && (
                    <span className="ml-auto rounded-full bg-crit px-1.5 py-0.2 text-[10px] text-fg font-bold">
                      {alerts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <p className="text-xs leading-relaxed text-subtle pt-6 border-t border-border/50">
          Guardian node at a gate — not an attendee app. Relay is a local simulation.
        </p>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Desktop Venue Subheader */}
        <div className="hidden items-center justify-between border-b border-border px-6 py-4 lg:flex bg-bg">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">Gate 3 · live node</p>
            <p className="text-sm text-muted">Bengaluru venue · edge AI & zero-internet mesh</p>
          </div>
          <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium uppercase tracking-wide text-safe">
            {riskData.level}
          </span>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-20 lg:pt-6 lg:px-6 lg:pb-8">
          {activeTab === 'scanner' && (
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
          )}

          {activeTab === 'dispatch' && (
            <AlertPanel
              alerts={alerts}
              onDismiss={dismissAlert}
              onClear={clearAlerts}
            />
          )}

          {activeTab === 'relay' && (
            <VolunteerList peers={peers} isRelayActive={isRelayActive} />
          )}

          {activeTab === 'sos' && (
            <div className="flex min-h-[65vh] flex-col items-center justify-center">
              <SosButton
                onSos={handleSos}
                onTheft={handleTheft}
                onVolunteerRequest={handleVolunteerRequest}
                onFirstAid={handleFirstAid}
              />
            </div>
          )}

          {activeTab === 'ops' && (
            <OrganizerControlRoom
              alerts={alerts}
              peers={peers}
              onDismissAlert={dismissAlert}
              onClearAlerts={clearAlerts}
              onBroadcastAdvisory={handleBroadcastAdvisory}
              onSwitchToFieldNode={() => setActiveTab('scanner')}
            />
          )}
        </main>
      </div>

      {/* Fixed Bottom Navigation (Mobile Only) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-16 max-w-[480px] items-center justify-around border-t border-border bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden">
        {TABS.map((t) => {
          const isOps = t.id === 'ops';
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                audioEngine.play('click');
                setActiveTab(t.id);
              }}
              className={`flex min-w-11 flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                isOps
                  ? isActive
                    ? 'text-cyan-300 font-bold'
                    : 'text-cyan-400 font-semibold'
                  : isActive
                  ? 'text-fg'
                  : 'text-muted'
              }`}
            >
              <div className="relative">
                <t.icon
                  className={`size-5 ${
                    isOps ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]' : ''
                  }`}
                  strokeWidth={1.75}
                />
                {isOps && (
                  <span className="absolute -top-1 -right-3 rounded bg-cyan-500 px-1 py-0.2 text-[8px] font-black text-black uppercase tracking-wider animate-pulse">
                    CCTV
                  </span>
                )}
                {t.id === 'dispatch' && alerts.length > 0 && (
                  <span className="absolute -top-1 -right-2 rounded-full bg-crit px-1 text-[9px] text-fg font-bold">
                    {alerts.length}
                  </span>
                )}
              </div>
              <span className={isOps ? 'text-cyan-400 font-semibold' : ''}>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
