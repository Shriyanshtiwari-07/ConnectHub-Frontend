import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { ApiClientService } from './api-client.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  
  // We will fetch this from backend if not hardcoded, but backend API /api/notifications/vapid-public-key is available
  // To avoid circular dependency or race conditions, we can fetch it when needed.

  constructor(
    private auth: AuthService,
    private http: HttpClient
  ) {}

  async initPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported by the browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Push notification permission denied.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);

      // Get VAPID public key from backend
      // Assuming notification-service is available via Gateway at /api/notifications
      // The gateway must route /api/notifications to notification-service.
      this.http.get(`${environment.apiBaseUrl}/notifications/vapid-public-key`, { responseType: 'text' }).subscribe({
        next: async (vapidPublicKey) => {
          try {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: this.urlB64ToUint8Array(vapidPublicKey)
            });

            // Send subscription to backend
            const subData = JSON.parse(JSON.stringify(subscription));
            this.http.post(`${environment.apiBaseUrl}/notifications/subscribe`, {
              userId: this.auth.me()?.userId,
              endpoint: subData.endpoint,
              keys: subData.keys
            }).subscribe({
              next: () => console.log('Successfully subscribed to push notifications.'),
              error: (err) => console.error('Failed to save push subscription to backend:', err)
            });
          } catch (e) {
            console.error('Failed to subscribe to PushManager:', e);
          }
        },
        error: (err) => console.error('Failed to fetch VAPID public key:', err)
      });
      
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  }

  private urlB64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
