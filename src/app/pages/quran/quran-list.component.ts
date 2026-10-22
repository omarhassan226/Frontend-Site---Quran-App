import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Surah, Reciter } from '../../models/quran.model';

@Component({
  selector: 'app-quran-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="quran-page-wrapper container">
      <!-- Page Header -->
      <header class="quran-header">
        <span class="badge badge-emerald"><i class="fa-solid fa-book-open"></i> القرآن الكريم</span>
        <h1 class="page-title">فهرس سور القرآن الكريم</h1>
        <p class="page-subtitle">
          مائة وأربع عشرة سورة كاملة، اقرأ بالرسم العثماني الموثوق واستمع لتلاوات أندى القراء
        </p>

        <!-- Search & Revelation Filter -->
        <div class="filter-bar card-glass">
          <div class="search-input-group">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="filterSurahs()"
              placeholder="ابحث باسم السورة (مثلاً: الكهف، يس، الملك) أو برقمها..."
            />
          </div>

          <div class="revelation-tabs">
            <button
              class="tab-btn"
              [class.active]="selectedType === 'all'"
              (click)="setType('all')"
            >
              الكل (114)
            </button>
            <button
              class="tab-btn"
              [class.active]="selectedType === 'Meccan'"
              (click)="setType('Meccan')"
            >
              مكية ({{ countMeccan }})
            </button>
            <button
              class="tab-btn"
              [class.active]="selectedType === 'Medinan'"
              (click)="setType('Medinan')"
            >
              مدنية ({{ countMedinan }})
            </button>
          </div>
        </div>
      </header>

      <!-- Surahs Grid -->
      @if (loading) {
        <div class="loading-state">
          <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
          <p>جاري تحميل سور القرآن الكريم...</p>
        </div>
      } @else {
        <div class="surahs-grid">
          @for (surah of filteredSurahs; track surah.number) {
            <a [routerLink]="['/quran/surah', surah.number]" class="surah-card card-glass">
              <div class="surah-card-header">
                <span class="surah-number-badge">{{ surah.number }}</span>
                <span class="badge" [class.badge-gold]="surah.revelationType === 'Meccan'" [class.badge-blue]="surah.revelationType === 'Medinan'">
                  {{ surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية' }}
                </span>
              </div>

              <div class="surah-info-center">
                <h3 class="surah-arabic-name">{{ surah.name }}</h3>
                <span class="surah-english-sub">{{ surah.englishName }} • {{ surah.englishNameTranslation }}</span>
              </div>

              <div class="surah-card-footer">
                <span class="ayah-count-tag">
                  <i class="fa-solid fa-lines-leaning"></i> {{ surah.numberOfAyahs }} آيات
                </span>
                <span class="read-listen-action">
                  <span>قراءة واستماع</span>
                  <i class="fa-solid fa-arrow-left"></i>
                </span>
              </div>
            </a>
          }
        </div>

        @if (filteredSurahs.length === 0) {
          <div class="no-results card-glass">
            <i class="fa-solid fa-file-circle-question fa-2x"></i>
            <p>لم يتم العثور على سورة تطابق بحثك: «{{ searchQuery }}»</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .quran-page-wrapper {
      padding: 50px 20px;
    }

    .quran-header {
      text-align: center;
      margin-bottom: 45px;
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

    /* Filter Bar */
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 22px;
      width: 100%;
      max-width: 1200px;
    }

    .search-input-group {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 280px;
    }

    .search-input-group i {
      color: var(--text-muted);
    }

    .search-input-group input {
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-main);
      font-size: 0.95rem;
      width: 100%;
      font-family: inherit;
    }

    .revelation-tabs {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tab-btn {
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.05);
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

    /* Surahs Grid */
    .surahs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 22px;
    }

    .surah-card {
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      min-height: 190px;
      border-radius: var(--radius-lg);
      cursor: pointer;
    }

    .surah-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .surah-number-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(217, 119, 6, 0.15);
      color: var(--gold-light);
      border: 1.5px solid var(--border-gold);
      font-weight: 800;
      font-size: 0.9rem;
    }

    .surah-info-center {
      text-align: center;
      margin: 10px 0 16px 0;
    }

    .surah-arabic-name {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 4px;
      letter-spacing: -0.3px;
    }

    .surah-english-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .surah-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 12px;
      font-size: 0.85rem;
    }

    .ayah-count-tag {
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .read-listen-action {
      color: var(--text-emerald);
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.2s;
    }

    .surah-card:hover .read-listen-action {
      transform: translateX(-4px);
    }

    /* Light Theme Enhancements for Quran List */
    :host-context(.light-theme) .page-title {
      color: #0f172a;
    }

    :host-context(.light-theme) .page-subtitle {
      color: #334155;
    }

    :host-context(.light-theme) .filter-bar {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.12);
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
    }

    :host-context(.light-theme) .search-input-group input {
      color: #0f172a;
    }

    :host-context(.light-theme) .search-input-group input::placeholder {
      color: #64748b;
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

    :host-context(.light-theme) .surah-card {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.08);
      box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
    }

    :host-context(.light-theme) .surah-card:hover {
      border-color: #059669;
      box-shadow: 0 10px 30px rgba(5, 150, 105, 0.12);
    }

    :host-context(.light-theme) .surah-arabic-name {
      color: #0f172a;
    }

    :host-context(.light-theme) .surah-english-sub {
      color: #64748b;
    }

    :host-context(.light-theme) .surah-number-badge {
      background: rgba(217, 119, 6, 0.1);
      color: #b45309;
      border-color: rgba(217, 119, 6, 0.3);
    }

    :host-context(.light-theme) .surah-card-footer {
      border-top-color: rgba(15, 23, 42, 0.08);
    }

    :host-context(.light-theme) .ayah-count-tag {
      color: #64748b;
    }

    :host-context(.light-theme) .read-listen-action {
      color: #047857;
    }
  `]
})
export class QuranListComponent implements OnInit {
  private api = inject(ApiService);

  surahs: Surah[] = [];
  filteredSurahs: Surah[] = [];
  loading = true;
  searchQuery = '';
  selectedType: 'all' | 'Meccan' | 'Medinan' = 'all';

  countMeccan = 0;
  countMedinan = 0;

  ngOnInit() {
    this.loadSurahs();
  }

  loadSurahs() {
    this.api.getSurahs().subscribe({
      next: (res) => {
        if (res.data) {
          this.surahs = res.data;
          this.countMeccan = this.surahs.filter((s) => s.revelationType === 'Meccan').length;
          this.countMedinan = this.surahs.filter((s) => s.revelationType === 'Medinan').length;
          this.filterSurahs();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  setType(type: 'all' | 'Meccan' | 'Medinan') {
    this.selectedType = type;
    this.filterSurahs();
  }

  filterSurahs() {
    let list = this.surahs;

    if (this.selectedType !== 'all') {
      list = list.filter((s) => s.revelationType === this.selectedType);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.includes(q) ||
          s.englishName.toLowerCase().includes(q) ||
          s.number.toString() === q
      );
    }

    this.filteredSurahs = list;
  }
}
