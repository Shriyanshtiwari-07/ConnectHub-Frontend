import { Component, inject, signal, computed } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ApiClientService } from '../../core/services/api-client.service';
import { AuthService } from '../../core/services/auth.service';

declare var Razorpay: any;

@Component({
  selector: 'app-pro',
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <div class="pro-container">
      <div class="hero-section">
        <div class="glow"></div>
        <h1 class="gradient-text">Elevate Your Experience</h1>
        <p class="subtitle">Join thousands of users already using ConnectHub Pro to power their communication.</p>
      </div>

      <div class="plans-grid">
        <div class="plan-card" *ngFor="let plan of plans" [class.featured]="plan.featured">
          <div class="featured-badge" *ngIf="plan.featured">MOST POPULAR</div>
          <div class="plan-header">
            <h3>{{ plan.name }}</h3>
            <div class="price-container">
              <span class="currency">₹</span>
              <span class="amount">{{ plan.price }}</span>
              <span class="period">/{{ plan.period }}</span>
            </div>
            <p class="plan-desc">{{ plan.description }}</p>
          </div>
          
          <div class="features-list">
            <div class="feature-item" *ngFor="let feat of plan.features">
              <span class="check">✓</span>
              <span>{{ feat }}</span>
            </div>
          </div>

          <button class="subscribe-btn" (click)="initiateRazorpayCheckout(plan)" [disabled]="loading() || userPlan() === plan.id">
            <span *ngIf="!loading() || activePlanId() !== plan.id">{{ userPlan() === plan.id ? 'Plan Active' : (userPlan() !== 'FREE' && userPlan() !== 'PRO' ? 'Change Plan' : 'Get Started') }}</span>
            <span *ngIf="loading() && activePlanId() === plan.id" class="loading-dots">Preparing</span>
          </button>
        </div>
      </div>

      <!-- Success Popup -->
      <div class="success-overlay" *ngIf="showSuccess()">
        <div class="success-card">
          <div class="success-ring">
             <div class="success-check"></div>
          </div>
          <h2>Subscription Successful!</h2>
          <p>Welcome to <b>ConnectHub Pro</b>. Your exclusive features are now active across all devices.</p>
          <button class="btn-finish" (click)="showSuccess.set(false)">Great, let's go!</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: #334155;
      --success: #22c55e;
    }

    .pro-container {
      padding: 60px 20px;
      min-height: 100%;
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      position: relative;
      overflow-x: hidden;
      overflow-y: auto;
    }

    .glow {
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 400px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }

    .hero-section {
      text-align: center;
      margin-bottom: 80px;
      position: relative;
    }

    .gradient-text {
      font-size: 56px;
      font-weight: 800;
      background: linear-gradient(to right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 20px;
    }

    .subtitle {
      font-size: 18px;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 30px;
      max-width: 1100px;
      margin: 0 auto;
    }

    .plan-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      position: relative;
    }

    .plan-card:hover {
      transform: translateY(-10px);
      border-color: var(--primary);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .plan-card.featured {
      border-color: var(--primary);
      background: linear-gradient(180deg, #1e293b 0%, #1a2333 100%);
      box-shadow: 0 0 40px rgba(99, 102, 241, 0.1);
    }

    .featured-badge {
      position: absolute;
      top: 20px;
      right: 20px;
      background: var(--primary);
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 99px;
      letter-spacing: 1px;
    }

    .plan-header h3 {
      font-size: 20px;
      margin-bottom: 20px;
      color: var(--text-muted);
    }

    .price-container {
      display: flex;
      align-items: baseline;
      margin-bottom: 10px;
    }

    .currency { font-size: 24px; font-weight: 600; margin-right: 4px; }
    .amount { font-size: 48px; font-weight: 800; }
    .period { color: var(--text-muted); font-size: 16px; }

    .plan-desc {
      color: var(--text-muted);
      font-size: 14px;
      margin-bottom: 30px;
    }

    .features-list {
      margin-bottom: 40px;
      flex-grow: 1;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      font-size: 15px;
    }

    .check {
      color: var(--success);
      font-weight: bold;
    }

    .subscribe-btn {
      width: 100%;
      padding: 16px;
      border-radius: 12px;
      border: none;
      background: var(--primary);
      color: white;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .subscribe-btn:hover:not(:disabled) {
      background: var(--primary-dark);
    }

    .subscribe-btn:disabled {
      background: var(--border);
      cursor: not-allowed;
      opacity: 0.7;
    }

    /* Success Styles */
    .success-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .success-card {
      background: var(--card-bg);
      padding: 50px;
      border-radius: 32px;
      text-align: center;
      max-width: 500px;
      border: 1px solid var(--border);
      animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .success-ring {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(34, 197, 94, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 30px;
    }

    .success-check {
      width: 40px;
      height: 20px;
      border-left: 4px solid var(--success);
      border-bottom: 4px solid var(--success);
      transform: rotate(-45deg) translate(5px, -5px);
    }

    .success-card h2 { font-size: 32px; margin-bottom: 16px; }
    .success-card p { color: var(--text-muted); line-height: 1.6; margin-bottom: 32px; }

    .btn-finish {
      padding: 16px 40px;
      border-radius: 12px;
      background: var(--success);
      color: white;
      border: none;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
    }

    .loading-dots:after {
      content: ' .';
      animation: dots 1s steps(5, end) infinite;
    }

    @keyframes dots {
      0%, 20% { color: rgba(0,0,0,0); text-shadow: .25em 0 0 rgba(0,0,0,0), .5em 0 0 rgba(0,0,0,0); }
      40% { color: white; text-shadow: .25em 0 0 rgba(0,0,0,0), .5em 0 0 rgba(0,0,0,0); }
      60% { text-shadow: .25em 0 0 white, .5em 0 0 rgba(0,0,0,0); }
      80%, 100% { text-shadow: .25em 0 0 white, .5em 0 0 white; }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    @media (max-width: 768px) {
      .gradient-text { font-size: 40px; }
      .plans-grid { grid-template-columns: 1fr; }
    }
  `
})
export class ProComponent {
  private readonly api = inject(ApiClientService);
  private readonly auth = inject(AuthService);

  readonly userPlan = computed(() => this.auth.me()?.plan || 'FREE');
  readonly loading = signal(false);
  readonly activePlanId = signal<string | null>(null);
  readonly isPaying = signal(false);
  readonly showSuccess = signal(false);

  readonly plans = [
    {
      id: 'MONTHLY',
      name: 'Monthly',
      price: 499,
      period: 'month',
      description: 'Perfect for getting started with exclusive features.',
      featured: true,
      features: [
        'Unlimited Messages',
        '1GB File Uploads',
        'Custom Profile Themes',
        'Pro Badge',
        'Priority Support'
      ]
    },
    {
      id: 'YEARLY',
      name: 'Yearly',
      price: 4999,
      period: 'year',
      description: 'The best value for power users and teams.',
      featured: false,
      features: [
        'Everything in Monthly',
        'Early Access to Features',
        'Exclusive Beta Testing',
        'Personal Account Manager',
        '2 Months Free'
      ]
    }
  ];

  initiateRazorpayCheckout(plan: any) {
    if (this.loading()) return;
    this.loading.set(true);
    this.activePlanId.set(plan.id);

    this.loadRazorpayScript().then(() => {
      // 1. Create order in backend
      this.api.post<any>('/payments/order', {
        planType: plan.id,
        amount: plan.price
      }).subscribe({
        next: (order) => {
          console.log('Order created from backend:', order);
          this.openRazorpayPopup(order, plan);
        },
        error: (err) => {
          console.error('Order creation failed', err);
          this.loading.set(false);
          this.activePlanId.set(null);
          alert('Failed to initiate payment: ' + (err.error?.error || err.message || 'Unknown error'));
        }
      });
    }).catch(() => {
      this.loading.set(false);
      this.activePlanId.set(null);
      alert('Could not load Razorpay. Please disable ad-blocker for this site and try again.');
    });
  }

  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof (window as any)['Razorpay'] !== 'undefined') {
        resolve();
        return;
      }
      const existingScript = document.getElementById('razorpay-checkout-js');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject());
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

  private openRazorpayPopup(order: any, plan: any) {
    // Use key from backend, fallback to the configured test key
    const rzpKey = order.key || 'rzp_test_SoMlAFxKBepMvx';
    console.log('Using Razorpay key:', rzpKey, '| Order ID:', order.orderId);

    const options = {
      key: rzpKey,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'ConnectHub',
      description: `${plan.name} Subscription`,
      order_id: order.orderId,
      handler: (response: any) => {
        this.verifyPayment(response, plan);
      },
      prefill: {
        name: this.auth.me()?.fullName || '',
        email: this.auth.me()?.email || ''
      },
      theme: {
        color: '#6366f1'
      },
      modal: {
        ondismiss: () => {
          this.loading.set(false);
          this.activePlanId.set(null);
        }
      }
    };

    try {
      const rzp = new (window as any)['Razorpay'](options);
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        this.loading.set(false);
        this.activePlanId.set(null);
        alert('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (e) {
      console.error('Razorpay init error:', e);
      this.loading.set(false);
      this.activePlanId.set(null);
      alert('Could not initialize payment. Please try again.');
    }
  }

  private verifyPayment(razorpayResponse: any, plan: any) {
    this.isPaying.set(true);
    this.loading.set(true);

    this.api.post<any>('/payments/verify', razorpayResponse).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          // Update User Plan in user-service
          this.auth.updatePlan(plan.id).subscribe({
            next: () => {
              this.isPaying.set(false);
              this.loading.set(false);
              this.activePlanId.set(null);
              this.showSuccess.set(true);
            },
            error: (err) => {
              console.error('User plan update failed', err);
              this.isPaying.set(false);
              this.loading.set(false);
              this.activePlanId.set(null);
              alert('Payment verified but failed to update profile. Please contact support.');
            }
          });
        }
      },
      error: (err) => {
        console.error('Payment verification failed', err);
        this.isPaying.set(false);
        this.loading.set(false);
        this.activePlanId.set(null);
        alert('Payment verification failed. If money was deducted, please contact support.');
      }
    });
  }
}
