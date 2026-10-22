import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { BookmarksService } from '../../services/bookmarks.service';
import { ShareService } from '../../services/share.service';
import { ActivityTrackerService } from '../../services/activity-tracker.service';
import { Zikr } from '../../models/zikr.model';

@Component({
  selector: 'app-azkar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="azkar-page-wrapper container">
      <!-- Header -->
      <header class="azkar-header">
        <span class="badge badge-emerald"><i class="fa-solid fa-hands-praying"></i> حصن المسلم</span>
        <h1 class="page-title">الأذكار والأدعية اليومية</h1>
        <p class="page-subtitle">
          حصّن يومك وليلتك بأذكار المصطفى ﷺ، واجعل لسانك رطباً بذكر الله مع العداد التفاعلي الذكي.
        </p>

        <!-- Category Nav Tabs -->
        <div class="category-tabs-container">
          @for (cat of categories; track cat) {
            <button
              class="cat-tab-btn"
              [class.active]="selectedCategory === cat"
              (click)="selectCategory(cat)"
            >
              {{ cat }}
            </button>
          }
        </div>
      </header>

      <!-- Azkar List -->
      @if (loading) {
        <div class="loading-state">
          <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
          <p>جاري تحميل الأذكار الشريفة...</p>
        </div>
      } @else {
        <div class="azkar-cards-column">
          @for (zikr of azkar; track zikr._id || zikr.text; let idx = $index) {
            <div
              class="zikr-card card-glass"
              [class.completed-zikr]="zikr.completed"
            >
              <div class="zikr-card-header">
                <span class="zikr-order-badge">#{{ idx + 1 }}</span>
                <span class="badge badge-gold">
                  التكرار المطلوب: {{ zikr.count }} {{ zikr.count === 1 ? 'مرة' : 'مرات' }}
                </span>
                <div class="card-action-bar">
                  <button
                    class="btn-action"
                    [class.btn-action-active]="isZikrBookmarked(zikr)"
                    (click)="toggleZikrBookmark(zikr)"
                    [title]="isZikrBookmarked(zikr) ? 'إزالة من المحفوظات' : 'حفظ في المفضلة'"
                  >
                    <i class="fa-solid" [class.fa-bookmark]="isZikrBookmarked(zikr)" [class.fa-bookmark-regular]="!isZikrBookmarked(zikr)"></i>
                  </button>
                  <button class="btn-action" (click)="shareZikr(zikr)" title="مشاركة الذكر">
                    <i class="fa-solid fa-share-nodes"></i>
                  </button>
                  <button class="btn-action" (click)="copyZikr(zikr)" title="نسخ الذكر">
                    <i class="fa-regular fa-copy"></i>
                  </button>
                </div>
              </div>

              <!-- Zikr Arabic Text -->
              <p class="zikr-text font-hadith">
                {{ zikr.text }}
              </p>

              <!-- Benefit / Faddl -->
              @if (zikr.benefit) {
                <div class="zikr-benefit-box">
                  <span class="benefit-badge"><i class="fa-solid fa-sparkles"></i> فضل الذكر:</span>
                  <p>{{ zikr.benefit }}</p>
                </div>
              }

              <!-- Reference & Counter Action -->
              <div class="zikr-card-footer">
                <span class="zikr-reference">
                  <i class="fa-solid fa-book"></i> {{ zikr.reference || 'صحيح الأذكار' }}
                </span>

                <div class="counter-actions-wrapper">
                  <button
                    class="btn-tasbeeh-count"
                    [class.completed-btn]="zikr.completed"
                    (click)="countZikr(zikr)"
                  >
                    @if (zikr.completed) {
                      <i class="fa-solid fa-check"></i>
                      <span>اكتمل الذكر</span>
                    } @else {
                      <span class="count-num">{{ zikr.currentCount }}</span>
                      <span class="count-sub">اضغط للتسبيح</span>
                    }
                  </button>

                  <button
                    class="btn-reset-counter"
                    (click)="resetZikr(zikr)"
                    title="إعادة ضبط العداد"
                  >
                    <i class="fa-solid fa-rotate-right"></i>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .azkar-page-wrapper {
      padding: 50px 20px 80px 20px;
      max-width: 1350px;
    }

    .azkar-header {
      text-align: center;
      margin-bottom: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .page-title {
      font-size: 2.3rem;
      font-weight: 900;
      color: var(--text-main);
      margin-top: 12px;
      margin-bottom: 10px;
    }

    .page-subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 650px;
      margin-bottom: 30px;
    }

    .category-tabs-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .cat-tab-btn {
      padding: 9px 20px;
      border-radius: var(--radius-full);
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      transition: all 0.2s;
    }

    .cat-tab-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-main);
    }

    .cat-tab-btn.active {
      background: linear-gradient(135deg, var(--primary-emerald), #047857);
      color: #ffffff;
      border-color: var(--primary-emerald);
      box-shadow: 0 4px 15px var(--primary-emerald-glow);
    }

    /* Azkar Cards */
    .azkar-cards-column {
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .zikr-card {
      padding: 28px;
      border-radius: var(--radius-lg);
      transition: all 0.25s ease;
    }

    .zikr-card.completed-zikr {
      border-color: var(--primary-emerald);
      background: rgba(16, 185, 129, 0.06);
    }

    .zikr-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .zikr-order-badge {
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--text-muted);
    }

    .zikr-text {
      font-size: 1.35rem;
      line-height: 2.2;
      color: var(--text-main);
      margin-bottom: 18px;
    }

    .zikr-benefit-box {
      background: rgba(245, 158, 11, 0.06);
      border-right: 3px solid var(--gold-accent);
      border-radius: var(--radius-sm);
      padding: 12px 18px;
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1.7;
      margin-bottom: 20px;
    }

    .benefit-badge {
      display: block;
      color: var(--gold-light);
      font-weight: 700;
      margin-bottom: 3px;
    }

    .zikr-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 16px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .zikr-reference {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .counter-actions-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-tasbeeh-count {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 110px;
      height: 52px;
      padding: 6px 18px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary-emerald), #047857);
      color: #ffffff;
      box-shadow: 0 4px 15px var(--primary-emerald-glow);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-tasbeeh-count:hover {
      transform: scale(1.04);
    }

    .btn-tasbeeh-count:active {
      transform: scale(0.96);
    }

    .count-num {
      font-size: 1.3rem;
      font-weight: 900;
      line-height: 1.1;
    }

    .count-sub {
      font-size: 0.7rem;
      opacity: 0.85;
    }

    .completed-btn {
      background: #064e3b !important;
      box-shadow: none !important;
      flex-direction: row !important;
      gap: 6px;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .btn-reset-counter {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-reset-counter:hover {
      background: rgba(255, 255, 255, 0.12);
      color: var(--text-main);
      transform: rotate(180deg);
    }

    /* Light Theme Enhancements for Azkar */
    :host-context(.light-theme) .azkar-header .page-title {
      color: #0f172a;
    }

    :host-context(.light-theme) .azkar-header .page-subtitle {
      color: #334155;
    }

    :host-context(.light-theme) .cat-tab-btn {
      background: #f1f5f9;
      color: #475569;
      border-color: rgba(15, 23, 42, 0.1);
    }

    :host-context(.light-theme) .cat-tab-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    :host-context(.light-theme) .cat-tab-btn.active {
      background: #059669;
      color: #ffffff;
      border-color: #059669;
    }

    :host-context(.light-theme) .zikr-card {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.08);
      box-shadow: 0 2px 14px rgba(15, 23, 42, 0.04);
    }

    :host-context(.light-theme) .zikr-card.completed {
      background: rgba(16, 185, 129, 0.06);
      border-color: #059669;
    }

    :host-context(.light-theme) .zikr-text {
      color: #0f172a;
    }

    :host-context(.light-theme) .virtue-box {
      background: rgba(245, 158, 11, 0.08);
      border-color: rgba(217, 119, 6, 0.25);
      color: #92400e;
    }

    .card-action-bar {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-action {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      border-radius: 8px;
      padding: 6px 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.88rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-action:hover {
      background: rgba(255, 255, 255, 0.12);
      color: var(--gold-light);
      border-color: rgba(212, 175, 55, 0.3);
    }

    .btn-action-active {
      color: #f59e0b !important;
      border-color: rgba(245, 158, 11, 0.5) !important;
      background: rgba(245, 158, 11, 0.12) !important;
    }

    :host-context(.light-theme) .btn-action {
      background: #f1f5f9;
      color: #475569;
      border-color: rgba(15, 23, 42, 0.1);
    }

    :host-context(.light-theme) .btn-action:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    :host-context(.light-theme) .btn-action-active {
      background: #fef3c7 !important;
      color: #d97706 !important;
      border-color: #f59e0b !important;
    }

    :host-context(.light-theme) .btn-reset-counter {
      background: #f1f5f9;
      color: #475569;
    }

    :host-context(.light-theme) .btn-reset-counter:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  `]
})
export class AzkarComponent implements OnInit {
  private api = inject(ApiService);
  bookmarks = inject(BookmarksService);
  shareService = inject(ShareService);
  tracker = inject(ActivityTrackerService);

  categories: string[] = [
    'أذكار الصباح',
    'أذكار المساء',
    'أذكار النوم',
    'أذكار بعد الصلاة',
    'أدعية للمتوفى والصدقة الجارية',
  ];
  selectedCategory = 'أذكار الصباح';
  azkar: Zikr[] = [];
  loading = true;

  ngOnInit() {
    this.loadAzkar();
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.loadAzkar();
  }

  loadAzkar() {
    this.loading = true;
    this.api.getAzkar(this.selectedCategory).subscribe({
      next: (res) => {
        if (res.data) {
          this.azkar = res.data.map((z) => ({
            ...z,
            currentCount: z.count,
            completed: false,
          }));
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  countZikr(zikr: Zikr) {
    if (zikr.completed) return;

    if (zikr.currentCount && zikr.currentCount > 1) {
      zikr.currentCount--;
    } else {
      zikr.currentCount = 0;
      zikr.completed = true;
    }

    // Increment global tasbeeh charity counter
    this.api.recordTasbeeh(1).subscribe();

    // Log tasbeeh activity
    this.tracker.log('TASBEEH_CLICK', `تسبيح: ${this.selectedCategory}`, {
      category: this.selectedCategory,
    });
  }

  resetZikr(zikr: Zikr) {
    zikr.currentCount = zikr.count;
    zikr.completed = false;
  }

  copyZikr(zikr: Zikr) {
    navigator.clipboard.writeText(zikr.text);
    alert('تم نسخ الذكر بنجاح');
  }

  private getZikrId(zikr: Zikr): string {
    return zikr._id ? `zikr-${zikr._id}` : `zikr-${this.selectedCategory}-${encodeURIComponent(zikr.text.substring(0, 20))}`;
  }

  isZikrBookmarked(zikr: Zikr): boolean {
    return this.bookmarks.isBookmarked(this.getZikrId(zikr));
  }

  toggleZikrBookmark(zikr: Zikr) {
    const id = this.getZikrId(zikr);
    this.bookmarks.toggleBookmark({
      id,
      type: 'zikr',
      title: `${this.selectedCategory} • ذكر مبارك`,
      arabicText: zikr.text,
      subtitle: zikr.benefit || zikr.reference || `التكرار المطلوب: ${zikr.count} مرات`,
      sourceUrl: `/azkar`,
      meta: {
        category: this.selectedCategory,
        count: zikr.count,
      },
      createdAt: new Date().toISOString(),
    });
  }

  shareZikr(zikr: Zikr) {
    this.shareService.openShare({
      title: `${this.selectedCategory} - ذكر مبارك`,
      text: zikr.text,
      url: `/azkar`,
      subtitle: zikr.benefit || `من أذكار ${this.selectedCategory}`,
      type: 'zikr',
    });
  }
}
