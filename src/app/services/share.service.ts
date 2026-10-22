import { Injectable, signal, inject } from '@angular/core';
import { ActivityTrackerService } from './activity-tracker.service';

export interface SharePayload {
  title: string;
  text: string;
  url: string;
  subtitle?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  private tracker = inject(ActivityTrackerService);

  readonly isModalOpen = signal<boolean>(false);
  readonly currentPayload = signal<SharePayload | null>(null);

  openShare(payload: SharePayload) {
    // If url is relative or missing, build full absolute URL
    let fullUrl = payload.url;
    if (typeof window !== 'undefined' && !fullUrl.startsWith('http')) {
      fullUrl = window.location.origin + (payload.url.startsWith('/') ? '' : '/') + payload.url;
    }

    const completePayload: SharePayload = {
      ...payload,
      url: fullUrl,
    };

    this.currentPayload.set(completePayload);
    this.isModalOpen.set(true);

    // Track activity in Dashboard
    this.tracker.log('SHARE_LINK', `مشاركة رابط: ${payload.title}`, {
      title: payload.title,
      url: fullUrl,
      type: payload.type || 'general',
    });
  }

  closeShare() {
    this.isModalOpen.set(false);
  }

  shareNative() {
    const payload = this.currentPayload();
    if (!payload) return;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: payload.title,
          text: payload.text,
          url: payload.url,
        })
        .catch(() => {
          // User cancelled native share
        });
    }
  }

  copyLink(): Promise<boolean> {
    const payload = this.currentPayload();
    if (!payload || typeof navigator === 'undefined') return Promise.resolve(false);

    return navigator.clipboard.writeText(payload.url).then(
      () => true,
      () => false
    );
  }

  copyFullContent(): Promise<boolean> {
    const payload = this.currentPayload();
    if (!payload || typeof navigator === 'undefined') return Promise.resolve(false);

    const fullText = `${payload.title}\n\n«${payload.text}»\n\nالمصدر: ${payload.url}\nمنصة نُورٌ وَهُدَى • صدقة جارية`;
    return navigator.clipboard.writeText(fullText).then(
      () => true,
      () => false
    );
  }
}
