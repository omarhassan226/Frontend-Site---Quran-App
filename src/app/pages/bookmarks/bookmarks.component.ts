import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookmarksService } from '../../services/bookmarks.service';
import { ShareService } from '../../services/share.service';
import { BookmarkItem, BookmarkType } from '../../models/bookmark.model';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="bookmarks-page container">
      <!-- Header -->
      <header class="bookmarks-header text-center">
        <div class="header-badge">
          <i class="fa-solid fa-bookmark"></i>
          <span>محفوظاتي الإيمانية</span>
        </div>
        <h1 class="page-title">قائمة المحفوظات والمفضلة</h1>
        <p class="page-subtitle">
          مستودعك الشخصي من الآيات الكريمة، والأحاديث النبوية، والأذكار، والمواعظ التي قمت بحفظها لتعود إليها في أي وقت.
        </p>

        <div class="header-stats-row">
          <span class="count-badge">
            <i class="fa-solid fa-layer-group"></i> إجمالي المحفوظات: <strong>{{ bookmarksService.count() }}</strong>
          </span>

          @if (bookmarksService.count() > 0) {
            <button type="button" class="btn-ghost clear-all-btn" (click)="confirmClearAll()">
              <i class="fa-solid fa-trash-can"></i>
              <span>مسح كافة المحفوظات</span>
            </button>
          }
        </div>
      </header>

      <!-- Filter Tabs & Search Bar -->
      <div class="filters-bar card-glass">
        <div class="category-tabs">
          @for (tab of tabs; track tab.key) {
            <button
              type="button"
              class="tab-btn"
              [class.active]="selectedTab() === tab.key"
              (click)="selectedTab.set(tab.key)"
            >
              <i [class]="tab.icon"></i>
              <span>{{ tab.label }}</span>
              <span class="tab-count-pill">{{ getCountForTab(tab.key) }}</span>
            </button>
          }
        </div>

        <div class="search-wrap">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="ابحث في محفوظاتك بالكلمة..."
            class="search-input"
          />
          @if (searchQuery) {
            <button class="clear-btn" (click)="searchQuery = ''">
              <i class="fa-solid fa-xmark"></i>
            </button>
          }
        </div>
      </div>

      <!-- Bookmarks List -->
      @if (filteredItems().length > 0) {
        <div class="bookmarks-grid">
          @for (item of filteredItems(); track item.id) {
            <div class="bookmark-card card-glass">
              <div class="card-top-row">
                <span class="type-badge" [class]="item.type">
                  <i [class]="getTypeIcon(item.type)"></i>
                  <span>{{ getTypeLabel(item.type) }}</span>
                </span>
                <span class="date-text">
                  <i class="fa-regular fa-clock"></i> {{ formatDate(item.createdAt) }}
                </span>
              </div>

              <h3 class="card-title">{{ item.title }}</h3>
              <p class="card-arabic-text" [class.font-quran]="item.type === 'ayah' || item.type === 'surah'" [class.font-hadith]="item.type === 'hadith' || item.type === 'zikr'">
                «{{ item.arabicText }}»
              </p>

              @if (item.subtitle) {
                <span class="card-subtitle">{{ item.subtitle }}</span>
              }

              <!-- Card Action Buttons -->
              <div class="card-actions">
                <a [routerLink]="item.sourceUrl" class="btn-primary action-btn">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                  <span>الانتقال للمصدر</span>
                </a>

                <button
                  type="button"
                  class="btn-ghost action-btn"
                  (click)="openShare(item)"
                  title="مشاركة الرابط"
                >
                  <i class="fa-solid fa-share-nodes"></i>
                  <span>مشاركة</span>
                </button>

                <button
                  type="button"
                  class="btn-ghost action-btn"
                  (click)="copyText(item)"
                  title="نسخ النص"
                >
                  <i class="fa-solid fa-copy"></i>
                  <span>نسخ</span>
                </button>

                <button
                  type="button"
                  class="btn-danger-ghost action-btn remove-btn"
                  (click)="removeItem(item.id)"
                  title="إزالة من المحفوظات"
                >
                  <i class="fa-solid fa-trash"></i>
                  <span>إزالة</span>
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Empty State -->
        <div class="empty-state-box card-glass">
          <div class="empty-icon-circle">
            <i class="fa-solid fa-bookmark"></i>
          </div>
          @if (searchQuery) {
            <h3 class="empty-title">لا توجد محفوظات تطابق بحثك "{{ searchQuery }}"</h3>
            <p class="empty-desc">جرّب البحث بكلمة أخرى أو تصفح باقي الأقسام.</p>
            <button class="btn-primary" (click)="searchQuery = ''">
              <i class="fa-solid fa-rotate-left"></i> إلغاء تصفية البحث
            </button>
          } @else if (bookmarksService.count() === 0) {
            <h3 class="empty-title">قائمة محفوظاتك فارغة حالياً</h3>
            <p class="empty-desc">
              يمكنك حفظ أي آية كريمة، أو حديث نبوي، أو ذكر، أو موعظة بالضغط على زر الحفظ
              <i class="fa-solid fa-bookmark" style="color: var(--primary-emerald-light);"></i>
              أثناء تصفحك للمنصة لتبقى محفوظة لك هنا دائماً.
            </p>
            <div class="empty-links-row">
              <a routerLink="/quran" class="btn-primary">
                <i class="fa-solid fa-book-quran"></i> تصفح القرآن الكريم
              </a>
              <a routerLink="/hadiths" class="btn-ghost">
                <i class="fa-solid fa-scroll"></i> الأحاديث النبوية
              </a>
              <a routerLink="/azkar" class="btn-ghost">
                <i class="fa-solid fa-hands-praying"></i> أذكار المسلم
              </a>
            </div>
          } @else {
            <h3 class="empty-title">لا توجد عناصر محفوظة في هذا القسم</h3>
            <p class="empty-desc">اختر قسماً آخر أو اختر «الكل» لعرض جميع المحفوظات.</p>
            <button class="btn-primary" (click)="selectedTab.set('all')">
              عرض كل المحفوظات
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .bookmarks-page {
      padding: 40px 20px 80px 20px;
    }

    .bookmarks-header {
      margin-bottom: 40px;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: var(--radius-full);
      background: rgba(16, 185, 129, 0.12);
      color: var(--primary-emerald-light);
      font-weight: 700;
      font-size: 0.88rem;
      border: 1px solid var(--border-emerald);
      margin-bottom: 14px;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 12px;
    }

    .page-subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 650px;
      margin: 0 auto 20px auto;
      line-height: 1.8;
    }

    .header-stats-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .count-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      background: rgba(217, 119, 6, 0.15);
      color: var(--gold-light);
      font-size: 0.88rem;
      border: 1px solid var(--border-gold);
    }

    .clear-all-btn {
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
      font-size: 0.85rem;
      padding: 6px 14px;
    }

    .clear-all-btn:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: #ef4444;
      color: #f87171;
    }

    /* Filters Bar */
    .filters-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 20px;
      border-radius: var(--radius-lg);
      margin-bottom: 35px;
      flex-wrap: wrap;
    }

    .category-tabs {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
      font-size: 0.88rem;
      font-weight: 600;
      border: 1px solid var(--border-subtle);
      transition: all 0.2s;
    }

    .tab-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.1);
    }

    .tab-btn.active {
      background: var(--primary-emerald);
      color: #ffffff;
      border-color: var(--primary-emerald);
    }

    .tab-count-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: var(--radius-full);
      background: rgba(0, 0, 0, 0.25);
      font-size: 0.72rem;
      font-weight: 700;
    }

    .search-wrap {
      position: relative;
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
      padding: 4px 14px;
      min-width: 250px;
    }

    .search-wrap:focus-within {
      border-color: var(--primary-emerald);
    }

    .search-icon {
      color: var(--text-muted);
      margin-left: 8px;
      font-size: 0.85rem;
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-main);
      font-size: 0.88rem;
      font-family: inherit;
      padding: 6px 0;
    }

    .clear-btn {
      color: var(--text-muted);
      padding: 2px 6px;
      font-size: 0.85rem;
    }

    /* Grid */
    .bookmarks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
    }

    .bookmark-card {
      display: flex;
      flex-direction: column;
      padding: 24px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      transition: all 0.25s ease;
      position: relative;
    }

    .bookmark-card:hover {
      border-color: var(--primary-emerald);
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    }

    .card-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-full);
    }

    .type-badge.ayah {
      background: rgba(16, 185, 129, 0.15);
      color: var(--primary-emerald-light);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .type-badge.surah {
      background: rgba(217, 119, 6, 0.15);
      color: var(--gold-light);
      border: 1px solid rgba(217, 119, 6, 0.3);
    }

    .type-badge.hadith {
      background: rgba(59, 130, 246, 0.15);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .type-badge.zikr {
      background: rgba(236, 72, 153, 0.15);
      color: #f472b6;
      border: 1px solid rgba(236, 72, 153, 0.3);
    }

    .type-badge.reflection {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .date-text {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .card-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 12px;
    }

    .card-arabic-text {
      font-size: 1.25rem;
      color: var(--text-gold);
      line-height: 1.9;
      margin-bottom: 16px;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-subtitle {
      display: block;
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 18px;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      padding-top: 14px;
      border-top: 1px solid var(--border-subtle);
    }

    .action-btn {
      padding: 7px 12px;
      font-size: 0.82rem;
      border-radius: var(--radius-md);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .remove-btn {
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.25);
      background: transparent;
      margin-right: auto;
    }

    .remove-btn:hover {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
    }

    /* Empty State */
    .empty-state-box {
      text-align: center;
      padding: 70px 20px;
      border-radius: var(--radius-xl);
      max-width: 650px;
      margin: 0 auto;
    }

    .empty-icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.12);
      color: var(--primary-emerald-light);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      margin-bottom: 20px;
      border: 1px solid var(--border-emerald);
    }

    .empty-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 10px;
    }

    .empty-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.8;
      margin-bottom: 25px;
    }

    .empty-links-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Light Theme Overrides */
    :host-context(.light-theme) .page-title {
      color: #0f172a;
    }

    :host-context(.light-theme) .page-subtitle {
      color: #475569;
    }

    :host-context(.light-theme) .filters-bar {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.08);
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
    }

    :host-context(.light-theme) .tab-btn {
      background: #f1f5f9;
      color: #475569;
      border-color: rgba(15, 23, 42, 0.1);
    }

    :host-context(.light-theme) .tab-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    :host-context(.light-theme) .tab-btn.active {
      background: #059669;
      color: #ffffff;
      border-color: #059669;
    }

    :host-context(.light-theme) .search-wrap {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.14);
    }

    :host-context(.light-theme) .search-input {
      color: #0f172a;
    }

    :host-context(.light-theme) .bookmark-card {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.08);
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
    }

    :host-context(.light-theme) .bookmark-card:hover {
      border-color: #059669;
      box-shadow: 0 10px 30px rgba(5, 150, 105, 0.1);
    }

    :host-context(.light-theme) .card-title {
      color: #0f172a;
    }

    :host-context(.light-theme) .card-arabic-text {
      color: #92400e;
    }

    :host-context(.light-theme) .empty-state-box {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.08);
    }

    :host-context(.light-theme) .empty-title {
      color: #0f172a;
    }

    @media (max-width: 600px) {
      .bookmarks-grid {
        grid-template-columns: 1fr;
      }
      .filters-bar {
        flex-direction: column;
        align-items: stretch;
      }
      .search-wrap {
        width: 100%;
      }
    }
  `]
})
export class BookmarksComponent {
  readonly bookmarksService = inject(BookmarksService);
  private shareService = inject(ShareService);

  readonly selectedTab = signal<string>('all');
  searchQuery = '';

  readonly tabs = [
    { key: 'all', label: 'الكل', icon: 'fa-solid fa-layer-group' },
    { key: 'ayah', label: 'آيات كريمة', icon: 'fa-solid fa-book-quran' },
    { key: 'surah', label: 'سور قرآنية', icon: 'fa-solid fa-quran' },
    { key: 'hadith', label: 'أحاديث نبوية', icon: 'fa-solid fa-scroll' },
    { key: 'zikr', label: 'أذكار المسلم', icon: 'fa-solid fa-hands-praying' },
    { key: 'reflection', label: 'رقائق ومواعظ', icon: 'fa-solid fa-feather-pointed' },
  ];

  readonly filteredItems = computed(() => {
    let items = this.bookmarksService.bookmarks();
    const currentTab = this.selectedTab();
    if (currentTab !== 'all') {
      items = items.filter((item) => item.type === currentTab);
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.arabicText.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q))
      );
    }

    return items;
  });

  getCountForTab(tabKey: string): number {
    if (tabKey === 'all') return this.bookmarksService.count();
    return this.bookmarksService.bookmarks().filter((b) => b.type === tabKey).length;
  }

  getTypeLabel(type: BookmarkType): string {
    switch (type) {
      case 'ayah': return 'آية كريمة';
      case 'surah': return 'سورة قرآنية';
      case 'hadith': return 'حديث نبوي';
      case 'zikr': return 'ذكر مأثور';
      case 'reflection': return 'رقائق وموعظة';
      default: return 'مفضلة';
    }
  }

  getTypeIcon(type: BookmarkType): string {
    switch (type) {
      case 'ayah': return 'fa-solid fa-book-quran';
      case 'surah': return 'fa-solid fa-quran';
      case 'hadith': return 'fa-solid fa-scroll';
      case 'zikr': return 'fa-solid fa-hands-praying';
      case 'reflection': return 'fa-solid fa-feather-pointed';
      default: return 'fa-solid fa-bookmark';
    }
  }

  formatDate(isoString: string): string {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  }

  removeItem(id: string) {
    this.bookmarksService.removeBookmark(id);
  }

  confirmClearAll() {
    if (confirm('هل أنت متأكد من مسح كافة العناصر المحفوظة في المفضلة؟')) {
      this.bookmarksService.clearAll();
    }
  }

  openShare(item: BookmarkItem) {
    this.shareService.openShare({
      title: item.title,
      text: item.arabicText,
      url: item.sourceUrl,
      subtitle: item.subtitle,
      type: item.type,
    });
  }

  copyText(item: BookmarkItem) {
    const textToCopy = `${item.title}\n«${item.arabicText}»\n${item.subtitle ? item.subtitle + '\n' : ''}منصة نُورٌ وَهُدَى • صدقة جارية`;
    navigator.clipboard.writeText(textToCopy);
    alert('تم نسخ النص بنجاح');
  }
}
