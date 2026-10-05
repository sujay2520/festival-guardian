'use client';
import { useRef, useState, useCallback, useEffect } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [videoMode, setVideoMode] = useState<'camera' | 'sample' | 'none'>('none');
  const [currentSampleUrl, setCurrentSampleUrl] = useState<string>('/concert-crowd.webm');
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment'
  );

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      if (videoRef.current) {
        videoRef.current.src = '';
        videoRef.current.loop = false;
      }
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
      setVideoMode('camera');
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
      setVideoMode('none');
    }
  }, [facingMode]);

  const loadSampleVideo = useCallback(async (videoUrl = '/concert-crowd.webm') => {
    try {
      setError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = videoUrl;
        videoRef.current.loop = true;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      setIsActive(true);
      setVideoMode('sample');
      setCurrentSampleUrl(videoUrl);
    } catch {
      setError('Could not play sample video. Please try again.');
      setIsActive(false);
      setVideoMode('none');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
    setIsActive(false);
    setVideoMode('none');
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
    videoMode,
    currentSampleUrl,
    error,
    facingMode,
    startCamera,
    loadSampleVideo,
    stopCamera,
    toggleFacing,
  };
}
