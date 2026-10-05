'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RotateCcw, Loader2, Activity, Sparkles, Video } from 'lucide-react';
import type { BoundingBox, RiskData, DemoScenario } from '@/types';
import RiskMeter from './RiskMeter';

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
  cameraError
}: CameraRiskScreenProps) {
  
  const isSimulating = demoScenario !== 'off';
  const showContent = isActive || isSimulating;

  const { color, gaugeColor, label } = useMemo(() => {
    switch (riskData.level) {
      case 'safe': return { color: '#22C55E', gaugeColor: '#00F59B', label: 'SAFE RISK' };
      case 'caution': return { color: '#84CC16', gaugeColor: '#84CC16', label: 'CAUTION RISK' };
      case 'warning': return { color: '#F59E0B', gaugeColor: '#FFB020', label: 'WARNING RISK' };
      case 'danger': return { color: '#F97316', gaugeColor: '#FF6600', label: 'DANGER RISK' };
      case 'critical': return { color: '#EF4444', gaugeColor: '#FF003C', label: 'CRITICAL RISK' };
      default: return { color: '#7D8590', gaugeColor: '#7D8590', label: 'UNKNOWN' };
    }
  }, [riskData.level]);

  // SVG Gauge calculations
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskData.score / 100) * circumference;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    if (!showContent || detections.length === 0) {
      ctx.restore();
      return;
    }

    let strokeColor = '#22D3EE'; // cyan
    if (riskData.level === 'danger' || riskData.level === 'critical') {
      strokeColor = '#EF4444'; // red
    } else if (riskData.level === 'warning') {
      strokeColor = '#F59E0B'; // amber
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    const video = videoRef.current;
    const videoW = video?.videoWidth || 640;
    const videoH = video?.videoHeight || 480;
    const containerW = rect.width;
    const containerH = rect.height;

    // Uniform object-cover scaling with centering
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
  }, [detections, showContent, isSimulating, riskData.level, videoRef]);

  return (
    <div className="relative w-full h-[68vh] min-h-[460px] max-h-[640px] rounded-2xl overflow-hidden bg-black border border-guardian-border shadow-2xl flex flex-col justify-between tactical-grid">
      
      {/* Video Element */}
      <video
        ref={videoRef as React.LegacyRef<HTMLVideoElement>}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Simulating Background */}
      {isSimulating && (
        <div className="absolute inset-0 bg-gradient-to-b from-guardian-bg via-black to-guardian-bg overflow-hidden flex items-end justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] z-10" />
          <div className="flex flex-wrap justify-center gap-2 p-8 pb-12 w-full h-full content-end z-0">
            {Array.from({ length: 28 }).map((_, i) => (
              <div 
                key={i} 
                className="w-9 h-20 rounded-t-full bg-gradient-to-b from-slate-600 to-slate-900 opacity-40 transform origin-bottom animate-pulse"
                style={{
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scanner Elements */}
      {showContent && (
        <>
          <div className="scanner-beam z-10" />
          <div className="corner-bracket tl z-10" />
          <div className="corner-bracket tr z-10" />
          <div className="corner-bracket bl z-10" />
          <div className="corner-bracket br z-10" />
        </>
      )}

      {/* High-Performance Hardware-Accelerated Bounding Boxes (Zero Layout Reflows) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Top HUD */}
      <div className="relative z-20 flex justify-between p-4 pointer-events-none">
        
        {/* Top-Left: Risk Stats */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="tactical-glass rounded-xl p-3 flex flex-col gap-3 pointer-events-auto shadow-lg backdrop-blur-md bg-black/40 border border-white/10"
            >
              <div className="flex items-center gap-4">
                {/* Gauge */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#162032"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke={gaugeColor}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-mono font-black text-white leading-none">{riskData.score}</span>
                    <span className="text-[10px] font-mono text-guardian-muted">/100</span>
                  </div>
                </div>

                {/* Badge */}
                <div 
                  className="px-3 py-1.5 rounded-lg border flex items-center gap-2"
                  style={{ backgroundColor: `${color}33`, borderColor: `${color}66`, color }}
                >
                  <Activity size={16} />
                  <span className="text-sm font-bold tracking-wider">{label}</span>
                </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-[9px] text-guardian-muted font-mono tracking-wider">COUNT</span>
                  <span className="text-sm font-mono font-bold text-white">{riskData.personCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-guardian-muted font-mono tracking-wider">EST. DENSITY</span>
                  <span className="text-sm font-mono font-bold text-white">{riskData.density.toFixed(1)} <span className="text-[10px] text-guardian-muted">p/m²</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-guardian-muted font-mono tracking-wider">FLOW DELTA</span>
                  <span className="text-sm font-mono font-bold text-white">{riskData.flowRate > 0 ? '+' : ''}{riskData.flowRate}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top-Right: Status */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="tactical-glass rounded-lg px-3 py-2 flex items-center gap-2 pointer-events-auto h-10 backdrop-blur-md bg-black/40 border border-white/10"
            >
              <span className="text-[10px] font-mono tracking-wider text-guardian-cyan font-bold mr-2">VISION ENGINE</span>
              <div className="h-3 w-[1px] bg-white/20 mx-1" />
              {videoMode === 'sample' ? (
                <div className="flex items-center gap-1.5 text-guardian-cyan">
                  <div className="w-1.5 h-1.5 rounded-full bg-guardian-cyan animate-pulse" />
                  <span className="text-[10px] font-mono">REAL AI · FOOTAGE</span>
                </div>
              ) : videoMode === 'camera' ? (
                <div className="flex items-center gap-1.5 text-guardian-green">
                  <div className="w-1.5 h-1.5 rounded-full bg-guardian-green animate-pulse" />
                  <span className="text-[10px] font-mono">REAL AI · LIVE CAMERA</span>
                </div>
              ) : isSimulating ? (
                <div className="flex items-center gap-1.5 text-guardian-amber">
                  <Sparkles size={12} />
                  <span className="text-[10px] font-mono">SYNTHETIC PRESET</span>
                </div>
              ) : isModelReady ? (
                <div className="flex items-center gap-1.5 text-guardian-green">
                  <div className="w-1.5 h-1.5 rounded-full bg-guardian-green animate-pulse" />
                  <span className="text-[10px] font-mono">AI READY</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-guardian-cyan">
                  <div className="w-1.5 h-1.5 rounded-full bg-guardian-cyan animate-pulse" />
                  <span className="text-[10px] font-mono">ONLINE</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Middle States: Error, Inactive */}
      <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
        {cameraError ? (
          <div className="flex flex-col items-center justify-center bg-black/80 p-8 rounded-2xl border border-guardian-red/30 pointer-events-auto">
            <CameraOff size={48} className="text-guardian-red mb-4" />
            <p className="text-white font-medium mb-2">Camera Error</p>
            <p className="text-guardian-muted text-sm text-center mb-6 max-w-xs">{cameraError}</p>
            <div className="flex gap-4">
              <button onClick={onStartCamera} className="px-4 py-2 bg-guardian-surface hover:bg-guardian-border text-white text-sm font-medium rounded-lg transition-colors border border-white/10 flex items-center gap-2">
                <RotateCcw size={16} /> Retry
              </button>
              <button onClick={() => onSelectScenario('safe')} className="px-4 py-2 bg-guardian-accent hover:bg-[#ff8533] text-black text-sm font-bold rounded-lg transition-colors">
                Use Demo
              </button>
            </div>
          </div>
        ) : !showContent ? (
          <div className="flex flex-col items-center justify-center pointer-events-auto">
            <div className="w-20 h-20 bg-guardian-surface rounded-full flex items-center justify-center border border-white/5 mb-6 text-guardian-muted">
              <Camera size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Surveillance Offline</h3>
            <p className="text-guardian-muted text-sm max-w-sm text-center">Start the camera feed or choose sample event footage to analyze live crowd dynamics.</p>
          </div>
        ) : null}
      </div>

      {/* Bottom Control Bar */}
      <div className="relative z-20 bg-black/50 backdrop-blur-md border-t border-white/10 p-2.5 flex items-center justify-between pointer-events-auto gap-2">
        {isSimulating ? (
          <>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-[9px] font-mono text-guardian-muted uppercase tracking-wider mr-1 hidden sm:inline">PRESET:</span>
              {(['safe', 'surge', 'critical'] as const).map(sc => (
                <button
                  key={sc}
                  onClick={() => onSelectScenario(sc)}
                  className={`px-2.5 py-1 text-[11px] font-bold font-mono rounded transition-colors whitespace-nowrap ${
                    demoScenario === sc 
                      ? sc === 'safe' ? 'bg-guardian-green text-black' 
                        : sc === 'surge' ? 'bg-guardian-amber text-black' 
                        : 'bg-guardian-red text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {sc.toUpperCase()}
                  {sc === 'safe' && ' (18)'}
                  {sc === 'surge' && ' (65)'}
                  {sc === 'critical' && ' (92)'}
                </button>
              ))}
              {onLoadSampleVideo && (
                <button
                  onClick={() => onLoadSampleVideo('/concert-crowd.webm')}
                  className="px-2.5 py-1 bg-guardian-cyan/20 text-guardian-cyan hover:bg-guardian-cyan/30 text-[11px] font-bold font-mono rounded transition-colors border border-guardian-cyan/40 flex items-center gap-1 whitespace-nowrap"
                  title="Switch to real event video detection"
                >
                  <Video size={12} /> EVENT
                </button>
              )}
            </div>
            <button 
              onClick={() => onSelectScenario('off')}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold rounded transition-colors whitespace-nowrap"
            >
              EXIT
            </button>
          </>
        ) : isActive ? (
          <>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {videoMode === 'sample' ? (
                <>
                  <span className="text-[9px] font-mono text-guardian-cyan uppercase tracking-wider hidden sm:inline">FOOTAGE:</span>
                  <button
                    onClick={() => onLoadSampleVideo?.('/concert-crowd.webm')}
                    className={`px-2 py-1 text-[11px] font-bold font-mono rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
                      currentSampleUrl === '/concert-crowd.webm'
                        ? 'bg-guardian-cyan text-black shadow-sm font-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    EVENT
                  </button>
                  <button
                    onClick={() => onLoadSampleVideo?.('/event-video-1.webm')}
                    className={`px-2 py-1 text-[11px] font-bold font-mono rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
                      currentSampleUrl === '/event-video-1.webm'
                        ? 'bg-guardian-cyan text-black shadow-sm font-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    VIDEO 1
                  </button>
                  <button
                    onClick={() => onLoadSampleVideo?.('/event-video-2.webm')}
                    className={`px-2 py-1 text-[11px] font-bold font-mono rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
                      currentSampleUrl === '/event-video-2.webm'
                        ? 'bg-guardian-cyan text-black shadow-sm font-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    VIDEO 2
                  </button>
                </>
              ) : (
                <span className="text-[10px] font-mono text-guardian-green font-bold flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-guardian-green animate-pulse" />
                  REAL AI · CAMERA
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {videoMode === 'camera' && (
                <button 
                  onClick={onToggleFacing}
                  className="px-2 py-1 bg-guardian-surface hover:bg-guardian-border text-white text-xs font-bold rounded-lg transition-colors border border-white/10 flex items-center gap-1"
                >
                  <RotateCcw size={12} /> FLIP
                </button>
              )}
              {videoMode === 'sample' && (
                <button 
                  onClick={() => onSelectScenario('surge')}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition-colors border border-white/10 flex items-center gap-1"
                  title="Switch to synthetic presets"
                >
                  <Sparkles size={12} /> PRESETS
                </button>
              )}
              <button 
                onClick={onStopCamera}
                className="px-2 py-1 bg-guardian-red/20 hover:bg-guardian-red/40 text-guardian-red text-xs font-bold rounded-lg transition-colors border border-guardian-red/30 flex items-center gap-1"
              >
                <CameraOff size={12} /> STOP
              </button>
            </div>
          </>
        ) : (
          <div className="flex w-full items-center justify-between gap-1 overflow-x-auto py-0.5">
            <button 
              onClick={onStartCamera}
              className="flex-1 py-2 px-1 bg-guardian-accent hover:bg-[#ff8533] text-black text-[11px] font-bold font-mono tracking-wide rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
            >
              <Camera size={13} /> CAMERA
            </button>
            {onLoadSampleVideo && (
              <button 
                onClick={() => onLoadSampleVideo('/concert-crowd.webm')}
                className="flex-1 py-2 px-1 bg-guardian-cyan hover:bg-[#38bdf8] text-black text-[11px] font-bold font-mono tracking-wide rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm shadow-cyan-500/20 whitespace-nowrap"
                title="Run real AI vision on festival concert crowd footage"
              >
                <Video size={13} /> EVENT
              </button>
            )}
            {onLoadSampleVideo && (
              <button 
                onClick={() => onLoadSampleVideo('/event-video-1.webm')}
                className="flex-1 py-2 px-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold font-mono tracking-wide rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                title="Run real AI vision on event footage 1"
              >
                <Video size={13} /> VIDEO 1
              </button>
            )}
            {onLoadSampleVideo && (
              <button 
                onClick={() => onLoadSampleVideo('/event-video-2.webm')}
                className="flex-1 py-2 px-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold font-mono tracking-wide rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                title="Run real AI vision on event footage 2"
              >
                <Video size={13} /> VIDEO 2
              </button>
            )}
            <button 
              onClick={() => onSelectScenario('surge')}
              className="py-2 px-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[11px] font-bold font-mono tracking-wide rounded-lg transition-colors flex items-center justify-center gap-1 border border-white/5 whitespace-nowrap"
            >
              <Sparkles size={13} /> PRESET
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
