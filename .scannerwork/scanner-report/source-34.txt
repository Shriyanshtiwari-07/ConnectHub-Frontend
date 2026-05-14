import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import type { Message } from '../../../../shared/models/chat.models';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="row" [class.mine]="isMine" [class.deleted-row]="message.isDeleted">
      <div class="bubble-container">
        <!-- Message Tail (WhatsApp style) -->
        <div class="tail" *ngIf="!message.isDeleted"></div>
        
        <div class="bubble" [class.deleted]="message.isDeleted">
          <div class="sender-name" *ngIf="!isMine && message.roomType === 'GROUP' && !message.isDeleted" [style.color]="getSenderColor(message.senderName || message.senderId)">
            {{ message.senderName || message.senderId }}
          </div>

          <div class="reply" *ngIf="message.replyTo && !message.isDeleted">
            <div class="bar"></div>
            <div class="q">
              <div class="qmeta">Reply</div>
              <div class="qtext">{{ message.replyTo.content ?? message.replyTo.type }}</div>
            </div>
          </div>

          <div class="text-content" *ngIf="!message.isDeleted; else deleted">
            <div class="text">
              <!-- Image Preview -->
              <div class="media-container" *ngIf="message.type === 'IMAGE' && message.mediaUrl">
                <img class="img" [src]="message.mediaUrl" (load)="onMediaLoad()" />
              </div>

              <!-- File Card -->
              <a *ngIf="message.type === 'FILE' && message.mediaUrl" class="file-card" [href]="message.mediaUrl" target="_blank">
                <div class="file-icon">📄</div>
                <div class="file-info">
                  <div class="file-name">{{ message.fileName || 'Document' }}</div>
                  <div class="file-meta">{{ message.sizeKb ? message.sizeKb + ' KB' : '' }} • {{ message.mimeType || 'File' }}</div>
                </div>
                <div class="download-btn">⬇️</div>
              </a>

              <!-- Audio Player -->
              <div class="audio-player" *ngIf="message.type === 'AUDIO' && message.mediaUrl">
                <div class="play-btn" (click)="toggleAudio($event, audioRef)">
                  {{ isPlaying ? '⏸️' : '▶️' }}
                </div>
                <div class="waveform">
                  <div class="bar-progress" [style.width.%]="progress"></div>
                </div>
                <audio #audioRef [src]="message.mediaUrl" (timeupdate)="onTimeUpdate(audioRef)" (ended)="onEnded()"></audio>
                <span class="duration">{{ durationLabel }}</span>
              </div>

              <span *ngIf="message.content && message.type === 'TEXT'">{{ message.content }}</span>
              <span class="caption" *ngIf="message.content && message.type !== 'TEXT'">{{ message.content }}</span>
            </div>

            <div class="meta">
              <span class="time">{{ timeLabel }}</span>
              <div class="ticks" *ngIf="isMine" [class.read]="message.isRead || message.deliveryStatus === 'READ'">
                <ng-container *ngIf="message.deliveryStatus === 'SENDING'; else delivered">
                  <span class="clock">🕒</span>
                </ng-container>
                <ng-template #delivered>
                  <svg viewBox="0 0 18 11" width="18" height="11" fill="currentColor">
                    <path d="M13.51 1.906l-8.005 8.005-4.505-4.505 1.414-1.414 3.091 3.091 6.591-6.591 1.414 1.414z"/>
                    <path *ngIf="message.deliveryStatus !== 'SENT'" d="M17.51 1.906l-8.005 8.005-4.505-4.505 1.414-1.414 3.091 3.091 6.591-6.591 1.414 1.414z" />
                  </svg>
                </ng-template>
              </div>
            </div>
          </div>

          <ng-template #deleted>
            <div class="deleted-text">
              <span class="deleted-icon">🚫</span>
              <span>This message was deleted</span>
            </div>
          </ng-template>
        </div>

        <div class="actions" *ngIf="!message.isDeleted">
          <button class="a" (click)="reply.emit()" title="Reply">↩️</button>
          <button class="a" *ngIf="isMine" (click)="edit.emit()" title="Edit">✏️</button>
          <button class="a danger" *ngIf="isMine" (click)="delete.emit()" title="Delete">🗑️</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      margin: 2px 0;
      padding: 0 5%;
      animation: messageIn 0.3s cubic-bezier(0.1, 0.9, 0.2, 1);
    }
    @keyframes messageIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .row.mine {
      justify-content: flex-end;
    }
    .bubble-container {
      max-width: 85%;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    
    /* WhatsApp Tail */
    .tail {
      position: absolute;
      top: 0;
      width: 12px;
      height: 12px;
      z-index: 1;
    }
    .row:not(.mine) .tail {
      left: -8px;
      background: var(--panel);
      clip-path: polygon(100% 0, 0 0, 100% 100%);
    }
    .row.mine .tail {
      right: -8px;
      background: #005c4b; /* WhatsApp Dark Green */
      clip-path: polygon(0 0, 100% 0, 0 100%);
    }
    
    .bubble {
      background: var(--panel);
      color: var(--text);
      border-radius: 8px;
      padding: 6px 8px;
      box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
      position: relative;
      min-width: 60px;
    }
    .row.mine .bubble {
      background: #005c4b;
      color: #e9edef;
    }
    .row.mine:not(.deleted-row) .bubble {
      background: #005c4b;
    }
    .row:not(.mine) .bubble {
      border-top-left-radius: 0;
    }
    .row.mine .bubble {
      border-top-right-radius: 0;
    }

    .sender-name {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 2px;
      cursor: pointer;
    }
    .sender-name:hover { text-decoration: underline; }

    .reply {
      display: flex;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      background: rgba(0,0,0,0.05);
      margin-bottom: 4px;
      border-left: 4px solid var(--primary);
    }
    .row.mine .reply {
      background: rgba(255,255,255,0.1);
      border-left-color: #53bdeb;
    }
    .qmeta { font-size: 11px; font-weight: 700; color: var(--primary); margin-bottom: 2px; }
    .row.mine .qmeta { color: #53bdeb; }
    .qtext { font-size: 12px; opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .text-content {
      display: flex;
      flex-direction: column;
    }
    .text {
      font-size: 14.2px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
      padding-right: 4px;
    }
    
    .meta {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      margin-top: -4px;
      height: 16px;
      user-select: none;
    }
    .time {
      font-size: 11px;
      opacity: 0.6;
      margin-top: 8px;
    }
    .ticks {
      margin-top: 8px;
      display: flex;
      align-items: center;
      color: rgba(255,255,255,0.6);
    }
    .ticks.read {
      color: #53bdeb; /* WhatsApp Blue */
    }
    .clock { font-size: 10px; }

    .deleted-text {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      opacity: 0.5;
      font-style: italic;
    }

    .img {
      max-width: 100%;
      max-height: 300px;
      border-radius: 6px;
      display: block;
      cursor: pointer;
    }
    .media-container {
      margin-bottom: 4px;
      border-radius: 6px;
      overflow: hidden;
      background: rgba(0,0,0,0.05);
    }
    .file-card {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 12px;
      margin: 4px 0;
      padding: 10px;
      border-radius: 8px;
      background: rgba(0,0,0,0.05);
      text-decoration: none;
      color: inherit;
      border: 1px solid rgba(0,0,0,0.05);
      min-width: 200px;
    }
    .row.mine .file-card {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.1);
    }
    .file-icon { font-size: 24px; }
    .file-name { font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .file-meta { font-size: 11px; opacity: 0.7; }
    .download-btn { font-size: 16px; opacity: 0.7; }
    .caption { display: block; font-size: 13px; margin-top: 4px; opacity: 0.9; }

    /* Audio Player UI */
    .audio-player {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: rgba(0,0,0,0.05);
      border-radius: 20px;
      margin: 4px 0;
      min-width: 240px;
    }
    .row.mine .audio-player { background: rgba(255,255,255,0.1); }
    .play-btn {
      width: 32px;
      height: 32px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: grid;
      place-items: center;
      cursor: pointer;
      font-size: 14px;
    }
    .waveform {
      flex: 1;
      height: 4px;
      background: rgba(0,0,0,0.1);
      border-radius: 2px;
      position: relative;
      overflow: hidden;
    }
    .row.mine .waveform { background: rgba(255,255,255,0.2); }
    .bar-progress {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: var(--primary);
      width: 0;
    }
    .duration { font-size: 11px; opacity: 0.7; font-family: monospace; }

    .actions {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 10;
    }
    .row:not(.mine) .actions { left: 100%; margin-left: 10px; }
    .row.mine .actions { right: 100%; margin-right: 10px; }
    .bubble-container:hover .actions { opacity: 1; }
    
    .a {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background: var(--panel-2);
      color: var(--text);
      cursor: pointer;
      display: grid;
      place-items: center;
      font-size: 12px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .a:hover { background: var(--primary); color: white; }
  `,
})
export class MessageBubbleComponent {
  @Input() message!: Message;
  @Input() isMine = false;

  @Output() reply = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  get timeLabel(): string {
    if (!this.message.sentAt) return '';
    try {
      const date = new Date(this.message.sentAt);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  onMediaLoad() {
    // Optional: trigger scroll to bottom after image loads
  }

  isPlaying = false;
  progress = 0;
  durationLabel = '0:00';

  toggleAudio(evt: Event, audio: HTMLAudioElement) {
    evt.stopPropagation();
    if (this.isPlaying) {
      audio.pause();
      this.isPlaying = false;
    } else {
      audio.play();
      this.isPlaying = true;
    }
  }

  onTimeUpdate(audio: HTMLAudioElement) {
    this.progress = (audio.currentTime / audio.duration) * 100;
    this.durationLabel = this.formatTime(audio.currentTime);
  }

  onEnded() {
    this.isPlaying = false;
    this.progress = 0;
    this.durationLabel = '0:00';
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  getSenderColor(name: string): string {
    const colors = [
      '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', 
      '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', 
      '#ffc107', '#ff9800', '#ff5722', '#795548'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
}

