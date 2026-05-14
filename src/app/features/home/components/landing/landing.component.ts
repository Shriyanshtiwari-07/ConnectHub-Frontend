import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing-container">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="logo">
          <div class="logo-icon">CH</div>
          <span>ConnectHub</span>
        </div>
        <div class="nav-links">
          <a routerLink="/auth/login" class="nav-btn">Login</a>
          <a routerLink="/auth/register" class="nav-btn primary">Sign Up</a>
        </div>
      </nav>

      <!-- Hero Section -->
      <main class="hero">
        <div class="hero-content">
          <h1 class="title">Real-Time Chat <br><span>Made Simple</span></h1>
          <p class="subtitle">Connect instantly with secure and fast messaging. The ultimate platform for teams and friends.</p>
          
          <div class="cta-group">
            <button routerLink="/auth/login" class="cta-btn secondary">Login Now</button>
            <button routerLink="/auth/register" class="cta-btn primary">Create Account</button>
          </div>

          <div class="stats">
            <div class="stat"><b>10k+</b><span>Users</span></div>
            <div class="stat"><b>1M+</b><span>Messages</span></div>
            <div class="stat"><b>99.9%</b><span>Uptime</span></div>
          </div>
        </div>

        <!-- Illustration -->
        <div class="hero-viz">
          <div class="chat-card main">
            <div class="chat-header">
              <div class="dot red"></div>
              <div class="dot yellow"></div>
              <div class="dot green"></div>
            </div>
            <div class="chat-body">
              <div class="bubble recipient">Hey Ananya! How are you doing?</div>
              <div class="bubble sender">I'm doing great, thanks for asking!</div>
              <div class="bubble recipient">That's awesome to hear!</div>
              <div class="bubble sender typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
          <div class="chat-card secondary">
            <div class="avatar">ST</div>
            <div class="preview">
              <div class="line long"></div>
              <div class="line short"></div>
            </div>
          </div>
          <div class="floating-icon">💬</div>
          <div class="floating-icon alt">✨</div>
        </div>
      </main>

      <!-- Footer Overlay -->
      <footer class="footer">
        © 2026 ConnectHub. All rights reserved.
      </footer>
    </div>
  `,
  styles: `
    :host { --primary: #3b82f6; --primary-dark: #2563eb; --bg: #0f172a; }
    
    .landing-container {
      min-height: 100vh;
      background: radial-gradient(circle at top right, #1e293b, #0f172a);
      color: white;
      font-family: 'Inter', system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      position: relative;
    }

    /* Navbar */
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 80px;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
      background: rgba(15, 23, 42, 0.6);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      background: var(--primary);
      border-radius: 12px;
      display: grid;
      place-items: center;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    .nav-links { display: flex; gap: 24px; align-items: center; }
    .nav-btn {
      text-decoration: none;
      color: #94a3b8;
      font-weight: 600;
      font-size: 15px;
      transition: color 0.2s;
    }
    .nav-btn:hover { color: white; }
    .nav-btn.primary {
      background: var(--primary);
      color: white;
      padding: 10px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    }
    .nav-btn.primary:hover { background: var(--primary-dark); }

    /* Hero */
    .hero {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      padding: 0 80px;
      max-width: 1400px;
      margin: 0 auto;
      gap: 40px;
    }
    .title {
      font-size: 72px;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 24px;
      letter-spacing: -2px;
    }
    .title span {
      background: linear-gradient(to right, #60a5fa, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 18px;
      color: #94a3b8;
      max-width: 500px;
      line-height: 1.6;
      margin-bottom: 40px;
    }
    .cta-group { display: flex; gap: 16px; margin-bottom: 60px; }
    .cta-btn {
      padding: 16px 36px;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta-btn:hover { transform: translateY(-2px); }
    .cta-btn.primary {
      background: var(--primary);
      color: white;
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
    }
    .cta-btn.secondary {
      background: rgba(255,255,255,0.05);
      color: white;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .stats { display: flex; gap: 40px; }
    .stat { display: flex; flex-direction: column; gap: 4px; }
    .stat b { font-size: 24px; }
    .stat span { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

    /* Illustration */
    .hero-viz { position: relative; display: grid; place-items: center; }
    .chat-card {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.4);
    }
    .chat-card.main { width: 380px; z-index: 2; animation: float 6s infinite ease-in-out; }
    .chat-header {
      background: rgba(255,255,255,0.03);
      padding: 12px 16px;
      display: flex;
      gap: 6px;
    }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.red { background: #ef4444; }
    .dot.yellow { background: #f59e0b; }
    .dot.green { background: #10b981; }
    .chat-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .bubble {
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 13px;
      max-width: 80%;
      line-height: 1.4;
    }
    .bubble.recipient { background: #334155; align-self: flex-start; border-bottom-left-radius: 4px; }
    .bubble.sender { background: var(--primary); align-self: flex-end; border-bottom-right-radius: 4px; }
    
    .chat-card.secondary {
      position: absolute;
      width: 240px;
      height: 70px;
      bottom: -20px;
      left: -40px;
      z-index: 3;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
      animation: float 5s infinite ease-in-out reverse;
    }
    .avatar {
      width: 40px;
      height: 40px;
      background: #4f46e5;
      border-radius: 12px;
      display: grid;
      place-items: center;
      font-size: 14px;
      font-weight: 700;
    }
    .line { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.1); margin-bottom: 6px; }
    .line.long { width: 120px; }
    .line.short { width: 60px; }

    .floating-icon {
      position: absolute;
      font-size: 40px;
      top: -30px;
      right: 20px;
      z-index: 1;
      filter: drop-shadow(0 0 20px var(--primary));
      animation: bounce 4s infinite;
    }
    .floating-icon.alt { top: auto; bottom: 40px; right: -20px; font-size: 30px; animation-delay: 1s; }

    .footer {
      padding: 40px 80px;
      font-size: 14px;
      color: #475569;
      text-align: center;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    @keyframes bounce {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.1) rotate(10deg); }
    }

    /* Typing Animation */
    .typing { display: flex; gap: 4px; padding: 12px 16px; background: #334155 !important; width: fit-content; }
    .typing span {
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      animation: blink 1.4s infinite;
    }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes blink {
      0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1); }
    }

    @media (max-width: 1024px) {
      .navbar { padding: 20px 40px; }
      .hero { grid-template-columns: 1fr; padding: 40px; text-align: center; }
      .hero-content { display: flex; flex-direction: column; align-items: center; }
      .title { font-size: 52px; }
      .cta-group { justify-content: center; }
      .hero-viz { margin-top: 40px; transform: scale(0.9); }
    }
    @media (max-width: 768px) {
      .title { font-size: 42px; letter-spacing: -1px; }
      .subtitle { font-size: 16px; margin-bottom: 30px; }
      .cta-group { flex-direction: column; width: 100%; }
      .cta-btn { width: 100%; }
      .hero-viz { transform: scale(0.8); margin-top: 20px; }
      .stats { flex-wrap: wrap; justify-content: center; gap: 20px; }
    }
    @media (max-width: 480px) {
      .navbar { padding: 15px; }
      .logo span { display: none; }
      .title { font-size: 32px; }
      .hero-viz { transform: scale(0.6); margin-left: -20px; }
      .chat-card.secondary { display: none; }
    }
  `
})
export class LandingComponent {}
