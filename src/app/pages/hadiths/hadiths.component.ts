import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { BookmarksService } from '../../services/bookmarks.service';
import { ShareService } from '../../services/share.service';
import { Hadith } from '../../models/hadith.model';

@Component({
  selector: 'app-hadiths',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hadiths-page-wrapper container">
      <!-- Header -->
      <header class="hadiths-header">
        <span class="badge badge-gold"><i class="fa-solid fa-scroll"></i> السنة النبوية المطهرة</span>
        <h1 class="page-title">الأحاديث النبوية الموثقة</h1>
        <p class="page-subtitle">
          موسوعة من الأحاديث الصحيحة والمحققة في الرقائق والمواعظ وفضائل الأعمال، مع بيان درجتها ومصدرها وتخريجها.
        </p>

        <!-- Search & Filters -->
        <div class="filters-card card-glass">
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              placeholder="ابحث في نص الحديث، الراوي، المحدّث، أو الموضوع..."
            />
          </div>

          <div class="filter-dropdowns">
            <div class="filter-select-wrapper">
              <label>حكم الحديث:</label>
              <select [(ngModel)]="selectedGrading" (change)="loadHadiths()">
                <option value="الكل">كل الدرجات</option>
                <option value="صحيح">صحيح</option>
                <option value="حسن">حسن</option>
                <option value="متفق عليه">متفق عليه</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Topics Chips -->
        <div class="topic-chips-row">
          <button
            class="topic-chip"
            [class.active]="selectedTopic === 'الكل'"
            (click)="setTopic('الكل')"
          >
            الكل
          </button>
          @for (topic of topics; track topic) {
            <button
              class="topic-chip"
              [class.active]="selectedTopic === topic"
              (click)="setTopic(topic)"
            >
              {{ topic }}
            </button>
          }
        </div>
      </header>

      <!-- Hadiths Feed -->
      @if (loading) {
        <div class="loading-state">
          <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
          <p>جاري تحميل الأحاديث النبوية الموثقة...</p>
        </div>
      } @else {
        <div class="hadiths-grid">
          @for (hadith of hadiths; track hadith._id || hadith.title) {
            <article class="hadith-card card-glass">
              <div class="card-header-row">
                <span class="badge badge-purple">
                  <i class="fa-solid fa-tag"></i> {{ hadith.topic }}
                </span>
                <span
                  class="badge"
                  [class.badge-emerald]="hadith.grading.includes('صحيح') || hadith.grading.includes('متفق')"
                  [class.badge-gold]="hadith.grading.includes('حسن')"
                >
                  <i class="fa-solid fa-certificate"></i> {{ hadith.grading }} • {{ hadith.scholar }}
                </span>
              </div>

              @if (hadith.title) {
                <h3 class="hadith-title">{{ hadith.title }}</h3>
              }

              <!-- Hadith Text with prominent typography -->
              <blockquote class="hadith-text-block font-hadith">
                {{ hadith.text }}
              </blockquote>

              <!-- Explanation / Spiritual Benefit -->
              @if (hadith.explanation) {
                <div class="hadith-explanation-box">
                  <span class="explanation-title"><i class="fa-solid fa-lightbulb"></i> الفائدة والشرح:</span>
                  <p>{{ hadith.explanation }}</p>
                </div>
              }

              <!-- Meta Footer -->
              <div class="hadith-footer">
                <div class="takhrij-info">
                  <span><strong>الراوي:</strong> {{ hadith.narrator || 'الصحابي الجليل' }}</span>
                  <span><strong>المصدر:</strong> {{ hadith.source }} ({{ hadith.hadithNumber }})</span>
                </div>

                <div class="card-action-bar">
                  @if (hadith.referenceUrl) {
                    <a [href]="hadith.referenceUrl" target="_blank" rel="noopener" class="btn-ref" title="التحقق من الدرر السنية">
                      <i class="fa-solid fa-arrow-up-right-from-square"></i> التخريج
                    </a>
                  }
                  <button
                    class="btn-action"
                    [class.btn-action-active]="isHadithBookmarked(hadith)"
                    (click)="toggleHadithBookmark(hadith)"
                    [title]="isHadithBookmarked(hadith) ? 'إزالة من المحفوظات' : 'حفظ الحديث في المفضلة'"
                  >
                    <i class="fa-solid" [class.fa-bookmark]="isHadithBookmarked(hadith)" [class.fa-bookmark-regular]="!isHadithBookmarked(hadith)"></i>
                  </button>
                  <button class="btn-action" (click)="shareHadith(hadith)" title="مشاركة الحديث الشريف">
                    <i class="fa-solid fa-share-nodes"></i>
                  </button>
                  <button class="btn-action" (click)="copyText(hadith.text)" title="نسخ الحديث">
                    <i class="fa-regular fa-copy"></i>
                  </button>
                  <button class="btn-action like-btn" (click)="likeHadith(hadith)" title="إعجاب">
                    <i class="fa-solid fa-heart"></i>
                    <span>{{ hadith.likes || 0 }}</span>
                  </button>
                </div>
              </div>
            </article>
          }
        </div>

        @if (hadiths.length === 0) {
          <div class="no-results card-glass">
            <i class="fa-solid fa-book-bookmark fa-2x"></i>
            <p>لا توجد نتائج تطابق خيارات البحث الحالية.</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .hadiths-page-wrapper {
      padding: 50px 20px 80px 20px;
    }

    .hadiths-header {
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

    .filters-card {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 22px;
      width: 100%;
      max-width: 1350px;
      margin-bottom: 20px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 280px;
    }

    .search-box i {
      color: var(--text-muted);
    }

    .search-box input {
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-main);
      font-size: 0.95rem;
      width: 100%;
      font-family: inherit;
    }

    .filter-dropdowns {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .filter-select-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
      color: var(--text-muted);
    }

    .filter-select-wrapper select {
      background: var(--bg-surface-elevated);
      color: var(--text-main);
      border: 1px solid var(--border-subtle);
      padding: 6px 12px;
      border-radius: var(--radius-md);
      font-family: inherit;
      outline: none;
      cursor: pointer;
    }

    .topic-chips-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 8px;
      max-width: 1400px;
    }

    .topic-chip {
      padding: 6px 16px;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      transition: all 0.2s;
    }

    .topic-chip:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-main);
    }

    .topic-chip.active {
      background: var(--gold-accent);
      color: #ffffff;
      border-color: var(--gold-accent);
      box-shadow: 0 2px 10px rgba(217, 119, 6, 0.35);
    }

    /* Hadiths Feed Grid */
    .hadiths-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1350px;
      margin: 0 auto;
    }

    .hadith-card {
      padding: 28px;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
    }

    .card-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .hadith-title {
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 14px;
    }

    .hadith-text-block {
      font-size: 1.35rem;
      line-height: 2.3;
      color: var(--text-gold);
      background: rgba(217, 119, 6, 0.05);
      border-right: 4px solid var(--gold-accent);
      padding: 18px 24px;
      border-radius: var(--radius-md);
      margin-bottom: 18px;
    }

    .hadith-explanation-box {
      background: rgba(16, 185, 129, 0.06);
      border: 1px dashed var(--border-emerald);
      border-radius: var(--radius-md);
      padding: 14px 18px;
      font-size: 0.92rem;
      color: var(--text-muted);
      line-height: 1.8;
      margin-bottom: 18px;
    }

    .explanation-title {
      display: block;
      color: var(--text-emerald);
      font-weight: 700;
      margin-bottom: 4px;
    }

    .hadith-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 14px;
      flex-wrap: wrap;
      gap: 14px;
      font-size: 0.88rem;
    }

    .takhrij-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
      color: var(--text-muted);
    }

    .takhrij-info strong {
      color: var(--text-main);
    }

    .card-action-bar {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-ref {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-emerald);
      font-size: 0.82rem;
      font-weight: 600;
      transition: background 0.2s;
    }

    .btn-ref:hover {
      background: rgba(16, 185, 129, 0.15);
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
      font-size: 0.85rem;
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: rgba(255, 255, 255, 0.12);
      color: var(--text-main);
    }

    /* Light Theme Enhancements for Hadiths */
    :host-context(.light-theme) .hadiths-header .page-title {
      color: #0f172a;
    }

    :host-context(.light-theme) .hadiths-header .page-subtitle {
      color: #334155;
    }

    :host-context(.light-theme) .filter-card {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.12);
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
    }

    :host-context(.light-theme) .search-bar input {
      color: #0f172a;
    }

    :host-context(.light-theme) .search-bar input::placeholder {
      color: #64748b;
    }

    :host-context(.light-theme) .grading-select {
      background: #f8fafc;
      color: #0f172a;
      border-color: rgba(15, 23, 42, 0.15);
    }

    :host-context(.light-theme) .topic-chip {
      background: #f1f5f9;
      color: #475569;
      border-color: rgba(15, 23, 42, 0.1);
    }

    :host-context(.light-theme) .topic-chip:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    :host-context(.light-theme) .topic-chip.active {
      background: #d97706;
      color: #ffffff;
      border-color: #d97706;
    }

    :host-context(.light-theme) .hadith-card {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.08);
      box-shadow: 0 2px 14px rgba(15, 23, 42, 0.04);
    }

    :host-context(.light-theme) .hadith-title {
      color: #0f172a;
    }

    :host-context(.light-theme) .hadith-text-block {
      background: rgba(217, 119, 6, 0.08);
      color: #92400e;
      border-right-color: #d97706;
    }

    :host-context(.light-theme) .hadith-explanation-box {
      background: rgba(16, 185, 129, 0.07);
      border-color: rgba(5, 150, 105, 0.25);
      color: #1e293b;
    }

    :host-context(.light-theme) .explanation-title {
      color: #047857;
    }

    :host-context(.light-theme) .meta-item {
      color: #475569;
    }

    :host-context(.light-theme) .meta-item strong {
      color: #1e293b;
    }

    :host-context(.light-theme) .btn-action {
      background: #f1f5f9;
      color: #475569;
    }

    :host-context(.light-theme) .btn-action:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  `]
})
export class HadithsComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  bookmarks = inject(BookmarksService);
  shareService = inject(ShareService);

  hadiths: Hadith[] = [];
  topics: string[] = [];
  loading = true;
  searchQuery = '';
  selectedTopic = 'الكل';
  selectedGrading = 'الكل';

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['topic']) {
        this.selectedTopic = params['topic'];
      }
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      this.loadTopics();
      this.loadHadiths();
    });
  }

  loadTopics() {
    this.api.getHadithTopics().subscribe({
      next: (res) => {
        if (res.data) this.topics = res.data;
      },
    });
  }

  loadHadiths() {
    this.loading = true;
    this.api
      .getHadiths(this.selectedTopic, this.selectedGrading, this.searchQuery, 1, 50)
      .subscribe({
        next: (res) => {
          if (res.data) this.hadiths = res.data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  setTopic(topic: string) {
    this.selectedTopic = topic;
    this.loadHadiths();
  }

  onSearchInput() {
    this.loadHadiths();
  }

  likeHadith(hadith: Hadith) {
    if (!hadith._id) return;
    this.api.likeHadith(hadith._id).subscribe({
      next: (res) => {
        hadith.likes = res.likes;
      },
    });
  }

  copyText(text: string) {
    navigator.clipboard.writeText(text);
    alert('تم نسخ الحديث الشريف بنجاح');
  }

  isHadithBookmarked(hadith: Hadith): boolean {
    const id = hadith._id ? `hadith-${hadith._id}` : `hadith-${hadith.title || hadith.hadithNumber}`;
    return this.bookmarks.isBookmarked(id);
  }

  toggleHadithBookmark(hadith: Hadith) {
    const id = hadith._id ? `hadith-${hadith._id}` : `hadith-${hadith.title || hadith.hadithNumber}`;
    this.bookmarks.toggleBookmark({
      id,
      type: 'hadith',
      title: hadith.title || `حديث: ${hadith.topic}`,
      arabicText: hadith.text,
      subtitle: `${hadith.source} (${hadith.hadithNumber}) • ${hadith.grading}`,
      sourceUrl: `/hadiths?search=${encodeURIComponent(hadith.title || hadith.topic || '')}`,
      meta: {
        narrator: hadith.narrator,
        source: hadith.source,
        grading: hadith.grading,
      },
      createdAt: new Date().toISOString(),
    });
  }

  shareHadith(hadith: Hadith) {
    const title = hadith.title || `حديث شريف في ${hadith.topic}`;
    const query = hadith.title ? hadith.title : hadith.topic;
    this.shareService.openShare({
      title,
      text: hadith.text,
      url: `/hadiths?search=${encodeURIComponent(query || '')}`,
      subtitle: `${hadith.source} - ${hadith.grading}`,
      type: 'hadith',
    });
  }
}
