'use client';

import React, { useRef, useEffect } from 'react';
import { Camera, Square, Users, Video, RotateCcw, AlertTriangle } from 'lucide-react';
import type { BoundingBox, RiskData, DemoScenario } from '@/types';
import { audioEngine } from '@/lib/audio-engine';

interface CameraRiskScreenProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  videoMode?: 'camera' | 'sample' | 'none';
  currentSampleUrl?: string;
  demoScenario: DemoScenario;
  onSelectScenario: (scenario: DemoScenario) => void;
  riskData: RiskData;
  detections: BoundingBox[];
  isModelReady: boolean;
  isModelLoading: boolean;
  onStartCamera: () => void;
  onLoadSampleVideo?: (url?: string) => void;
  onStopCamera: () => void;
  onToggleFacing: () => void;
  onInitModel: () => void;
  cameraError: string | null;
}

export default function CameraRiskScreen({
  videoRef,
  isActive,
  videoMode = 'none',
  currentSampleUrl = '/concert-crowd.webm',
  demoScenario,
  onSelectScenario,
  riskData,
  detections,
  isModelReady,
  isModelLoading,
  onStartCamera,
  onLoadSampleVideo,
  onStopCamera,
  onToggleFacing,
  onInitModel,
  cameraError,
}: CameraRiskScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isSimulating = demoScenario !== 'off';
  const isRunning = isActive || isSimulating;

  // Tone and fill colors following Grok design tokens
  const tone =
    riskData.level === 'critical' || riskData.level === 'danger'
      ? 'text-crit'
      : riskData.level === 'warning' || riskData.level === 'caution'
      ? 'text-surge'
      : 'text-safe';

  const fill =
    riskData.level === 'critical' || riskData.level === 'danger'
      ? 'bg-crit'
      : riskData.level === 'warning' || riskData.level === 'caution'
      ? 'bg-surge'
      : 'bg-safe';

  // Canvas drawing loop for bounding boxes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (!isRunning || detections.length === 0) {
      ctx.restore();
      return;
    }

    let strokeColor = '#3d9a72'; // safe
    if (riskData.level === 'danger' || riskData.level === 'critical') {
      strokeColor = '#d45b4a'; // crit
    } else if (riskData.level === 'warning' || riskData.level === 'caution') {
      strokeColor = '#c4a35a'; // surge
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';

    const video = videoRef.current;
    const videoW = video?.videoWidth || 640;
    const videoH = video?.videoHeight || 480;
    const containerW = rect.width;
    const containerH = rect.height;

    const scale = Math.max(containerW / videoW, containerH / videoH);
    const renderedW = videoW * scale;
    const renderedH = videoH * scale;
    const offsetX = (containerW - renderedW) / 2;
    const offsetY = (containerH - renderedH) / 2;

    for (let i = 0; i < detections.length; i++) {
      const box = detections[i];
      let bx = 0;
      let by = 0;
      let bw = 0;
      let bh = 0;

      if (isSimulating) {
        bx = (box.x / 640) * containerW;
        by = (box.y / 480) * containerH;
        bw = (box.width / 640) * containerW;
        bh = (box.height / 480) * containerH;
      } else {
        bx = offsetX + box.x * scale;
        by = offsetY + box.y * scale;
        bw = box.width * scale;
        bh = box.height * scale;
      }

      ctx.strokeRect(bx, by, bw, bh);
    }

    ctx.restore();
  }, [detections, isRunning, isSimulating, riskData.level, videoRef]);

  const handleStop = () => {
    if (isActive) onStopCamera();
    onSelectScenario('off');
  };

  const getActionAdvice = () => {
    if (!isRunning) return 'Standby — initiate camera scan or select a scenario below.';
    if (riskData.level === 'critical' || riskData.level === 'danger') {
      return 'CRITICAL: Chokepoint compression exceeds 4.0 p/m². Divert ingress gates immediately.';
    }
    if (riskData.level === 'warning' || riskData.level === 'caution') {
      return 'SURGE: Elevated ingress velocity detected. Stage rapid-response staff at barricade.';
    }
    return 'NOMINAL: Crowd flow operating within safe capacity. Continuous scan active.';
  };

  return (
    <div className="w-full">
      {/* 4:3 Aspect Frame with 24px Radius */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-border bg-surface">
        {/* Video Feed */}
        <video
          ref={videoRef as React.LegacyRef<HTMLVideoElement>}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Synthetic Simulation Crowd Animation */}
        {isSimulating && (
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-b from-bg/40 to-bg/90">
            <div className="flex h-full w-full content-end justify-center gap-1.5 p-6">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-6 rounded-t-full bg-surface-3 opacity-60 animate-pulse"
                  style={{ animationDelay: `${(i * 0.1) % 1.5}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Standby Placeholder */}
        {!isRunning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-muted" aria-hidden>
              <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <p className="text-sm">Start a scan at this gate</p>
          </div>
        )}

        {/* Detection Bounding Boxes Canvas */}
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full" />

        {/* Bottom Overlay with 5xl Risk Score */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-bg/90 via-bg/40 to-transparent px-4 pb-4 pt-12 text-center">
          <p className={`font-display text-5xl font-semibold tabular-nums tracking-tight ${tone}`}>
            {isRunning ? riskData.score : '—'}
          </p>
          <p className={`mt-1 text-xs font-medium uppercase tracking-[0.16em] ${tone}`}>
            {isRunning ? `${riskData.level} risk` : 'Standby'}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${fill}`}
              style={{ width: `${isRunning ? riskData.score : 0}%` }}
            />
          </div>
        </div>

        {/* Model Loading Indicator */}
        {isModelLoading && (
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[10px] text-muted">
            <span className="size-1.5 rounded-full bg-surge animate-ping" />
            Loading AI Engine...
          </div>
        )}
      </div>

      {/* 3 Stat Cards: People, p/m², Flow */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-[16px] border border-border bg-surface px-3 py-3 text-center">
          <p className="font-display text-xl font-semibold tabular-nums text-fg">
            {isRunning ? riskData.personCount : '—'}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">People</p>
        </div>
        <div className="rounded-[16px] border border-border bg-surface px-3 py-3 text-center">
          <p className="font-display text-xl font-semibold tabular-nums text-fg">
            {isRunning ? riskData.density.toFixed(1) : '—'}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">p/m²</p>
        </div>
        <div className="rounded-[16px] border border-border bg-surface px-3 py-3 text-center">
          <p className="font-display text-xl font-semibold tabular-nums text-fg">
            {isRunning ? (riskData.flowRate >= 0 ? `+${riskData.flowRate.toFixed(1)}` : riskData.flowRate.toFixed(1)) : '—'}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">Flow</p>
        </div>
      </div>

      {/* Suggested Action Bar */}
      <p className="mt-3 text-xs leading-relaxed text-muted">{getActionAdvice()}</p>
      {cameraError && (
        <p className="mt-2 flex items-center gap-1 text-xs text-crit">
          <AlertTriangle size={13} /> {cameraError}
        </p>
      )}

      {/* Primary Control Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => onSelectScenario('surge')}
          className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-border bg-surface text-sm font-medium text-fg hover:bg-surface-2 transition-colors"
        >
          <Users className="size-4" /> Simulate
        </button>
        <button
          onClick={onStartCamera}
          className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-border bg-surface text-sm font-medium text-fg hover:bg-surface-2 transition-colors"
        >
          <Camera className="size-4" /> Live Camera
        </button>
        {onLoadSampleVideo && (
          <button
            onClick={() => {
              audioEngine.play('click');
              onLoadSampleVideo('/concert-crowd.webm');
            }}
            className={`flex h-11 items-center justify-center gap-2 rounded-[12px] text-sm font-semibold transition-all relative overflow-hidden active:scale-95 ${
              isActive && videoMode === 'sample' && currentSampleUrl === '/concert-crowd.webm'
                ? 'border-2 border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                : 'border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.15)]'
            }`}
          >
            <Video className="size-4 text-amber-400 animate-pulse" />
            <span className="tracking-wide">Demo Footage</span>
            <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-black uppercase tracking-wider">
              REAL AI
            </span>
          </button>
        )}
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-border bg-surface text-sm font-medium text-muted hover:text-fg disabled:opacity-40 transition-colors"
        >
          <Square className="size-3.5" /> Stop
        </button>
      </div>

      {/* Simulation Scenario Switcher Pills */}
      {isSimulating && (
        <div className="mt-3 flex gap-2">
          {(['safe', 'surge', 'critical'] as DemoScenario[]).map((s) => (
            <button
              key={s}
              onClick={() => onSelectScenario(s)}
              className={`h-10 flex-1 rounded-[12px] border text-xs font-medium uppercase tracking-wider transition-colors ${
                demoScenario === s
                  ? 'border-accent bg-surface-2 text-fg'
                  : 'border-border bg-surface text-muted hover:text-fg'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Video Sample Switcher Pills when in sample mode */}
      {isActive && videoMode === 'sample' && onLoadSampleVideo && (
        <div className="mt-3 flex gap-2">
          {[
            { label: 'Event', url: '/concert-crowd.webm' },
            { label: 'Video 1', url: '/event-video-1.webm' },
            { label: 'Video 2', url: '/event-video-2.webm' },
          ].map((vid) => (
            <button
              key={vid.url}
              onClick={() => onLoadSampleVideo(vid.url)}
              className={`h-9 flex-1 rounded-[10px] border text-xs font-medium transition-colors ${
                currentSampleUrl === vid.url
                  ? 'border-accent bg-surface-2 text-fg'
                  : 'border-border bg-surface text-muted hover:text-fg'
              }`}
            >
              {vid.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
