import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { BookmarksService } from '../../services/bookmarks.service';
import { ShareService } from '../../services/share.service';
import { Reflection } from '../../models/reflection.model';

@Component({
  selector: 'app-reflections',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reflections-page-wrapper container">
      <!-- Header -->
      <header class="reflections-header">
        <span class="badge badge-purple"><i class="fa-solid fa-heart-pulse"></i> رقائق ومواعظ</span>
        <h1 class="page-title">كلمات توقظ القلب وتذكّر بالآخرة</h1>
        <p class="page-subtitle">
          درر من أقوال السلف الصالح وعلماء الأمة في الزهد، وقيام الليل، وإصلاح السرائر، وحقيقة الرحيل عن الدنيا.
        </p>

        <!-- Category Filters -->
        <div class="category-chips">
          @for (cat of categories; track cat) {
            <button
              class="cat-chip"
              [class.active]="selectedCategory === cat"
              (click)="selectCategory(cat)"
            >
              {{ cat }}
            </button>
          }
        </div>
      </header>

      <!-- Quotes Grid -->
      @if (loading) {
        <div class="loading-state">
          <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
          <p>جاري تحميل المواعظ والرقائق...</p>
        </div>
      } @else {
        <div class="reflections-grid">
          @for (item of reflections; track item._id || item.quote) {
            <div class="reflection-card card-glass">
              <div class="quote-icon">
                <i class="fa-solid fa-quote-right"></i>
              </div>

              <blockquote class="quote-text font-hadith">
                «{{ item.quote }}»
              </blockquote>

              <div class="quote-footer">
                <div class="author-info">
                  <span class="author-name">— {{ item.author }}</span>
                  @if (item.source) {
                    <span class="source-tag">{{ item.source }}</span>
                  }
                </div>

                <div class="quote-actions">
                  <button
                    class="btn-icon"
                    [class.btn-icon-active]="isReflectionBookmarked(item)"
                    (click)="toggleReflectionBookmark(item)"
                    [title]="isReflectionBookmarked(item) ? 'إزالة من المحفوظات' : 'حفظ في المفضلة'"
                  >
                    <i class="fa-solid" [class.fa-bookmark]="isReflectionBookmarked(item)" [class.fa-bookmark-regular]="!isReflectionBookmarked(item)"></i>
                  </button>
                  <button class="btn-icon" (click)="shareReflection(item)" title="مشاركة الموعظة">
                    <i class="fa-solid fa-share-nodes"></i>
                  </button>
                  <button class="btn-icon" (click)="copyQuote(item)" title="نسخ المقولة">
                    <i class="fa-regular fa-copy"></i>
                  </button>
                  <button class="btn-icon like-btn" (click)="likeQuote(item)" title="إعجاب">
                    <i class="fa-solid fa-heart"></i>
                    <span>{{ item.likes || 0 }}</span>
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
    .reflections-page-wrapper {
      padding: 50px 20px 80px 20px;
    }

    .reflections-header {
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
      margin-bottom: 25px;
    }

    .category-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }

    .cat-chip {
      padding: 6px 18px;
      border-radius: var(--radius-full);
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      transition: all 0.2s;
    }

    .cat-chip:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-main);
    }

    .cat-chip.active {
      background: #7c3aed;
      color: #ffffff;
      border-color: #7c3aed;
      box-shadow: 0 4px 15px rgba(124, 58, 237, 0.35);
    }

    /* Grid */
    .reflections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      max-width: 1450px;
      margin: 0 auto;
    }

    .reflection-card {
      padding: 30px;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }

    .quote-icon {
      font-size: 2rem;
      color: rgba(168, 85, 247, 0.3);
      margin-bottom: 14px;
    }

    .quote-text {
      font-size: 1.3rem;
      line-height: 2.2;
      color: var(--text-main);
      margin-bottom: 24px;
      flex: 1;
    }

    .quote-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 14px;
    }

    .author-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .author-name {
      font-weight: 700;
      color: var(--gold-light);
      font-size: 0.95rem;
    }

    .source-tag {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .quote-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-icon {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
      font-size: 0.85rem;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.12);
      color: var(--text-main);
    }

    .like-btn:hover {
      color: #f43f5e;
      background: rgba(244, 63, 94, 0.15);
    }

    /* Light Theme Enhancements for Reflections */
    :host-context(.light-theme) .reflections-header .page-title {
      color: #0f172a;
    }

    :host-context(.light-theme) .reflections-header .page-subtitle {
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
      background: #9333ea;
      color: #ffffff;
      border-color: #9333ea;
    }

    :host-context(.light-theme) .reflection-card {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.08);
      box-shadow: 0 2px 14px rgba(15, 23, 42, 0.04);
    }

    :host-context(.light-theme) .quote-icon {
      color: rgba(147, 51, 234, 0.25);
    }

    :host-context(.light-theme) .quote-text {
      color: #0f172a;
    }

    :host-context(.light-theme) .author-name {
      color: #b45309;
    }

    :host-context(.light-theme) .source-tag {
      color: #64748b;
    }

    .btn-icon-active {
      color: #f59e0b !important;
      border-color: rgba(245, 158, 11, 0.5) !important;
      background: rgba(245, 158, 11, 0.12) !important;
    }

    :host-context(.light-theme) .btn-icon-active {
      background: #fef3c7 !important;
      color: #d97706 !important;
      border-color: #f59e0b !important;
    }

    :host-context(.light-theme) .btn-icon {
      background: #f1f5f9;
      color: #475569;
    }

    :host-context(.light-theme) .btn-icon:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  `]
})
export class ReflectionsComponent implements OnInit {
  private api = inject(ApiService);
  bookmarks = inject(BookmarksService);
  shareService = inject(ShareService);

  categories: string[] = ['الكل', 'الزهد والموت', 'قيام الليل', 'إصلاح القلوب', 'تدبر القرآن'];
  selectedCategory = 'الكل';
  reflections: Reflection[] = [];
  loading = true;

  ngOnInit() {
    this.loadReflections();
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.loadReflections();
  }

  loadReflections() {
    this.loading = true;
    this.api.getReflections(this.selectedCategory).subscribe({
      next: (res) => {
        if (res.data) this.reflections = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  likeQuote(item: Reflection) {
    if (!item._id) return;
    this.api.likeReflection(item._id).subscribe({
      next: (res) => {
        item.likes = res.likes;
      },
    });
  }

  copyQuote(item: Reflection) {
    const text = `«${item.quote}»\n— ${item.author} (${item.source})`;
    navigator.clipboard.writeText(text);
    alert('تم نسخ الموعظة بنجاح');
  }

  private getReflectionId(item: Reflection): string {
    return item._id ? `ref-${item._id}` : `ref-${encodeURIComponent(item.author)}-${encodeURIComponent(item.quote.substring(0, 20))}`;
  }

  isReflectionBookmarked(item: Reflection): boolean {
    return this.bookmarks.isBookmarked(this.getReflectionId(item));
  }

  toggleReflectionBookmark(item: Reflection) {
    const id = this.getReflectionId(item);
    this.bookmarks.toggleBookmark({
      id,
      type: 'reflection',
      title: `موعظة: ${item.author}`,
      arabicText: item.quote,
      subtitle: item.source || item.category || 'رقائق ومواعظ',
      sourceUrl: `/reflections`,
      meta: {
        author: item.author,
        source: item.source,
        category: item.category,
      },
      createdAt: new Date().toISOString(),
    });
  }

  shareReflection(item: Reflection) {
    this.shareService.openShare({
      title: `موعظة مؤثرة — ${item.author}`,
      text: `«${item.quote}»\n— ${item.author}${item.source ? ' (' + item.source + ')' : ''}`,
      url: `/reflections`,
      subtitle: item.category || 'رقائق ومواعظ',
      type: 'reflection',
    });
  }
}
