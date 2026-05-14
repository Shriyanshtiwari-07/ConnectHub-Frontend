import { Component, EventEmitter, Input, Output, signal, ViewChild, ElementRef } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import type { Message } from '../../../../shared/models/chat.models';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <div class="composer-container">
      <!-- Context (Reply/Edit) -->
      <div class="context-container" *ngIf="replyTo || editing">
        <div class="context">
          <div class="ctx-left">
            <div class="badge">{{ replyTo ? 'Reply to ' + (replyTo.senderId) : 'Edit Message' }}</div>
            <div class="ctx-text">
              {{ (replyTo?.content ?? replyTo?.type ?? editing?.content ?? editing?.type) || '' }}
            </div>
          </div>
          <button class="ctx-x" (click)="replyTo ? cancelReply.emit() : cancelEdit.emit()">✕</button>
        </div>
      </div>

      <!-- Input Row -->
      <div class="input-row">
        <div class="input-card">
          <button class="action-icon" (click)="toggleEmoji()" title="Emoji">😊</button>
          
          <textarea
            class="textarea scroll"
            [value]="text()"
            (input)="onInputEvent($event)"
            (keydown.enter)="onEnter($event)"
            placeholder="Type a message"
            rows="1"
            #inputBox
          ></textarea>

          <label class="action-icon" title="Attach">
            📎
            <input type="file" multiple (change)="onFiles($event)" />
          </label>

          <!-- Microphone Button -->
          <button 
            class="action-icon mic-btn" 
            [class.recording]="isRecording()" 
            (click)="toggleRecording()"
            title="Click to record"
          >
            {{ isRecording() ? '🔴' : '🎤' }}
          </button>
        </div>

        <!-- Recording Indicator & Controls -->
        <div class="recording-bar" *ngIf="isRecording()">
          <div class="rec-info">
            <div class="pulse"></div>
            <span>{{ recordingTime() }}s</span>
          </div>
          <div class="rec-actions">
            <button class="rec-btn stop" (click)="stopRecording()" title="Stop and Save">Stop</button>
            <button class="rec-btn cancel" (click)="cancelRecording()" title="Discard">Discard</button>
          </div>
        </div>

        <button class="send-circle" (click)="sendNow()" [disabled]="!text().trim() && !files().length">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
          </svg>
        </button>
      </div>

      <!-- Emoji Panel -->
      <div class="emoji-panel" *ngIf="emojiOpen()">
        <button *ngFor="let e of emojis" (click)="pickEmoji(e)">{{ e }}</button>
      </div>

      <!-- File Previews -->
      <div class="file-previews" *ngIf="files().length">
        <div class="file-pill" *ngFor="let f of files()">
          <span class="file-name">{{ f.name }}</span>
          <button class="remove-file" (click)="removeFile(f)">✕</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .composer-container {
      padding: 10px 16px;
      background: transparent;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
    }
    .context-container {
      background: #1f2c33;
      border-radius: 8px 8px 0 0;
      overflow: hidden;
      margin-bottom: -12px;
      border-left: 4px solid var(--primary);
    }
    .context {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.05);
    }
    .ctx-left { flex: 1; min-width: 0; }
    .badge { font-size: 12px; font-weight: 600; color: var(--primary); margin-bottom: 2px; }
    .ctx-text { font-size: 13px; color: #aebac1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ctx-x { background: transparent; border: none; color: #aebac1; cursor: pointer; font-size: 16px; }

    .input-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }
    .input-card {
      flex: 1;
      background: #2a3942;
      border-radius: 24px;
      display: flex;
      align-items: center;
      padding: 0 8px;
      min-height: 48px;
    }
    .action-icon {
      width: 40px;
      height: 48px;
      display: grid;
      place-items: center;
      background: transparent;
      border: none;
      color: #8696a0;
      font-size: 20px;
      cursor: pointer;
      position: relative;
    }
    .action-icon input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
    
    .textarea {
      flex: 1;
      background: transparent;
      border: none;
      color: #d1d7db;
      padding: 12px 8px;
      font-size: 15px;
      resize: none;
      outline: none;
      max-height: 120px;
      line-height: 1.4;
    }
    .textarea::placeholder { color: #8696a0; }

    .send-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #00a884; /* WhatsApp Green */
      color: white;
      border: none;
      display: grid;
      place-items: center;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: transform 0.2s;
    }
    .send-circle:hover:not(:disabled) { transform: scale(1.05); }
    .send-circle:disabled { background: #3b4a54; color: #8696a0; cursor: default; }

    .emoji-panel {
      background: #2a3942;
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .emoji-panel button {
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      font-size: 20px;
      cursor: pointer;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .emoji-panel button:hover { background: #3b4a54; }

    .file-previews {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .file-pill {
      background: #3b4a54;
      color: #d1d7db;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .remove-file { background: transparent; border: none; color: #8696a0; cursor: pointer; }
    .download-btn { font-size: 16px; opacity: 0.7; }
    .caption { display: block; font-size: 13px; margin-top: 4px; opacity: 0.9; }

    /* Recording UI */
    .mic-btn.recording { color: #f44336; animation: pulse 1.5s infinite; }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    .recording-bar {
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 8px;
      height: 52px;
      background: #2a3942;
      border-radius: 26px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 100;
      border: 1px solid rgba(244, 67, 54, 0.3);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .rec-info { display: flex; align-items: center; gap: 12px; color: #f44336; font-weight: 600; }
    .rec-actions { display: flex; gap: 8px; }
    .rec-btn {
      padding: 6px 14px;
      border-radius: 12px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .rec-btn:hover { opacity: 0.9; }
    .rec-btn.stop { background: #00a884; color: white; }
    .rec-btn.cancel { background: transparent; color: #aebac1; }
    .pulse {
      width: 10px;
      height: 10px;
      background: #f44336;
      border-radius: 50%;
      animation: blink 1s infinite;
    }
    @keyframes blink {
      0% { opacity: 1; }
      50% { opacity: 0.3; }
      100% { opacity: 1; }
    }
  `,
})
export class MessageInputComponent {
  @Input() replyTo: Message | null = null;
  @Input() editing: Message | null = null;

  @Output() send = new EventEmitter<{ text: string; files?: File[] }>();
  @Output() typing = new EventEmitter<boolean>();
  @Output() cancelReply = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();

  @ViewChild('inputBox') inputBox!: ElementRef<HTMLTextAreaElement>;

  readonly text = signal('');
  readonly files = signal<File[]>([]);
  readonly emojiOpen = signal(false);
  readonly isRecording = signal(false);
  readonly recordingTime = signal(0);

  private audioChunks: Blob[] = [];
  private recordingTimer: any = null;
  private mediaRecorder: MediaRecorder | null = null;

  constructor() {
    // When editing starts, populate the text box
    import('@angular/core').then(m => {
      // Since we are in a constructor, we can use effect
      (window as any).ng.core.effect(() => {
        const msg = this.editing;
        if (msg && msg.content) {
          this.text.set(msg.content);
          setTimeout(() => this.adjustHeight(), 0);
        } else if (!this.replyTo) {
          // Don't clear if it's a reply context, but clear if no context
          // Actually, let's just clear if editing is removed
        }
      });
    });
  }

  // Use ngOnChanges for @Input() compatibility with older signal patterns or if effect is tricky in this env
  ngOnChanges(changes: any) {
    if (changes.editing && changes.editing.currentValue) {
      const msg = changes.editing.currentValue;
      this.text.set(msg.content || '');
      setTimeout(() => this.adjustHeight(), 0);
      setTimeout(() => this.inputBox.nativeElement.focus(), 50);
    }
  }

  readonly emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '😄', '😉', '🤝', '✅','😎','🥰','😘','😍','🤔','🙂','😛','😜','💀','👺','🐒'];

  private typingTimeout: any = null;

  onInputEvent(evt: Event) {
    const el = evt.target as HTMLTextAreaElement | null;
    this.onInput(el?.value ?? '');
    this.adjustHeight();
  }

  onInput(v: string) {
    this.text.set(v);
    this.emitTyping(true);
  }

  onEnter(evt: Event) {
    const e = evt as KeyboardEvent;
    if (e.shiftKey) return;
    e.preventDefault();
    this.sendNow();
  }

  onFiles(evt: Event) {
    const input = evt.target as HTMLInputElement | null;
    const list = input?.files ? Array.from(input.files) : [];
    if (!list.length) return;
    this.files.update((cur) => [...cur, ...list]);
    if (input) input.value = '';
  }

  removeFile(f: File) {
    this.files.update((cur) => cur.filter((x) => x !== f));
  }

  toggleEmoji() {
    this.emojiOpen.update((x) => !x);
  }

  pickEmoji(e: string) {
    this.text.update((t) => (t ? `${t}${e}` : e));
    this.emojiOpen.set(false);
    this.emitTyping(true);
    setTimeout(() => this.adjustHeight(), 0);
  }

  sendNow() {
    const txt = this.text().trim();
    if (!txt && this.files().length === 0) return;
    this.send.emit({ text: txt, files: this.files() });
    this.text.set('');
    this.files.set([]);
    this.emitTyping(false);
    setTimeout(() => this.adjustHeight(), 0);
  }

  toggleRecording() {
    if (this.isRecording()) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const file = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        
        // Instead of auto-sending, add to the files list for manual sending
        this.files.update(cur => [...cur, file]);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.recordingTime.set(0);
      this.recordingTimer = setInterval(() => {
        this.recordingTime.update(t => t + 1);
      }, 1000);
      
      this.emitTyping(true);
    } catch (err) {
      console.error('Microphone access denied', err);
      alert('Could not access microphone. Please check permissions.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording()) {
      this.mediaRecorder.stop();
      this.isRecording.set(false);
      if (this.recordingTimer) clearInterval(this.recordingTimer);
      this.emitTyping(false);
    }
  }

  cancelRecording() {
    if (this.mediaRecorder && this.isRecording()) {
      // Clear chunks and stop recorder without triggering onstop logic that saves the file
      this.mediaRecorder.onstop = null; 
      this.mediaRecorder.stop();
      this.isRecording.set(false);
      if (this.recordingTimer) clearInterval(this.recordingTimer);
      this.emitTyping(false);
      
      // Clean up stream tracks
      (this.mediaRecorder as any).stream?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    }
  }

  private adjustHeight() {
    const el = this.inputBox?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  private emitTyping(val: boolean) {
    this.typing.emit(val);
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    if (val) {
      this.typingTimeout = setTimeout(() => this.typing.emit(false), 3000);
    } else {
      this.typingTimeout = null;
    }
  }
}
