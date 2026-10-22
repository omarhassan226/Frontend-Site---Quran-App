import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type ActivityAction =
  | 'PAGE_VIEW'
  | 'PLAY_AUDIO'
  | 'READ_SURAH'
  | 'BOOKMARK_ADD'
  | 'BOOKMARK_REMOVE'
  | 'SHARE_LINK'
  | 'DUA_CLICK'
  | 'TASBEEH_CLICK'
  | 'COPY_TEXT';

@Injectable({
  providedIn: 'root',
})
export class ActivityTrackerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/activity/log`;
  private visitorId: string;

  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
  }

  private getOrCreateVisitorId(): string {
    const key = 'quran_visitor_uuid';
    let id = localStorage.getItem(key);
    if (!id) {
      id = 'v_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  }

  getVisitorId(): string {
    return this.visitorId;
  }

  log(action: ActivityAction, title: string, details: any = {}) {
    const payload = {
      visitorId: this.visitorId,
      action,
      title,
      details,
      deviceInfo: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
      },
    };

    // Non-blocking fire-and-forget
    this.http.post(this.apiUrl, payload).subscribe({
      next: () => {},
      error: () => {
        // Silently handle any offline or network error without throwing
      },
    });
  }
}
