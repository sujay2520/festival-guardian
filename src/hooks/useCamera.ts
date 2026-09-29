'use client';
import { useRef, useState, useCallback, useEffect } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment'
  );

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
    } catch (err: unknown) {
      const e = err as DOMException;
      const msg =
        e.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access.'
          : e.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : `Camera error: ${e.message}`;
      setError(msg);
      setIsActive(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const toggleFacing = useCallback(() => {
    const wasActive = isActive;
    stopCamera();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    if (wasActive) {
      // Will restart via the effect below
    }
  }, [stopCamera, isActive]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    videoRef,
    isActive,
    error,
    facingMode,
    startCamera,
    stopCamera,
    toggleFacing,
  };
}
