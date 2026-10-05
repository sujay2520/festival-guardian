import { Alert, AlertType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function createAlert(
  type: AlertType,
  lat: number,
  lng: number,
  options?: Partial<Pick<Alert, 'message' | 'riskScore' | 'senderName'>>
): Alert {
  return {
    id: uuidv4(),
    type,
    lat,
    lng,
    timestamp: Date.now(),
    ttlHops: 6,
    ...options,
  };
}

export const AlertFactory = {
  crowdRisk(score: number, lat: number, lng: number, senderName?: string): Alert {
    return createAlert(AlertType.CROWD_RISK, lat, lng, {
      riskScore: score,
      message: `Crowd density alert: Risk score ${score}/100`,
      senderName,
    });
  },

  sos(lat: number, lng: number, senderName?: string): Alert {
    return createAlert(AlertType.SOS_HELP, lat, lng, {
      message: 'SOS! Emergency help needed!',
      senderName,
    });
  },

  theft(lat: number, lng: number, senderName?: string): Alert {
    return createAlert(AlertType.THEFT, lat, lng, {
      message: 'Theft reported! Be alert!',
      senderName,
    });
  },

  volunteerRequest(lat: number, lng: number, senderName?: string): Alert {
    return createAlert(AlertType.VOLUNTEER_REQUEST, lat, lng, {
      message: 'Volunteer help needed at this location',
      senderName,
    });
  },

  volunteerResponse(lat: number, lng: number, senderName?: string): Alert {
    return createAlert(AlertType.VOLUNTEER_RESPONSE, lat, lng, {
      message: 'Volunteer responding — on my way!',
      senderName,
    });
  },
};
