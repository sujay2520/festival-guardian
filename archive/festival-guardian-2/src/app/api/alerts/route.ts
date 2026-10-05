import { NextRequest, NextResponse } from 'next/server';
import { Alert, AlertType } from '@/types';

// In-memory store for alerts (resets on deploy, fine for prototype)
const alertStore: Alert[] = [];
const MAX_STORED = 100;

export async function GET() {
  return NextResponse.json({
    alerts: alertStore,
    count: alertStore.length,
    timestamp: Date.now(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const alert: Alert = await request.json();

    // Basic validation
    if (!alert.id || !alert.type || !Object.values(AlertType).includes(alert.type)) {
      return NextResponse.json(
        { error: 'Invalid alert format' },
        { status: 400 }
      );
    }

    // Deduplicate
    if (alertStore.some((a) => a.id === alert.id)) {
      return NextResponse.json(
        { message: 'Alert already exists', id: alert.id },
        { status: 200 }
      );
    }

    alertStore.unshift(alert);
    if (alertStore.length > MAX_STORED) {
      alertStore.pop();
    }

    return NextResponse.json(
      { message: 'Alert stored', id: alert.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
