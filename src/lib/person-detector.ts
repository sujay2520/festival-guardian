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
    model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
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

function computeIoU(a: BoundingBox, b: BoundingBox): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);

  const w = Math.max(0, x2 - x1);
  const h = Math.max(0, y2 - y1);
  const intersection = w * h;

  const areaA = a.width * a.height;
  const areaB = b.width * b.height;
  const union = areaA + areaB - intersection;

  return union <= 0 ? 0 : intersection / union;
}

function nonMaxSuppression(boxes: BoundingBox[], iouThreshold = 0.42): BoundingBox[] {
  const sorted = [...boxes].sort((a, b) => b.confidence - a.confidence);
  const selected: BoundingBox[] = [];

  for (const box of sorted) {
    let keep = true;
    for (const existing of selected) {
      if (computeIoU(box, existing) > iouThreshold) {
        keep = false;
        break;
      }
    }
    if (keep) {
      selected.push(box);
    }
  }

  return selected;
}

let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

let cropCanvas: HTMLCanvasElement | null = null;
let cropCtx: CanvasRenderingContext2D | null = null;

const MAX_INFERENCE_WIDTH = 416;
const MIN_CONFIDENCE = 0.18;

export async function detectPersons(
  input: HTMLVideoElement | HTMLCanvasElement | ImageData
): Promise<BoundingBox[]> {
  if (!model) {
    throw new Error('Model not loaded. Call loadDetector() first.');
  }

  const detectedBoxes: BoundingBox[] = [];
  const isVideo = typeof window !== 'undefined' && input instanceof HTMLVideoElement && input.videoWidth > 0;
  const origW = isVideo ? (input as HTMLVideoElement).videoWidth : 640;
  const origH = isVideo ? (input as HTMLVideoElement).videoHeight : 480;

  // PASS 1: Global frame downscaled to 416px for mobile performance
  let globalTarget: HTMLVideoElement | HTMLCanvasElement | ImageData = input;
  let globalScale = 1.0;

  if (isVideo && origW > MAX_INFERENCE_WIDTH) {
    if (!offscreenCanvas) {
      offscreenCanvas = document.createElement('canvas');
      offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    }

    globalScale = MAX_INFERENCE_WIDTH / origW;
    const targetW = MAX_INFERENCE_WIDTH;
    const targetH = Math.round(origH * globalScale);

    if (offscreenCanvas.width !== targetW || offscreenCanvas.height !== targetH) {
      offscreenCanvas.width = targetW;
      offscreenCanvas.height = targetH;
    }

    if (offscreenCtx) {
      offscreenCtx.drawImage(input as HTMLVideoElement, 0, 0, targetW, targetH);
      globalTarget = offscreenCanvas;
    }
  }

  // Detect with maxNumBoxes=50 and minScore=0.18 (bypasses default 0.5 threshold)
  const globalPreds = await model.detect(globalTarget, 50, MIN_CONFIDENCE);
  for (const p of globalPreds) {
    if (p.class === 'person' && p.score >= MIN_CONFIDENCE) {
      detectedBoxes.push({
        x: p.bbox[0] / globalScale,
        y: p.bbox[1] / globalScale,
        width: p.bbox[2] / globalScale,
        height: p.bbox[3] / globalScale,
        confidence: p.score,
        label: 'person',
      });
    }
  }

  // PASS 2: Center/corridor tile crop for small/distant people in crowds (only if crowd presence is detected)
  if (isVideo && origW >= 480 && detectedBoxes.length >= 2) {
    if (!cropCanvas) {
      cropCanvas = document.createElement('canvas');
      cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
    }

    const cropX = Math.round(origW * 0.15);
    const cropY = Math.round(origH * 0.15);
    const cropW = Math.round(origW * 0.70);
    const cropH = Math.round(origH * 0.70);

    const targetCropW = MAX_INFERENCE_WIDTH;
    const cropScale = targetCropW / cropW;
    const targetCropH = Math.round(cropH * cropScale);

    if (cropCanvas.width !== targetCropW || cropCanvas.height !== targetCropH) {
      cropCanvas.width = targetCropW;
      cropCanvas.height = targetCropH;
    }

    if (cropCtx) {
      cropCtx.drawImage(
        input as HTMLVideoElement,
        cropX, cropY, cropW, cropH,
        0, 0, targetCropW, targetCropH
      );

      const cropPreds = await model.detect(cropCanvas, 40, MIN_CONFIDENCE);
      for (const p of cropPreds) {
        if (p.class === 'person' && p.score >= MIN_CONFIDENCE) {
          detectedBoxes.push({
            x: cropX + p.bbox[0] / cropScale,
            y: cropY + p.bbox[1] / cropScale,
            width: p.bbox[2] / cropScale,
            height: p.bbox[3] / cropScale,
            confidence: p.score,
            label: 'person',
          });
        }
      }
    }
  }

  // Non-maximum suppression deduplication
  return nonMaxSuppression(detectedBoxes, 0.42);
}

export function disposeDetector(): void {
  if (model) {
    model.dispose();
    model = null;
  }
}
