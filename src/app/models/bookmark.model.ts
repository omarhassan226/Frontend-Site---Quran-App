export type BookmarkType = 'ayah' | 'surah' | 'hadith' | 'zikr' | 'reflection';

export interface BookmarkItem {
  id: string; // unique identifier (e.g. 'ayah-1-1', 'hadith-64ad9...', 'surah-18')
  type: BookmarkType;
  title: string;
  arabicText: string;
  subtitle?: string;
  sourceUrl: string;
  meta?: any;
  createdAt: string;
}
