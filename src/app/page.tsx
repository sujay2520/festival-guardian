'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import CameraRiskScreen from '@/components/CameraRiskScreen';
import SosButton from '@/components/SosButton';
import AlertPanel from '@/components/AlertPanel';
import VolunteerList from '@/components/VolunteerList';
import { useCamera } from '@/hooks/useCamera';
import { useRiskScore } from '@/hooks/useRiskScore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAlerts } from '@/hooks/useAlerts';
import { useMeshRelay } from '@/hooks/useMeshRelay';
import { AlertFactory } from '@/lib/alert-factory';
import { requestNotificationPermission } from '@/lib/delivery-bridge';
import { DemoScenario } from '@/types';

export default function HomePage() {
  const [demoScenario, setDemoScenario] = useState<DemoScenario>('off');

  const {
    videoRef,
    isActive: isCameraActive,
    error: cameraError,
    startCamera,
    stopCamera,
    toggleFacing,
  } = useCamera();

  const handleStartCamera = useCallback(() => {
    setDemoScenario('off');
    startCamera();
  }, [startCamera]);

  const handleSelectScenario = useCallback((scenario: DemoScenario) => {
    if (isCameraActive) {
      stopCamera();
    }
    setDemoScenario(scenario);
  }, [isCameraActive, stopCamera]);

  const {
    riskData,
    detections,
    isModelReady,
    isLoading: isModelLoading,
    initModel,
  } = useRiskScore(videoRef, isCameraActive, demoScenario);

  const { getCurrentPosition } = useGeolocation();
  const { alerts, addAlert, clearAlerts, dismissAlert } = useAlerts();
  const { isActive: isRelayActive, peers, peerCount } = useMeshRelay();

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

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
  }, [riskData.level === 'critical']);

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

  return (
    <div className="min-h-screen bg-guardian-bg">
      <Header isRelayActive={isRelayActive} peerCount={peerCount} />

      <main className="pt-16 pb-8 px-4 max-w-lg mx-auto space-y-6">
        {/* Camera + Risk Monitor */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CameraRiskScreen
            videoRef={videoRef}
            isActive={isCameraActive}
            demoScenario={demoScenario}
            onSelectScenario={handleSelectScenario}
            riskData={riskData}
            detections={detections}
            isModelReady={isModelReady}
            isModelLoading={isModelLoading}
            onStartCamera={handleStartCamera}
            onStopCamera={stopCamera}
            onToggleFacing={toggleFacing}
            onInitModel={initModel}
            cameraError={cameraError}
          />
        </motion.section>

        {/* Emergency Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <SosButton
            onSos={handleSos}
            onTheft={handleTheft}
            onVolunteerRequest={handleVolunteerRequest}
          />
        </motion.section>

        {/* Alerts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AlertPanel
            alerts={alerts}
            onDismiss={dismissAlert}
            onClear={clearAlerts}
          />
        </motion.section>

        {/* Mesh Network / Volunteers */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <VolunteerList peers={peers} isRelayActive={isRelayActive} />
        </motion.section>

        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-[10px] text-guardian-muted/40">
            Festival Guardian v0.1 — AI-Powered Crowd Safety
          </p>
          <p className="text-[10px] text-guardian-muted/30 mt-0.5">
            All processing happens on your device. No data leaves your phone.
          </p>
        </footer>
      </main>
    </div>
  );
}
