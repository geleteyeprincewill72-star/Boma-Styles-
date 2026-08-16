import { useState, useEffect, useCallback } from 'react';
import { deviceStorageService, DevicePermissionState } from '../services/deviceStorageService';

export type PermissionType = 'camera' | 'microphone' | 'photos' | 'notifications';

export interface PermissionDetails {
  type: PermissionType;
  title: string;
  description: string;
  rationale: string;
  icon: string;
}

export const PERMISSION_METADATA: Record<PermissionType, PermissionDetails> = {
  camera: {
    type: 'camera',
    title: 'Camera Access',
    description: 'Capture live video posts, visual stories, and scan P2P cryptographic QR codes.',
    rationale: 'Aura only accesses your camera when you actively record a video or scan a key.',
    icon: 'Camera'
  },
  microphone: {
    type: 'microphone',
    title: 'Microphone Access',
    description: 'Record high-fidelity voice notes, OmniSpeech audio transcription, and voice broadcasts.',
    rationale: 'Audio is recorded strictly during active speech capture and can be stored privately on your device.',
    icon: 'Mic'
  },
  photos: {
    type: 'photos',
    title: 'Photo & Media Access',
    description: 'Select photos, cinematic clips, and custom avatars from your device gallery.',
    rationale: 'Aura only accesses the specific files you pick for your feed or drafts.',
    icon: 'Image'
  },
  notifications: {
    type: 'notifications',
    title: 'Push Notifications',
    description: 'Receive real-time notifications for direct messages, creator subscriptions, and peer tips.',
    rationale: 'You can customize or mute notifications at any time in your Settings.',
    icon: 'Bell'
  }
};

export function usePermissions() {
  const [permissions, setPermissions] = useState<DevicePermissionState>({
    camera: deviceStorageService.getPermissionState('camera'),
    microphone: deviceStorageService.getPermissionState('microphone'),
    photos: deviceStorageService.getPermissionState('photos'),
    notifications: deviceStorageService.getPermissionState('notifications'),
  });

  const [activeRequest, setActiveRequest] = useState<PermissionDetails | null>(null);
  const [resolveCallback, setResolveCallback] = useState<((granted: boolean) => void) | null>(null);

  const requestPermission = useCallback((type: PermissionType): Promise<boolean> => {
    const currentState = deviceStorageService.getPermissionState(type);
    if (currentState === 'granted') {
      return Promise.resolve(true);
    }

    return new Promise<boolean>((resolve) => {
      setActiveRequest(PERMISSION_METADATA[type]);
      setResolveCallback(() => (granted: boolean) => {
        deviceStorageService.setPermissionState(type, granted ? 'granted' : 'denied');
        setPermissions(prev => ({ ...prev, [type]: granted ? 'granted' : 'denied' }));
        setActiveRequest(null);
        resolve(granted);
      });
    });
  }, []);

  const handleGrant = useCallback(async () => {
    if (!activeRequest || !resolveCallback) return;

    if (activeRequest.type === 'camera' || activeRequest.type === 'microphone') {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const constraints = activeRequest.type === 'camera' ? { video: true } : { audio: true };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          // Stop immediately after checking permission
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.warn("Browser hardware permission not permitted directly:", err);
      }
    } else if (activeRequest.type === 'notifications' && 'Notification' in window) {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.warn("Notification request notice:", err);
      }
    }

    resolveCallback(true);
  }, [activeRequest, resolveCallback]);

  const handleDeny = useCallback(() => {
    if (resolveCallback) {
      resolveCallback(false);
    }
  }, [resolveCallback]);

  return {
    permissions,
    activeRequest,
    requestPermission,
    handleGrant,
    handleDeny
  };
}
