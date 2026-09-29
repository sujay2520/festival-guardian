'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CameraOff,
  RotateCcw,
  Loader2,
  Activity,
  Sparkles,
  AlertOctagon,
  Users,
} from 'lucide-react';
import { BoundingBox, RiskData, DemoScenario } from '@/types';
import RiskMeter from './RiskMeter';

interface CameraRiskScreenProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  demoScenario: DemoScenario;
  onSelectScenario: (scenario: DemoScenario) => void;
  riskData: RiskData;
  detections: BoundingBox[];
  isModelReady: boolean;
  isModelLoading: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onToggleFacing: () => void;
  onInitModel: () => void;
  cameraError: string | null;
}

export default function CameraRiskScreen({
  videoRef,
  isActive,
  demoScenario,
  onSelectScenario,
  riskData,
  detections,
  isModelReady,
  isModelLoading,
  onStartCamera,
  onStopCamera,
  onToggleFacing,
  onInitModel,
  cameraError,
}: CameraRiskScreenProps) {
  const isSimulating = demoScenario !== 'off';

  useEffect(() => {
    if (isActive && !isModelReady && !isModelLoading) {
      onInitModel();
    }
  }, [isActive, isModelReady, isModelLoading, onInitModel]);

  return (
    <div className="relative w-full aspect-[3/4] max-h-[60vh] bg-guardian-card rounded-2xl overflow-hidden border border-guardian-border shadow-2xl">
      {/* Video element for real camera */}
      <video
        ref={videoRef as React.LegacyRef<HTMLVideoElement>}
        className={`absolute inset-0 w-full h-full object-cover ${
          isActive && !isSimulating ? 'block' : 'hidden'
        }`}
        playsInline
        muted
        autoPlay
      />

      {/* Simulated festival crowd backdrop when in Demo Mode */}
      {isSimulating && (
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-black flex items-center justify-center overflow-hidden">
          {/* Subtle radar / density grid */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Simulated crowd silhouette points */}
          <div className="absolute inset-0 flex flex-wrap gap-4 p-8 justify-around items-center opacity-30 pointer-events-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -6, 0],
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2 + (i % 3),
                  repeat: Infinity,
                  delay: (i * 0.15) % 2,
                }}
                className="w-8 h-16 rounded-full bg-slate-700/60 blur-[1px]"
              />
            ))}
          </div>

          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-guardian-accent/20 border border-guardian-accent/40 rounded-full px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 text-guardian-accent animate-spin-slow" />
            <span className="text-[11px] font-semibold text-guardian-accent tracking-wide uppercase">
              Demo Simulation: {demoScenario}
            </span>
          </div>
        </div>
      )}

      {/* Detection bounding boxes (real camera or simulation) */}
      {(isActive || isSimulating) && detections.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {detections.map((box, i) => {
            const video = videoRef.current;
            const videoW = video?.videoWidth || 640;
            const videoH = video?.videoHeight || 480;
            const scaleX = isSimulating ? 1 : (video?.clientWidth || 640) / videoW;
            const scaleY = isSimulating ? 1 : (video?.clientHeight || 480) / videoH;

            // In simulation, box coordinates are relative % or scaled
            const left = isSimulating ? `${(box.x / 640) * 100}%` : `${box.x * scaleX}px`;
            const top = isSimulating ? `${(box.y / 480) * 100}%` : `${box.y * scaleY}px`;
            const width = isSimulating ? `${(box.width / 640) * 100}%` : `${box.width * scaleX}px`;
            const height = isSimulating ? `${(box.height / 480) * 100}%` : `${box.height * scaleY}px`;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`detection-box ${
                  riskData.level === 'danger' || riskData.level === 'critical'
                    ? 'danger'
                    : riskData.level === 'warning'
                      ? 'warning'
                      : ''
                }`}
                style={{ left, top, width, height }}
              >
                <span className="absolute -top-5 left-0 text-[9px] font-mono bg-black/80 px-1 py-0.5 rounded text-white tracking-tight">
                  person {Math.round(box.confidence * 100)}%
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Camera overlay gradient */}
      <div className="camera-overlay absolute inset-0 pointer-events-none" />

      {/* Risk meter overlay (top center) */}
      {(isActive || isSimulating) && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
          <RiskMeter riskData={riskData} size={160} />
        </div>
      )}

      {/* Controls & Scenario Switchers */}
      <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-2 z-20 px-3">
        {/* Scenario Switcher Buttons when Simulating */}
        {isSimulating && (
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => onSelectScenario('safe')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                demoScenario === 'safe'
                  ? 'bg-green-500 text-black font-bold shadow-md shadow-green-500/20'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              🟢 Safe (18)
            </button>
            <button
              onClick={() => onSelectScenario('surge')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                demoScenario === 'surge'
                  ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              🟡 Surge (65)
            </button>
            <button
              onClick={() => onSelectScenario('critical')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                demoScenario === 'critical'
                  ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/30'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              🔴 Stampede (92)
            </button>
            <button
              onClick={() => onSelectScenario('off')}
              className="px-2 py-1 rounded-lg text-xs text-zinc-400 hover:text-white"
              title="Exit Simulation"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-2">
          {!isActive && !isSimulating ? (
            <>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onStartCamera}
                className="flex items-center gap-2 bg-guardian-accent hover:bg-guardian-accent/80 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Camera className="w-4 h-4" />
                Start Camera
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectScenario('surge')}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-black px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/20"
              >
                <Activity className="w-4 h-4 text-black" />
                Auto Demo Crowd
              </motion.button>
            </>
          ) : isActive ? (
            <>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onToggleFacing}
                className="glass p-2.5 rounded-xl"
                title="Switch Camera"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onStopCamera}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-500/30"
              >
                <CameraOff className="w-4 h-4" />
                Stop Camera
              </motion.button>
            </>
          ) : null}
        </div>
      </div>

      {/* Loading state for TF.js */}
      <AnimatePresence>
        {isActive && isModelLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-30"
          >
            <Loader2 className="w-8 h-8 text-guardian-accent animate-spin" />
            <p className="text-sm font-medium text-white mt-2">
              Loading On-Device AI Model...
            </p>
            <p className="text-xs text-guardian-muted mt-1">
              TensorFlow.js WebGL GPU Acceleration
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {cameraError && !isSimulating && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-guardian-card/95 z-30 p-6 text-center">
          <CameraOff className="w-12 h-12 text-guardian-muted mb-3" />
          <p className="text-sm text-guardian-muted mb-4">
            {cameraError}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onStartCamera}
              className="text-white text-xs bg-guardian-accent px-4 py-2 rounded-lg font-medium"
            >
              Retry Camera
            </button>
            <button
              onClick={() => onSelectScenario('surge')}
              className="text-black text-xs bg-amber-400 px-4 py-2 rounded-lg font-bold"
            >
              Use Demo Simulation
            </button>
          </div>
        </div>
      )}

      {/* Inactive placeholder */}
      {!isActive && !isSimulating && !cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-guardian-border/30 flex items-center justify-center mb-3">
            <Users className="w-8 h-8 text-guardian-accent/70" />
          </div>
          <p className="text-sm font-semibold text-white">
            AI Crowd Safety Engine
          </p>
          <p className="text-xs text-guardian-muted mt-1 max-w-xs">
            Start phone camera to detect live density, or tap Auto Demo to simulate crowd stampede risks.
          </p>
        </div>
      )}
    </div>
  );
}
