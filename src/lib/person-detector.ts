import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-webgl';
import { BoundingBox } from '@/types';

let model: cocoSsd.ObjectDetection | null = null;
let isLoading = false;

export async function loadDetector(): Promise<void> {
  if (model || isLoading) return;
  isLoading = true;
  try {
    await import('@tensorflow/tfjs-backend-webgl');
    model = await cocoSsd.load({ base: 'mobilenet_v2' });
    console.log('[PersonDetector] Model loaded successfully');
  } catch (error) {
    console.error('[PersonDetector] Failed to load model:', error);
    throw error;
  } finally {
    isLoading = false;
  }
}

export function isModelLoaded(): boolean {
  return model !== null;
}

export async function detectPersons(
  input: HTMLVideoElement | HTMLCanvasElement | ImageData
): Promise<BoundingBox[]> {
  if (!model) {
    throw new Error('Model not loaded. Call loadDetector() first.');
  }

  const predictions = await model.detect(input);

  return predictions
    .filter((p) => p.class === 'person' && p.score >= 0.4)
    .map((p) => ({
      x: p.bbox[0],
      y: p.bbox[1],
      width: p.bbox[2],
      height: p.bbox[3],
      confidence: p.score,
      label: 'person',
    }));
}

export function disposeDetector(): void {
  if (model) {
    model.dispose();
    model = null;
  }
}
