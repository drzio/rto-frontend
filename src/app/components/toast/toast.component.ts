import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" class="toast" [ngClass]="toast.type">
        <div class="toast-icon">
          <i class="fa-solid" 
             [ngClass]="{'fa-check-circle': toast.type === 'success', 
                         'fa-circle-exclamation': toast.type === 'error', 
                         'fa-info-circle': toast.type === 'info'}">
          </i>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" (click)="removeToast(toast)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 100px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .toast {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      min-width: 320px;
      max-width: 420px;
      padding: 16px 20px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
      animation: slideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      pointer-events: auto;
      overflow: hidden;
      border-left: 4px solid;
    }

    /* Types */
    .toast.success { border-left-color: #2CA58D; }
    .toast.success .toast-icon { color: #2CA58D; }

    .toast.error { border-left-color: #ef4444; }
    .toast.error .toast-icon { color: #ef4444; }

    .toast.info { border-left-color: #3b82f6; }
    .toast.info .toast-icon { color: #3b82f6; }

    .toast-icon {
      font-size: 1.25rem;
      margin-right: 14px;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 1.3rem;
      color: #94a3b8;
      cursor: pointer;
      margin-left: 12px;
      transition: color 0.2s;
      padding: 0 4px;
    }

    .toast-close:hover {
      color: #1e293b;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription = new Subscription();
  private toastService = inject(ToastService);

  ngOnInit() {
    this.subscription = this.toastService.toastState.subscribe((toast) => {
      this.addToast(toast);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addToast(toast: Toast) {
    const id = Date.now();
    const newToast = { ...toast, id };
    this.toasts.push(newToast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      this.removeToast(newToast);
    }, 4000);
  }

  removeToast(toast: any) {
    this.toasts = this.toasts.filter(t => t.id !== toast.id);
  }
}
