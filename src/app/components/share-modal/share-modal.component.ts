import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareService } from '../../services/share.service';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shareService.isModalOpen()) {
      <div class="share-modal-overlay" (click)="onOverlayClick($event)">
        <div class="share-modal-box card-glass">
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-title-row">
              <div class="share-header-icon">
                <i class="fa-solid fa-share-nodes"></i>
              </div>
              <div>
                <h3 class="modal-title">مشاركة الخير ونشره</h3>
                <span class="modal-subtitle">«الدَّالُّ عَلَى الخَيْرِ كَفَاعِلِهِ» • صدقة جارية مباركة</span>
              </div>
            </div>
            <button class="close-btn" (click)="shareService.closeShare()" title="إغلاق">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Content Preview -->
          @if (shareService.currentPayload(); as payload) {
            <div class="preview-box">
              <span class="preview-title">{{ payload.title }}</span>
              <p class="preview-text font-hadith">«{{ payload.text }}»</p>
              @if (payload.subtitle) {
                <span class="preview-sub">{{ payload.subtitle }}</span>
              }
            </div>

            <!-- Direct URL Copy -->
            <div class="link-copy-section">
              <label class="section-label">رابط المشاركة المباشر:</label>
              <div class="copy-input-group">
                <input type="text" [value]="payload.url" readonly class="copy-input" />
                <button
                  type="button"
                  class="btn-primary copy-btn"
                  [class.copied]="copiedLink()"
                  (click)="handleCopyLink()"
                >
                  <i class="fa-solid" [class.fa-check]="copiedLink()" [class.fa-copy]="!copiedLink()"></i>
                  <span>{{ copiedLink() ? 'تم النسخ!' : 'نسخ الرابط' }}</span>
                </button>
              </div>
            </div>

            <!-- Social Share Channels -->
            <div class="social-channels-grid">
              <a
                [href]="getWhatsappUrl(payload)"
                target="_blank"
                rel="noopener noreferrer"
                class="social-btn whatsapp-btn"
              >
                <i class="fa-brands fa-whatsapp"></i>
                <span>واتساب</span>
              </a>

              <a
                [href]="getTelegramUrl(payload)"
                target="_blank"
                rel="noopener noreferrer"
                class="social-btn telegram-btn"
              >
                <i class="fa-brands fa-telegram"></i>
                <span>تيليجرام</span>
              </a>

              <a
                [href]="getTwitterUrl(payload)"
                target="_blank"
                rel="noopener noreferrer"
                class="social-btn twitter-btn"
              >
                <i class="fa-brands fa-x-twitter"></i>
                <span>منصة X</span>
              </a>

              <a
                [href]="getFacebookUrl(payload)"
                target="_blank"
                rel="noopener noreferrer"
                class="social-btn facebook-btn"
              >
                <i class="fa-brands fa-facebook"></i>
                <span>فيسبوك</span>
              </a>
            </div>

            <!-- Copy Full Text Button -->
            <div class="modal-footer-actions">
              <button
                type="button"
                class="btn-ghost full-copy-btn"
                [class.copied]="copiedFull()"
                (click)="handleCopyFull()"
              >
                <i class="fa-solid" [class.fa-check]="copiedFull()" [class.fa-file-lines]="!copiedFull()"></i>
                <span>{{ copiedFull() ? 'تم نسخ النص الكامل والرابط!' : 'نسخ النص كاملاً مع الرابط' }}</span>
              </button>

              @if (hasNativeShare) {
                <button type="button" class="btn-primary native-share-btn" (click)="shareService.shareNative()">
                  <i class="fa-solid fa-arrow-up-from-bracket"></i>
                  <span>مشاركة عبر تطبيقات الجهاز</span>
                </button>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .share-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 16px;
      animation: overlayFadeIn 0.25s ease-out;
    }

    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .share-modal-box {
      width: 100%;
      max-width: 580px;
      background: rgba(15, 23, 42, 0.96);
      border: 1.5px solid var(--border-emerald);
      border-radius: var(--radius-xl);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
      padding: 28px;
      animation: modalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      max-height: 90vh;
      overflow-y: auto;
    }

    @keyframes modalScaleUp {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .header-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .share-header-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: rgba(16, 185, 129, 0.15);
      color: var(--primary-emerald-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      border: 1px solid var(--border-emerald);
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
    }

    .modal-subtitle {
      font-size: 0.8rem;
      color: var(--gold-light);
    }

    .close-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .preview-box {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 16px;
      margin-bottom: 20px;
    }

    .preview-title {
      display: block;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--gold-light);
      margin-bottom: 8px;
    }

    .preview-text {
      font-size: 1.05rem;
      color: var(--text-main);
      line-height: 1.8;
      max-height: 120px;
      overflow-y: auto;
      margin: 0;
    }

    .preview-sub {
      display: block;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 8px;
    }

    .section-label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 8px;
      font-weight: 600;
    }

    .copy-input-group {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }

    .copy-input {
      flex: 1;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      padding: 10px 14px;
      font-size: 0.85rem;
      font-family: monospace;
      outline: none;
      direction: ltr;
      text-align: left;
    }

    .copy-btn {
      white-space: nowrap;
      padding: 10px 18px;
      border-radius: var(--radius-md);
      font-size: 0.9rem;
    }

    .copy-btn.copied {
      background: #047857 !important;
    }

    .social-channels-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }

    .social-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px 8px;
      border-radius: var(--radius-md);
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .social-btn i {
      font-size: 1.5rem;
    }

    .social-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    .whatsapp-btn {
      background: #25d366;
    }

    .telegram-btn {
      background: #0088cc;
    }

    .twitter-btn {
      background: #000000;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .facebook-btn {
      background: #1877f2;
    }

    .modal-footer-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .full-copy-btn {
      width: 100%;
      justify-content: center;
      padding: 10px;
      border-radius: var(--radius-md);
      font-size: 0.9rem;
    }

    .full-copy-btn.copied {
      color: var(--primary-emerald-light);
      border-color: var(--primary-emerald);
    }

    .native-share-btn {
      width: 100%;
      justify-content: center;
      padding: 11px;
      border-radius: var(--radius-md);
    }

    @media (max-width: 480px) {
      .social-channels-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* Light Theme Overrides */
    :host-context(.light-theme) .share-modal-box {
      background: #ffffff;
      border-color: rgba(5, 150, 105, 0.3);
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.18);
    }

    :host-context(.light-theme) .modal-title {
      color: #0f172a;
    }

    :host-context(.light-theme) .modal-subtitle {
      color: #b45309;
    }

    :host-context(.light-theme) .preview-box {
      background: #f8fafc;
      border-color: rgba(15, 23, 42, 0.08);
    }

    :host-context(.light-theme) .preview-title {
      color: #b45309;
    }

    :host-context(.light-theme) .preview-text {
      color: #0f172a;
    }

    :host-context(.light-theme) .copy-input {
      background: #f1f5f9;
      border-color: rgba(15, 23, 42, 0.12);
      color: #334155;
    }

    :host-context(.light-theme) .twitter-btn {
      background: #0f172a;
    }
  `]
})
export class ShareModalComponent {
  readonly shareService = inject(ShareService);

  readonly copiedLink = signal(false);
  readonly copiedFull = signal(false);

  readonly hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  onOverlayClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('share-modal-overlay')) {
      this.shareService.closeShare();
    }
  }

  handleCopyLink() {
    this.shareService.copyLink().then((ok) => {
      if (ok) {
        this.copiedLink.set(true);
        setTimeout(() => this.copiedLink.set(false), 2500);
      }
    });
  }

  handleCopyFull() {
    this.shareService.copyFullContent().then((ok) => {
      if (ok) {
        this.copiedFull.set(true);
        setTimeout(() => this.copiedFull.set(false), 2500);
      }
    });
  }

  getWhatsappUrl(payload: any): string {
    const msg = `*${payload.title}*\n\n«${payload.text}»\n\n🔗 ${payload.url}\n\n_منصة نُورٌ وَهُدَى • صدقة جارية_`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  }

  getTelegramUrl(payload: any): string {
    const msg = `*${payload.title}*\n\n«${payload.text}»\n\nمنصة نُورٌ وَهُدَى`;
    return `https://t.me/share/url?url=${encodeURIComponent(payload.url)}&text=${encodeURIComponent(msg)}`;
  }

  getTwitterUrl(payload: any): string {
    const msg = `${payload.title}\n\n«${payload.text}»\n\nمنصة نُورٌ وَهُدَى`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(payload.url)}`;
  }

  getFacebookUrl(payload: any): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(payload.url)}`;
  }
}
