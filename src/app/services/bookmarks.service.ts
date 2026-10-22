import { Injectable, signal, computed, inject } from '@angular/core';
import { BookmarkItem, BookmarkType } from '../models/bookmark.model';
import { ActivityTrackerService } from './activity-tracker.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarksService {
  private readonly STORAGE_KEY = 'quran_sunnah_user_bookmarks_v1';
  private tracker = inject(ActivityTrackerService);

  readonly bookmarks = signal<BookmarkItem[]>(this.loadFromStorage());
  readonly count = computed(() => this.bookmarks().length);

  private loadFromStorage(): BookmarkItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: BookmarkItem[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save bookmarks to localStorage', e);
    }
  }

  isBookmarked(id: string): boolean {
    return this.bookmarks().some((item) => item.id === id);
  }

  toggleBookmark(item: BookmarkItem): boolean {
    if (this.isBookmarked(item.id)) {
      this.removeBookmark(item.id);
      return false;
    } else {
      this.addBookmark(item);
      return true;
    }
  }

  addBookmark(item: BookmarkItem) {
    if (this.isBookmarked(item.id)) return;

    const updated = [
      {
        ...item,
        createdAt: new Date().toISOString(),
      },
      ...this.bookmarks(),
    ];

    this.bookmarks.set(updated);
    this.saveToStorage(updated);

    // Track activity in Dashboard
    this.tracker.log('BOOKMARK_ADD', `حفظ في المحفوظات: ${item.title}`, {
      type: item.type,
      id: item.id,
      title: item.title,
    });
  }

  removeBookmark(id: string) {
    const item = this.bookmarks().find((b) => b.id === id);
    const updated = this.bookmarks().filter((b) => b.id !== id);
    this.bookmarks.set(updated);
    this.saveToStorage(updated);

    if (item) {
      this.tracker.log('BOOKMARK_REMOVE', `إزالة من المحفوظات: ${item.title}`, {
        type: item.type,
        id,
      });
    }
  }

  clearAll() {
    this.bookmarks.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getByType(type?: BookmarkType): BookmarkItem[] {
    if (!type || type === ('all' as any)) return this.bookmarks();
    return this.bookmarks().filter((b) => b.type === type);
  }
}
