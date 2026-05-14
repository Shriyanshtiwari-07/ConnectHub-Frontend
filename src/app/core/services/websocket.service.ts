import { Injectable, OnDestroy } from '@angular/core';
import { Client, IFrame, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokenService } from './auth-token.service';

export type PresenceUpdatePayload = {
  userId: string;
  status: 'ONLINE' | 'AWAY' | 'DND' | 'INVISIBLE';
  lastSeenAt?: string;
};

export type TypingIndicatorPayload = {
  senderId: string;
  roomId: string;
  isTyping: boolean;
};

export type ReadReceiptPayload = {
  readerId: string;
  roomId: string;
  upToMessageId: string;
};

export type ChatSendPayload = {
  senderUsername: string;
  roomId: string;
  content?: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  mediaUrl?: string;
  fileName?: string;
  mimeType?: string;
  sizeKb?: number;
  replyToMessageId?: string;
};

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private client: Client | null = null;
  private isConnected = false;

  private subscriptionHandlers = new Map<string, (msg: any) => void>();
  private activeSubs = new Map<string, StompSubscription>();

  private readonly presence$ = new Subject<PresenceUpdatePayload>();
  private readonly roomSubjects = new Map<string, Subject<unknown>>();
  private readonly userSubjects = new Map<string, Subject<unknown>>();

  private messageQueue: { dest: string; body: any }[] = [];

  constructor(private readonly tokens: AuthTokenService) {}

  connect(): void {
    if (this.client?.active) return;

    console.log('[WS] 🛰️ Connecting to WebSocket:', environment.wsUrl);
    this.client = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg: string) => console.log('[STOMP DEBUG]', msg),
      beforeConnect: async () => {
        const freshToken = this.tokens.token;
        if (freshToken && this.client) {
          this.client.connectHeaders = { Authorization: `Bearer ${freshToken}` };
        }
      },
      onConnect: (frame: IFrame) => {
        console.log('[WS] ✅ Connected! User:', frame.headers['user-name'] || 'authenticated');
        console.log('[WS] 🖼️ Connect Frame Headers:', frame.headers);
        this.isConnected = true;

        // Re-subscribe all registered handlers
        this.subscriptionHandlers.forEach((handler, dest) => {
          console.log('[WS] 🔄 Re-subscribing to:', dest);
          this.doSubscribe(dest, handler);
        });

        // Flush queued messages
        while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift();
          if (msg) this.publish(msg.dest, msg.body);
        }
      },
      onDisconnect: () => {
        console.warn('[WS] ❌ Disconnected');
        this.isConnected = false;
        // FIX 2: clear activeSubs so doSubscribe doesn't try to unsubscribe dead subs
        this.activeSubs.clear();
      },
      onStompError: (frame) => {
        console.error('[WS] 🛑 STOMP Error:', frame.headers['message']);
        this.isConnected = false;
        // FIX 2: same here — dead connection, clear the map
        this.activeSubs.clear();
      },
      onWebSocketClose: () => {
        console.warn('[WS] ⚠️ WebSocket Closed');
        this.isConnected = false;
        // FIX 2: clear so reconnect can re-register fresh STOMP subs
        this.activeSubs.clear();
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    console.log('[WS] 🚪 Disconnecting manually');
    this.isConnected = false;
    this.subscriptionHandlers.clear();
    this.activeSubs.forEach((s) => s.unsubscribe());
    this.activeSubs.clear();
    this.client?.deactivate();
    this.client = null;
  }

  subscribePresence(): Observable<PresenceUpdatePayload> {
    const dest = '/topic/presence';
    this.ensureSub(dest, (msg) => {
      this.presence$.next(JSON.parse(msg.body) as PresenceUpdatePayload);
    });
    return this.presence$.asObservable();
  }

  subscribeRoom(roomId: string): Observable<unknown> {
    const dest = `/topic/room/${roomId}`;
    console.log(`[WS] 📥 Subscribing to room topic: ${dest}`);

    if (!this.roomSubjects.has(roomId)) {
      this.roomSubjects.set(roomId, new Subject<unknown>());
    }
    const subject$ = this.roomSubjects.get(roomId)!;

    this.ensureSub(dest, (msg) => {
      console.log(`[WS] 💬 Raw data received on ${dest}:`, msg.body);
      try {
        const body = JSON.parse(msg.body);
        // FIX 1: always get fresh reference from map — never capture subject$ in closure
        this.roomSubjects.get(roomId)?.next(body);
      } catch (e) {
        console.error(`[WS] ❌ Failed to parse message on ${dest}:`, e);
      }
    });

    return new Observable((observer) => {
      const sub = subject$.subscribe(observer);
      return () => {
        sub.unsubscribe();
        // FIX 1: only clean up STOMP sub & handler — DO NOT delete the subject.
        // The subject must survive reconnects so the handler can push into it.
        // It is only cleaned up when there are no more observers AND the component
        // explicitly calls disconnect() or the service is destroyed.
        if (!subject$.observed) {
          console.log(`[WS] 🧹 No more observers for room ${roomId}, clearing STOMP sub`);
          this.activeSubs.get(dest)?.unsubscribe();
          this.activeSubs.delete(dest);
          this.subscriptionHandlers.delete(dest);
          // FIX 1: subject stays in the map — remove only if we're sure no reconnect is pending
          // Safe to remove only when fully disconnecting (handled in disconnect())
        }
      };
    });
  }

  subscribeUser(username: string): Observable<unknown> {
    const dest = `/topic/notifications/${username}`;
    console.log(`[WS] 📥 Subscribing to personal topic: ${dest}`);

    if (!this.userSubjects.has(username)) {
      this.userSubjects.set(username, new Subject<unknown>());
    }
    const subject$ = this.userSubjects.get(username)!;

    this.ensureSub(dest, (msg) => {
      console.log(`[WS] 🔔 Private notification received`);
      // FIX 1: same pattern — look up fresh from map
      this.userSubjects.get(username)?.next(JSON.parse(msg.body) as unknown);
    });

    return new Observable((observer) => {
      const sub = subject$.subscribe(observer);
      return () => {
        sub.unsubscribe();
        if (!subject$.observed) {
          this.activeSubs.get(dest)?.unsubscribe();
          this.activeSubs.delete(dest);
          this.subscriptionHandlers.delete(dest);
          // FIX 1: do not delete userSubjects entry here either
        }
      };
    });
  }

  sendChatMessage(payload: ChatSendPayload): void {
    console.log('[WS] ✉️ Publishing chat message to room:', payload.roomId);
    this.publish('/app/chat.send', payload);
  }

  sendTyping(payload: TypingIndicatorPayload): void {
    this.publish('/app/chat.typing', payload);
  }

  sendReadReceipt(payload: ReadReceiptPayload): void {
    this.publish('/app/chat.read', payload);
  }

  sendDeliveryReceipt(payload: { roomId: string; readerId: string }): void {
    this.publish('/app/chat.delivered', payload);
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.presence$.complete();
    this.roomSubjects.forEach((s) => s.complete());
    this.roomSubjects.clear();
    this.userSubjects.forEach((s) => s.complete());
    this.userSubjects.clear();
  }

  private ensureSub(dest: string, handler: (msg: any) => void): void {
    this.subscriptionHandlers.set(dest, handler);
    if (this.isConnected) {
      this.doSubscribe(dest, handler);
    } else {
      console.log('[WS] ⏳ Connection not ready, will subscribe to', dest, 'on connect');
      this.connect();
    }
  }

  private doSubscribe(dest: string, handler: (msg: any) => void): void {
    if (!this.client || !this.isConnected) return;
    // FIX 2: activeSubs is already cleared on disconnect/error/close,
    // so this guard is now safe — no risk of unsubscribing a dead sub
    if (this.activeSubs.has(dest)) {
      this.activeSubs.get(dest)?.unsubscribe();
    }
    const sub = this.client.subscribe(dest, (msg) => handler(msg));
    this.activeSubs.set(dest, sub);
    console.log('[WS] 🖋️ Subscribed to', dest);
  }

  private publish(dest: string, body: any): void {
    if (this.isConnected && this.client) {
      this.client.publish({ destination: dest, body: JSON.stringify(body) });
      console.log('[WS] 🚀 Published to', dest);
      return;
    }
    console.log('[WS] 🕒 Connection pending, queuing message for', dest);
    this.messageQueue.push({ dest, body });
    this.connect();
  }
}