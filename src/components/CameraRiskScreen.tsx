'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CameraOff,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { BoundingBox, RiskData } from '@/types';
import RiskMeter from './RiskMeter';

interface CameraRiskScreenProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
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
  useEffect(() => {
    if (isActive && !isModelReady && !isModelLoading) {
      onInitModel();
    }
  }, [isActive, isModelReady, isModelLoading, onInitModel]);

  return (
    <div className="relative w-full aspect-[3/4] max-h-[60vh] bg-guardian-card rounded-2xl overflow-hidden border border-guardian-border">
      {/* Video element */}
      <video
        ref={videoRef as React.LegacyRef<HTMLVideoElement>}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Detection bounding boxes */}
      {isActive && detections.length > 0 && (
        <div className="absolute inset-0">
          {detections.map((box, i) => {
            const video = videoRef.current;
            if (!video) return null;
            const scaleX = video.clientWidth / (video.videoWidth || 640);
            const scaleY = video.clientHeight / (video.videoHeight || 480);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`detection-box ${
                  riskData.level === 'danger' || riskData.level === 'critical'
                    ? 'danger'
                    : riskData.level === 'warning'
                      ? 'warning'
                      : ''
                }`}
                style={{
                  left: box.x * scaleX,
                  top: box.y * scaleY,
                  width: box.width * scaleX,
                  height: box.height * scaleY,
                }}
              >
                <span className="absolute -top-5 left-0 text-[10px] bg-black/60 px-1 rounded text-white">
                  {Math.round(box.confidence * 100)}%
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Camera overlay gradient */}
      <div className="camera-overlay absolute inset-0 pointer-events-none" />

      {/* Risk meter overlay (top center) */}
      {isActive && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
          <RiskMeter riskData={riskData} size={160} />
        </div>
      )}

      {/* Camera controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-10">
        {!isActive ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartCamera}
            className="flex items-center gap-2 bg-guardian-accent hover:bg-guardian-accent/80 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Camera className="w-5 h-5" />
            Start Monitoring
          </motion.button>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onToggleFacing}
              className="glass p-3 rounded-xl"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onStopCamera}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-3 rounded-xl transition-colors"
            >
              <CameraOff className="w-5 h-5" />
            </motion.button>
          </>
        )}
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {isActive && isModelLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20"
          >
            <Loader2 className="w-8 h-8 text-guardian-accent animate-spin" />
            <p className="text-sm text-guardian-muted mt-2">
              Loading AI model...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-guardian-card/90 z-20 p-6">
          <CameraOff className="w-12 h-12 text-guardian-muted mb-3" />
          <p className="text-sm text-center text-guardian-muted">
            {cameraError}
          </p>
          <button
            onClick={onStartCamera}
            className="mt-4 text-guardian-accent text-sm underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Inactive placeholder */}
      {!isActive && !cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Camera className="w-16 h-16 text-guardian-border mb-3" />
          <p className="text-sm text-guardian-muted">
            Tap to start crowd monitoring
          </p>
        </div>
      )}
    </div>
  );
}
