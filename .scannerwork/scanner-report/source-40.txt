import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  template: `
    <div class="wrap">
      <div class="bubble">
        <span class="dots">
          <i></i><i></i><i></i>
        </span>
        <span class="text">{{ text }}</span>
      </div>
    </div>
  `,
  styles: `
    .wrap {
      display: flex;
      margin: 2px 0 8px 5%;
    }
    .bubble {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      background: #202c33;
      color: #8696a0;
      font-size: 13px;
      box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
    }
    .dots {
      display: inline-flex;
      gap: 3px;
    }
    i {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #8696a0;
      animation: b 1.4s infinite ease-in-out both;
    }
    i:nth-child(1) { animation-delay: -0.32s; }
    i:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes b {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }
  `,
})
export class TypingIndicatorComponent {
  @Input() text = 'Typing…';
}

