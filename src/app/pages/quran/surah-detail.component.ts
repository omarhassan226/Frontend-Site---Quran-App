import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AudioPlayerService } from '../../services/audio-player.service';
import { BookmarksService } from '../../services/bookmarks.service';
import { ShareService } from '../../services/share.service';
import { SurahDetail, Reciter, Ayah, Surah } from '../../models/quran.model';

@Component({
  selector: 'app-surah-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="surah-detail-wrapper container">
      <!-- Navigation & Breadcrumb with Surah Search & Switcher -->
      <div class="top-nav-bar">
        <a routerLink="/quran" class="btn-ghost index-back-btn">
          <i class="fa-solid fa-arrow-right"></i>
          <span>فهرس السور</span>
        </a>

        <!-- Quick Surah Search & Switcher -->
        <div class="surah-search-box" [class.dropdown-active]="isSearchOpen">
          <div class="search-input-wrapper">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              [(ngModel)]="surahSearchQuery"
              (input)="onSurahSearchInput()"
              (focus)="onSearchFocus()"
              (keydown)="onSearchKeydown($event)"
              placeholder="ابحث عن سورة بالاسم أو الرقم (مثال: الكهف، 18)..."
              class="surah-search-input"
              autocomplete="off"
            />
            @if (surahSearchQuery) {
              <button type="button" class="clear-search-btn" (click)="clearSearch($event)" title="مسح">
                <i class="fa-solid fa-xmark"></i>
              </button>
            }

            <select
              class="surah-quick-select"
              [ngModel]="surah?.number"
              (ngModelChange)="navigateToSurah($event)"
              title="انتقال سريع لسورة"
            >
              <option [value]="undefined" disabled>انتقال لسورة...</option>
              @for (s of allSurahs; track s.number) {
                <option [value]="s.number">
                  {{ s.number }}. {{ s.name }} ({{ s.numberOfAyahs }} آية)
                </option>
              }
            </select>
          </div>

          <!-- Live Search Results Dropdown -->
          @if (isSearchOpen) {
            <div class="surah-results-dropdown card-glass">
              <div class="dropdown-header">
                <span class="dropdown-header-title">
                  <i class="fa-solid fa-book-quran"></i>
                  <span>السور المتاحة ({{ filteredSurahsList.length }})</span>
                </span>
                <button type="button" class="close-dropdown-btn" (click)="isSearchOpen = false">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="dropdown-list-scroll">
                @for (item of filteredSurahsList; track item.number) {
                  <button
                    type="button"
                    class="dropdown-surah-item"
                    [class.current-surah]="item.number === surah?.number"
                    (click)="navigateToSurah(item.number)"
                  >
                    <span class="item-number-badge">{{ item.number }}</span>
                    <div class="item-info">
                      <div class="item-name-row">
                        <span class="item-arabic-name font-quran">{{ item.name }}</span>
                        <span class="item-type-badge" [class.meccan]="item.revelationType === 'Meccan'">
                          {{ item.revelationType === 'Meccan' ? 'مكية' : 'مدنية' }}
                        </span>
                      </div>
                      <div class="item-sub-row">
                        <span class="item-english-name">{{ item.englishName }}</span>
                        <span class="item-ayah-count">{{ item.numberOfAyahs }} آية</span>
                      </div>
                    </div>
                    @if (item.number === surah?.number) {
                      <span class="current-indicator"><i class="fa-solid fa-check"></i> الحالية</span>
                    }
                  </button>
                } @empty {
                  <div class="dropdown-empty-state">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <p>لم يتم العثور على سورة مطابقة لـ "{{ surahSearchQuery }}"</p>
                    <small>يمكنك كتابة رقم السورة (1-114) أو اسمها (مثال: البقرة، الكهف، يس، الملك)</small>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        @if (surah) {
          <div class="surah-pager">
            @if (surah.number > 1) {
              <a [routerLink]="['/quran/surah', surah.number - 1]" class="btn-ghost pager-btn" [title]="'السورة السابقة: ' + getSurahName(surah.number - 1)">
                <i class="fa-solid fa-chevron-right"></i>
                <span class="pager-text-full">السورة السابقة ({{ getSurahName(surah.number - 1) }})</span>
                <span class="pager-text-short">السابقة</span>
              </a>
            }
            @if (surah.number < 114) {
              <a [routerLink]="['/quran/surah', surah.number + 1]" class="btn-ghost pager-btn" [title]="'السورة التالية: ' + getSurahName(surah.number + 1)">
                <span class="pager-text-full">({{ getSurahName(surah.number + 1) }}) السورة التالية</span>
                <span class="pager-text-short">التالية</span>
                <i class="fa-solid fa-chevron-left"></i>
              </a>
            }
          </div>
        }
      </div>

      @if (loading) {
        <div class="loading-state">
          <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
          <p>جاري تحميل آيات السورة الكريمة والتلاوة العطرة...</p>
        </div>
      } @else if (surah) {
        <!-- Surah Header Card -->
        <div class="surah-banner-card card-glass">
          <div class="surah-banner-header">
            <span class="badge" [class.badge-gold]="surah.revelationType === 'Meccan'" [class.badge-blue]="surah.revelationType === 'Medinan'">
              سورة {{ surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية' }}
            </span>
            <span class="badge badge-emerald">رقم السورة: {{ surah.number }}</span>
            <span class="badge badge-purple">عدد آياتها: {{ surah.numberOfAyahs }}</span>
          </div>

          <h1 class="surah-title font-quran">{{ surah.name }}</h1>
          <p class="surah-english-title">{{ surah.englishName }} ({{ surah.englishNameTranslation }})</p>

          <!-- Comprehensive Quran Reading & Audio Command Hub -->
          <div class="audio-selection-toolbar">
            <!-- Row 1: Surah Switching Hub & Reciter Selection -->
            <div class="toolbar-row toolbar-selectors-row">
              <!-- Surah Switcher with Quick Pagers -->
              <div class="toolbar-group surah-switcher-group">
                <button
                  type="button"
                  class="btn-pager-mini"
                  [disabled]="surah.number <= 1"
                  (click)="navigateToSurah(surah.number - 1)"
                  [title]="surah.number > 1 ? 'السورة السابقة: ' + getSurahName(surah.number - 1) : 'لا توجد سورة سابقة'"
                >
                  <i class="fa-solid fa-chevron-right"></i>
                  <span class="pager-mini-label">السابقة</span>
                </button>

                <div class="select-field-wrap">
                  <label for="toolbar-surah-select">
                    <i class="fa-solid fa-book-quran"></i>
                    <span>السورة:</span>
                  </label>
                  <select
                    id="toolbar-surah-select"
                    class="toolbar-select surah-main-select"
                    [ngModel]="surah.number"
                    (ngModelChange)="navigateToSurah($event)"
                    title="اختر أي سورة من الـ 114 سورة"
                  >
                    @for (s of allSurahs; track s.number) {
                      <option [value]="s.number">
                        {{ s.number }}. {{ s.name }} ({{ s.numberOfAyahs }} آية - {{ s.revelationType === 'Meccan' ? 'مكية' : 'مدنية' }})
                      </option>
                    }
                  </select>
                </div>

                <button
                  type="button"
                  class="btn-pager-mini"
                  [disabled]="surah.number >= 114"
                  (click)="navigateToSurah(surah.number + 1)"
                  [title]="surah.number < 114 ? 'السورة التالية: ' + getSurahName(surah.number + 1) : 'لا توجد سورة تالية'"
                >
                  <span class="pager-mini-label">التالية</span>
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
              </div>

              <!-- Reciter Selection -->
              <div class="toolbar-group reciter-picker-group">
                <div class="select-field-wrap">
                  <label for="reciter-select">
                    <i class="fa-solid fa-microphone-lines"></i>
                    <span>القارئ:</span>
                  </label>
                  <select
                    id="reciter-select"
                    [(ngModel)]="selectedReciter"
                    (change)="onReciterChange()"
                    class="toolbar-select reciter-main-select"
                  >
                    @for (rec of reciters; track rec.id) {
                      <option [value]="rec.id">{{ rec.name }} ({{ rec.style }})</option>
                    }
                  </select>
                </div>
              </div>
            </div>

            <!-- Visual Divider -->
            <div class="toolbar-divider"></div>

            <!-- Row 2: Playback, View Mode, Font Size, Jump to Ayah, Actions -->
            <div class="toolbar-row toolbar-controls-row">
              <!-- Play / Pause Full Surah Toggle -->
              <button 
                class="btn-primary toolbar-play-btn" 
                [class.btn-playing]="isCurrentSurahPlaying()" 
                (click)="togglePlaySurah()"
                title="استماع للسورة كاملة أو إيقاف التلاوة مؤقتاً"
              >
                <i class="fa-solid" [class.fa-pause]="isCurrentSurahPlaying()" [class.fa-play]="!isCurrentSurahPlaying()"></i>
                <span>{{ isCurrentSurahPlaying() ? 'إيقاف التلاوة' : 'استماع للسورة كاملة' }}</span>
              </button>

              <!-- View Mode Toggle -->
              <button 
                class="btn-ghost view-toggle-btn" 
                (click)="toggleViewMode()" 
                [title]="viewMode === 'list' ? 'التحويل إلى نمط المصحف المتصل' : 'التحويل إلى نمط الآيات المنفصلة'"
              >
                <i class="fa-solid" [class.fa-book-open]="viewMode === 'list'" [class.fa-list-ol]="viewMode === 'mushaf'"></i>
                <span>{{ viewMode === 'list' ? 'نمط المصحف' : 'نمط الآيات' }}</span>
              </button>

              <!-- Jump to Ayah Dropdown -->
              <div class="jump-ayah-group">
                <label for="jump-ayah-select" title="انتقال مباشر لرقم آية">
                  <i class="fa-solid fa-location-crosshairs"></i>
                  <span>الآية:</span>
                </label>
                <select
                  id="jump-ayah-select"
                  class="toolbar-select jump-select"
                  [ngModel]="selectedAyahJump"
                  (ngModelChange)="jumpToAyah($event)"
                >
                  <option [value]="undefined" disabled>انتقال لآية...</option>
                  @for (ayah of surah.ayahs; track ayah.numberInSurah) {
                    <option [value]="ayah.numberInSurah">آية {{ ayah.numberInSurah }}</option>
                  }
                </select>
              </div>

              <!-- Font Size Controls -->
              <div class="font-size-toolbar-group" title="التحكم بحجم خط المصحف والآيات">
                <button type="button" class="btn-font-action" (click)="decreaseFontSize()" title="تصغير الخط">
                  <i class="fa-solid fa-minus"></i>
                  <span>A</span>
                </button>
                <button type="button" class="btn-font-value" (click)="resetFontSize()" title="حجم الخط الحالي (اضغط للعودة للحجم الافتراضي)">
                  {{ fontSize }}px
                </button>
                <button type="button" class="btn-font-action" (click)="increaseFontSize()" title="تكبير الخط">
                  <i class="fa-solid fa-plus"></i>
                  <span>A</span>
                </button>
              </div>

              <!-- Actions: Copy Full Text, Share, Bookmark -->
              <div class="secondary-actions-cluster">
                <button class="btn-ghost" (click)="copyFullSurah()" title="نسخ نص السورة الكريمة كاملاً">
                  <i class="fa-solid fa-copy"></i>
                  <span class="btn-action-text">نسخ السورة</span>
                </button>

                <button class="btn-ghost" (click)="shareSurah()" title="مشاركة رابط السورة الكريمة">
                  <i class="fa-solid fa-share-nodes"></i>
                  <span class="btn-action-text">مشاركة</span>
                </button>

                <button
                  class="btn-ghost"
                  [class.btn-bookmarked]="isSurahBookmarked()"
                  (click)="toggleSurahBookmark()"
                  [title]="isSurahBookmarked() ? 'إزالة السورة من المحفوظات' : 'حفظ السورة في المفضلة'"
                >
                  <i class="fa-solid" [class.fa-bookmark]="isSurahBookmarked()" [class.fa-bookmark-regular]="!isSurahBookmarked()"></i>
                  <span class="btn-action-text">{{ isSurahBookmarked() ? 'محفوظة' : 'حفظ' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bismillah (except Surah 9 At-Tawbah) -->
        @if (surah.number !== 9 && surah.number !== 1) {
          <div class="bismillah-container">
            <span class="bismillah-text font-quran">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
          </div>
        }

        <!-- Mushaf Continuous Reading Mode -->
        @if (viewMode === 'mushaf') {
          <div class="mushaf-page-box card-glass font-quran" [style.fontSize.px]="fontSize" [style.lineHeight]="fontSize > 32 ? '2.8' : '2.5'">
            <p class="mushaf-text" [style.fontSize.px]="fontSize">
              @for (ayah of surah.ayahs; track ayah.numberInSurah; let idx = $index) {
                <span
                  [id]="'ayah-item-' + ayah.numberInSurah"
                  class="mushaf-ayah-span"
                  [class.active-ayah]="player.currentAyah()?.number === ayah.number"
                  (click)="playAyah(ayah, idx)"
                  [title]="'تشغيل الآية ' + ayah.numberInSurah"
                >
                  {{ cleanAyahText(ayah.text, surah.number, ayah.numberInSurah) }}
                  <span class="ayah-number-badge">{{ ayah.numberInSurah }}</span>
                </span>
              }
            </p>
          </div>
        } @else {
          <!-- Ayah Cards List Mode -->
          <div class="ayahs-list">
            @for (ayah of surah.ayahs; track ayah.numberInSurah; let idx = $index) {
              <div
                [id]="'ayah-item-' + ayah.numberInSurah"
                class="ayah-card card-glass"
                [class.playing-ayah-card]="player.currentAyah()?.number === ayah.number"
              >
                <div class="ayah-card-top">
                  <span class="ayah-index-pill">
                    الآية <strong>{{ ayah.numberInSurah }}</strong>
                  </span>
                  <div class="ayah-top-actions">
                    <span class="ayah-meta-chip">الجزء {{ ayah.juz }} • صفحة {{ ayah.page }}</span>
                    <button
                      class="btn-icon"
                      [class.btn-icon-active]="isAyahBookmarked(ayah)"
                      (click)="toggleAyahBookmark(ayah)"
                      [title]="isAyahBookmarked(ayah) ? 'إزالة من المحفوظات' : 'حفظ الآية في المفضلة'"
                    >
                      <i class="fa-solid" [class.fa-bookmark]="isAyahBookmarked(ayah)" [class.fa-bookmark-regular]="!isAyahBookmarked(ayah)"></i>
                    </button>
                    <button class="btn-icon" (click)="shareAyah(ayah)" title="مشاركة الآية الكريمة">
                      <i class="fa-solid fa-share-nodes"></i>
                    </button>
                    <button class="btn-icon" (click)="copyAyah(ayah.text)" title="نسخ الآية">
                      <i class="fa-regular fa-copy"></i>
                    </button>
                    <button
                      class="btn-icon play-ayah-btn"
                      [class.btn-emerald]="player.currentAyah()?.number === ayah.number && player.isPlaying()"
                      (click)="playAyah(ayah, idx)"
                      title="استماع للآية"
                    >
                      @if (player.currentAyah()?.number === ayah.number && player.isPlaying()) {
                        <i class="fa-solid fa-pause"></i>
                      } @else {
                        <i class="fa-solid fa-play"></i>
                      }
                    </button>
                  </div>
                </div>

                <div class="ayah-body font-quran" [style.fontSize.px]="fontSize">
                  {{ cleanAyahText(ayah.text, surah.number, ayah.numberInSurah) }}
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .surah-detail-wrapper {
      padding: 40px 20px 80px 20px;
    }

    .top-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 25px;
      gap: 14px;
      position: relative;
      z-index: 50;
    }

    .index-back-btn {
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    /* Surah Search Box */
    .surah-search-box {
      flex: 1;
      max-width: 620px;
      position: relative;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: rgba(15, 23, 42, 0.75);
      border: 1.5px solid var(--border-subtle);
      border-radius: var(--radius-full);
      padding: 4px 12px 4px 6px;
      transition: all 0.25s ease;
      box-shadow: var(--shadow-sm);
    }

    .search-input-wrapper:focus-within {
      border-color: var(--primary-emerald);
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
    }

    .search-icon {
      color: var(--primary-emerald-light);
      font-size: 0.95rem;
      margin-left: 8px;
    }

    .surah-search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-main);
      font-size: 0.9rem;
      font-family: inherit;
      padding: 6px 4px;
      min-width: 120px;
    }

    .surah-search-input::placeholder {
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .clear-search-btn {
      color: var(--text-muted);
      font-size: 0.9rem;
      padding: 4px 8px;
      transition: color 0.2s;
    }

    .clear-search-btn:hover {
      color: var(--text-main);
    }

    .surah-quick-select {
      background: var(--bg-surface-elevated);
      color: var(--text-gold);
      border: 1px solid var(--border-gold);
      border-radius: var(--radius-full);
      padding: 5px 12px;
      font-size: 0.82rem;
      font-family: inherit;
      outline: none;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      max-width: 175px;
    }

    .surah-quick-select:hover {
      border-color: var(--gold-light);
    }

    /* Results Dropdown */
    .surah-results-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      left: 0;
      background: rgba(15, 23, 42, 0.97);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1.5px solid var(--border-emerald);
      border-radius: var(--radius-lg);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
      z-index: 100;
      overflow: hidden;
      animation: dropdownFadeIn 0.2s ease-out;
    }

    @keyframes dropdownFadeIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 0.82rem;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.03);
    }

    .dropdown-header-title {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--gold-light);
      font-weight: 600;
    }

    .close-dropdown-btn {
      color: var(--text-muted);
      font-size: 0.95rem;
      padding: 2px 6px;
      transition: color 0.2s;
    }

    .close-dropdown-btn:hover {
      color: #ef4444;
    }

    .dropdown-list-scroll {
      max-height: 350px;
      overflow-y: auto;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .dropdown-surah-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-main);
      text-align: right;
      width: 100%;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .dropdown-surah-item:hover {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.3);
      transform: translateX(-2px);
    }

    .dropdown-surah-item.current-surah {
      background: rgba(16, 185, 129, 0.18);
      border-color: var(--primary-emerald);
    }

    .item-number-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(217, 119, 6, 0.15);
      color: var(--gold-light);
      font-weight: 700;
      font-size: 0.85rem;
      border: 1px solid var(--border-gold);
      flex-shrink: 0;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .item-name-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .item-arabic-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .item-type-badge {
      font-size: 0.72rem;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background: rgba(59, 130, 246, 0.15);
      color: #93c5fd;
      font-weight: 600;
    }

    .item-type-badge.meccan {
      background: rgba(217, 119, 6, 0.15);
      color: var(--gold-light);
    }

    .item-sub-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .current-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--primary-emerald-light);
      background: rgba(16, 185, 129, 0.12);
      padding: 3px 8px;
      border-radius: var(--radius-full);
    }

    .dropdown-empty-state {
      text-align: center;
      padding: 30px 15px;
      color: var(--text-muted);
    }

    .dropdown-empty-state i {
      font-size: 1.6rem;
      margin-bottom: 8px;
      opacity: 0.6;
    }

    .dropdown-empty-state small {
      display: block;
      margin-top: 6px;
      font-size: 0.78rem;
      opacity: 0.7;
    }

    .surah-pager {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .pager-btn {
      font-size: 0.88rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .pager-text-short {
      display: none;
    }

    /* Surah Banner */
    .surah-banner-card {
      text-align: center;
      padding: 35px 25px;
      margin-bottom: 35px;
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.25), rgba(15, 23, 42, 0.85));
      border: 1px solid var(--border-emerald);
      border-radius: var(--radius-xl);
    }

    .surah-banner-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .surah-title {
      font-size: 3rem;
      color: var(--text-gold);
      margin-bottom: 6px;
      line-height: 1.4;
      text-align: center !important;
    }

    .surah-english-title {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-bottom: 25px;
      text-align: center !important;
    }

    /* Comprehensive Quran Toolbar */
    .audio-selection-toolbar {
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1.5px solid var(--border-emerald);
      border-radius: var(--radius-xl);
      padding: 16px 22px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 1250px;
      margin: 0 auto;
      transition: all 0.3s ease;
    }

    .toolbar-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .toolbar-divider {
      height: 1px;
      background: var(--border-subtle);
      width: 100%;
      margin: 2px 0;
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .select-field-wrap {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
      color: var(--text-muted);
    }

    .select-field-wrap label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
    }

    .select-field-wrap label i {
      color: var(--primary-emerald-light);
    }

    .toolbar-select {
      background: var(--bg-surface-elevated);
      color: var(--text-main);
      border: 1.5px solid var(--border-subtle);
      padding: 8px 14px;
      border-radius: var(--radius-md);
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      outline: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toolbar-select:hover,
    .toolbar-select:focus {
      border-color: var(--primary-emerald);
      box-shadow: 0 0 12px var(--primary-emerald-glow);
    }

    .surah-main-select {
      min-width: 200px;
      max-width: 320px;
    }

    .reciter-main-select {
      min-width: 190px;
    }

    .btn-pager-mini {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.06);
      border: 1.5px solid var(--border-subtle);
      color: var(--text-main);
      font-size: 0.86rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-pager-mini:hover:not(:disabled) {
      background: rgba(16, 185, 129, 0.15);
      border-color: var(--primary-emerald);
      color: #ffffff;
      transform: translateY(-1px);
    }

    .btn-pager-mini:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .toolbar-play-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
    }

    .toolbar-play-btn.btn-playing {
      background: linear-gradient(135deg, #d97706, #b45309) !important;
      box-shadow: 0 0 20px rgba(217, 119, 6, 0.45) !important;
    }

    .jump-ayah-group {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
      color: var(--text-muted);
    }

    .jump-ayah-group label {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-weight: 600;
    }

    .jump-ayah-group label i {
      color: var(--gold-light);
    }

    .jump-select {
      padding: 7px 12px;
      min-width: 120px;
    }

    /* Font Size Controls Group */
    .font-size-toolbar-group {
      display: inline-flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1.5px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .btn-font-action {
      padding: 6px 12px;
      background: transparent;
      border: none;
      color: var(--text-main);
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: background 0.15s, color 0.15s;
    }

    .btn-font-action:hover {
      background: rgba(16, 185, 129, 0.2);
      color: var(--primary-emerald-light);
    }

    .btn-font-value {
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.25);
      border: none;
      border-left: 1px solid var(--border-subtle);
      border-right: 1px solid var(--border-subtle);
      color: var(--gold-light);
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      min-width: 48px;
      text-align: center;
      transition: all 0.2s;
    }

    .btn-font-value:hover {
      color: #ffffff;
      background: rgba(16, 185, 129, 0.25);
    }

    .secondary-actions-cluster {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    /* Jump to Ayah Highlight Animation */
    .jump-highlight {
      animation: ayahHighlightAnim 2.2s ease-out;
      border-radius: var(--radius-md);
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.7) !important;
    }

    @keyframes ayahHighlightAnim {
      0% {
        background-color: rgba(16, 185, 129, 0.45);
      }
      100% {
        background-color: transparent;
      }
    }

    /* Bismillah */
    .bismillah-container {
      text-align: center;
      margin: 30px 0;
    }

    .bismillah-text {
      font-size: 2.2rem;
      color: var(--text-gold);
      letter-spacing: 1px;
    }

    /* Mushaf Page Mode */
    .mushaf-page-box {
      padding: 45px 35px;
      border-radius: var(--radius-xl);
      background: rgba(15, 23, 42, 0.65);
      border: 1.5px solid var(--border-gold);
      box-shadow: var(--shadow-lg);
      line-height: 2.6;
      text-align: justify;
      text-align-last: center;
    }

    .mushaf-text {
      font-size: 1.85rem;
      color: var(--text-main);
    }

    .mushaf-ayah-span {
      display: inline;
      padding: 4px 6px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background 0.2s;
    }

    .mushaf-ayah-span:hover {
      background: rgba(16, 185, 129, 0.15);
    }

    .mushaf-ayah-span.active-ayah {
      background: rgba(245, 158, 11, 0.25);
      color: var(--gold-light);
      border-radius: var(--radius-sm);
    }

    /* Ayah List Mode */
    .ayahs-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .ayah-card {
      padding: 22px 28px;
      border-radius: var(--radius-lg);
      transition: all 0.25s ease;
    }

    .ayah-card.playing-ayah-card {
      border-color: var(--gold-accent);
      background: rgba(217, 119, 6, 0.08);
      box-shadow: 0 0 25px var(--gold-glow);
    }

    .ayah-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 12px;
      margin-bottom: 16px;
    }

    .ayah-index-pill {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .ayah-index-pill strong {
      color: var(--gold-light);
      font-size: 1.05rem;
    }

    .ayah-top-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ayah-meta-chip {
      font-size: 0.8rem;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.05);
      padding: 3px 10px;
      border-radius: var(--radius-full);
    }

    .ayah-body {
      font-size: 1.85rem;
      line-height: 2.3;
      color: var(--text-main);
      text-align: right;
    }

    .btn-emerald {
      background: var(--primary-emerald) !important;
      color: #ffffff !important;
    }

    .btn-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.12);
      color: var(--text-main);
    }

    .loading-state {
      text-align: center;
      padding: 80px 20px;
      color: var(--text-muted);
    }

    .loading-state i {
      color: var(--primary-emerald);
      margin-bottom: 15px;
    }

    /* Light Theme Enhancements for Surah Detail */
    :host-context(.light-theme) .surah-title {
      color: #92400e;
    }

    :host-context(.light-theme) .audio-selection-toolbar {
      background: #ffffff;
      border-color: rgba(5, 150, 105, 0.28);
      box-shadow: 0 10px 35px rgba(15, 23, 42, 0.07);
    }

    :host-context(.light-theme) .toolbar-divider {
      background: rgba(15, 23, 42, 0.08);
    }

    :host-context(.light-theme) .select-field-wrap label,
    :host-context(.light-theme) .jump-ayah-group label {
      color: #475569;
    }

    :host-context(.light-theme) .toolbar-select {
      background: #f8fafc;
      color: #0f172a;
      border-color: rgba(15, 23, 42, 0.15);
    }

    :host-context(.light-theme) .toolbar-select:hover,
    :host-context(.light-theme) .toolbar-select:focus {
      border-color: #059669;
      background: #ffffff;
    }

    :host-context(.light-theme) .btn-pager-mini {
      background: #f1f5f9;
      border-color: rgba(15, 23, 42, 0.12);
      color: #1e293b;
    }

    :host-context(.light-theme) .btn-pager-mini:hover:not(:disabled) {
      background: rgba(16, 185, 129, 0.15);
      border-color: #059669;
      color: #047857;
    }

    :host-context(.light-theme) .font-size-toolbar-group {
      background: #f1f5f9;
      border-color: rgba(15, 23, 42, 0.15);
    }

    :host-context(.light-theme) .btn-font-action {
      color: #1e293b;
    }

    :host-context(.light-theme) .btn-font-value {
      background: #ffffff;
      color: #b45309;
      border-color: rgba(15, 23, 42, 0.1);
    }

    :host-context(.light-theme) .bismillah-text {
      color: #b45309;
    }

    :host-context(.light-theme) .mushaf-page-box {
      background: #ffffff;
      border-color: rgba(217, 119, 6, 0.4);
      box-shadow: 0 10px 40px rgba(15, 23, 42, 0.06);
    }

    :host-context(.light-theme) .mushaf-text {
      color: #0f172a;
    }

    :host-context(.light-theme) .mushaf-ayah-span:hover {
      background: rgba(16, 185, 129, 0.12);
    }

    :host-context(.light-theme) .mushaf-ayah-span.active-ayah {
      background: rgba(245, 158, 11, 0.2);
      color: #92400e;
    }

    :host-context(.light-theme) .ayah-card {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.08);
      box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
    }

    :host-context(.light-theme) .ayah-card.playing-ayah-card {
      background: rgba(245, 158, 11, 0.06);
      border-color: #d97706;
      box-shadow: 0 4px 20px rgba(217, 119, 6, 0.15);
    }

    :host-context(.light-theme) .ayah-body {
      color: #0f172a;
    }

    :host-context(.light-theme) .ayah-index-pill {
      color: #475569;
    }

    :host-context(.light-theme) .ayah-index-pill strong {
      color: #b45309;
    }

    :host-context(.light-theme) .ayah-meta-chip {
      background: #f1f5f9;
      color: #475569;
    }

    :host-context(.light-theme) .btn-icon {
      background: #f1f5f9;
      color: #475569;
    }

    :host-context(.light-theme) .btn-icon:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    /* Light Theme Search Box Overrides */
    :host-context(.light-theme) .search-input-wrapper {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.14);
      box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
    }

    :host-context(.light-theme) .search-input-wrapper:focus-within {
      border-color: var(--primary-emerald);
      box-shadow: 0 0 20px rgba(5, 150, 105, 0.15);
    }

    :host-context(.light-theme) .surah-search-input {
      color: #0f172a;
    }

    :host-context(.light-theme) .surah-search-input::placeholder {
      color: #64748b;
    }

    :host-context(.light-theme) .surah-quick-select {
      background: #f1f5f9;
      color: #b45309;
      border-color: rgba(217, 119, 6, 0.35);
    }

    :host-context(.light-theme) .surah-results-dropdown {
      background: #ffffff;
      border-color: rgba(5, 150, 105, 0.3);
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
    }

    :host-context(.light-theme) .dropdown-header {
      background: #f8fafc;
      border-bottom-color: rgba(15, 23, 42, 0.08);
      color: #475569;
    }

    :host-context(.light-theme) .dropdown-header-title {
      color: #b45309;
    }

    :host-context(.light-theme) .dropdown-surah-item {
      color: #0f172a;
    }

    :host-context(.light-theme) .dropdown-surah-item:hover {
      background: rgba(5, 150, 105, 0.07);
      border-color: rgba(5, 150, 105, 0.2);
    }

    :host-context(.light-theme) .dropdown-surah-item.current-surah {
      background: rgba(5, 150, 105, 0.1);
      border-color: var(--primary-emerald);
    }

    :host-context(.light-theme) .item-arabic-name {
      color: #0f172a;
    }

    :host-context(.light-theme) .item-sub-row {
      color: #64748b;
    }

    @media (max-width: 992px) {
      .top-nav-bar {
        flex-direction: column;
        align-items: stretch;
      }
      .surah-search-box {
        max-width: 100%;
        order: 2;
      }
      .surah-pager {
        order: 3;
        justify-content: space-between;
      }
      .pager-text-full {
        display: none;
      }
      .pager-text-short {
        display: inline;
      }
    }

    @media (max-width: 900px) {
      .toolbar-row {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }

      .toolbar-group {
        width: 100%;
        justify-content: space-between;
      }

      .surah-switcher-group {
        display: flex;
        width: 100%;
        align-items: center;
        gap: 6px;
      }

      .surah-switcher-group .select-field-wrap {
        flex: 1;
      }

      .surah-main-select {
        max-width: none;
        width: 100%;
      }

      .reciter-picker-group {
        width: 100%;
      }

      .reciter-picker-group .select-field-wrap {
        width: 100%;
      }

      .reciter-main-select {
        width: 100%;
      }

      .secondary-actions-cluster {
        display: flex;
        width: 100%;
        gap: 6px;
      }

      .secondary-actions-cluster .btn-ghost {
        flex: 1;
        justify-content: center;
        padding: 8px 6px;
        font-size: 0.85rem;
      }

      .font-size-toolbar-group {
        width: 100%;
        justify-content: space-between;
      }

      .font-size-toolbar-group .btn-font-value {
        flex: 1;
        text-align: center;
      }

      .jump-ayah-group {
        width: 100%;
        justify-content: space-between;
      }

      .jump-ayah-group .jump-select {
        flex: 1;
      }
    }

    @media (max-width: 768px) {
      .audio-selection-toolbar {
        padding: 14px;
      }
      .pager-mini-label {
        display: none;
      }
      .mushaf-text {
        font-size: 1.45rem;
      }
      .ayah-body {
        font-size: 1.45rem;
      }
    }
  `]
})
export class SurahDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  player = inject(AudioPlayerService);
  bookmarks = inject(BookmarksService);
  shareService = inject(ShareService);

  surah: SurahDetail | null = null;
  allSurahs: Surah[] = [];
  filteredSurahsList: Surah[] = [];
  surahSearchQuery = '';
  isSearchOpen = false;

  reciters: Reciter[] = [];
  selectedReciter = 'ar.alafasy';
  loading = true;
  viewMode: 'mushaf' | 'list' = 'mushaf';
  fontSize = 28;
  selectedAyahJump: number | undefined = undefined;

  ngOnInit() {
    this.loadReciters();
    this.loadAllSurahs();
    this.route.params.subscribe((params) => {
      const id = parseInt(params['id']);
      if (id) {
        this.loadSurah(id);
      }
    });
  }

  loadAllSurahs() {
    this.api.getSurahs().subscribe({
      next: (res) => {
        if (res.data) {
          this.allSurahs = res.data;
          this.filteredSurahsList = res.data;
        }
      },
    });
  }

  getSurahName(num: number): string {
    const found = this.allSurahs.find((s) => s.number === num);
    return found ? found.name : `سورة ${num}`;
  }

  normalizeArabic(text: string): string {
    if (!text) return '';
    return text
      .replace(/[ًٌٍَُِّْـٰ]/g, '')
      .replace(/[أإآء]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .trim()
      .toLowerCase();
  }

  onSurahSearchInput() {
    this.isSearchOpen = true;
    if (!this.surahSearchQuery || !this.surahSearchQuery.trim()) {
      this.filteredSurahsList = this.allSurahs;
      return;
    }

    const q = this.normalizeArabic(this.surahSearchQuery);
    const qNum = parseInt(this.surahSearchQuery.trim());

    this.filteredSurahsList = this.allSurahs.filter((s) => {
      if (!isNaN(qNum) && s.number === qNum) return true;
      const normName = this.normalizeArabic(s.name);
      const cleanArabic = normName.replace(/^سوره\s*/, '');
      const normEnglish = s.englishName ? s.englishName.toLowerCase() : '';
      return normName.includes(q) || cleanArabic.includes(q) || normEnglish.includes(q);
    });
  }

  onSearchFocus() {
    this.isSearchOpen = true;
    if (!this.surahSearchQuery) {
      this.filteredSurahsList = this.allSurahs;
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.isSearchOpen = false;
    }
  }

  clearSearch(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.surahSearchQuery = '';
    this.filteredSurahsList = this.allSurahs;
  }

  navigateToSurah(surahNumber: number) {
    if (!surahNumber) return;
    this.isSearchOpen = false;
    this.surahSearchQuery = '';
    this.router.navigate(['/quran/surah', surahNumber]);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.surah-search-box')) {
      this.isSearchOpen = false;
    }
  }

  loadReciters() {
    this.api.getReciters().subscribe({
      next: (res) => {
        if (res.data) {
          this.reciters = res.data;
        }
      },
    });
  }

  loadSurah(number: number) {
    this.loading = true;
    this.api.getSurahDetail(number, this.selectedReciter).subscribe({
      next: (res) => {
        if (res.data) {
          this.surah = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onReciterChange() {
    if (this.surah) {
      this.loadSurah(this.surah.number);
    }
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'mushaf' ? 'list' : 'mushaf';
  }

  playAyah(ayah: Ayah, index: number) {
    if (!this.surah) return;
    const reciterName = this.reciters.find((r) => r.id === this.selectedReciter)?.name || 'القارئ';
    this.player.playAyah(ayah, this.surah, index, reciterName);
  }

  playFullSurah() {
    if (!this.surah || !this.surah.ayahs.length) return;
    this.playAyah(this.surah.ayahs[0], 0);
  }

  copyAyah(text: string) {
    navigator.clipboard.writeText(text);
    alert('تم نسخ الآية الكريمة بنجاح');
  }

  // Remove Bismillah from Ayah 1 text for display if not Al-Fatiha
  cleanAyahText(text: string, surahNum: number, ayahNum: number): string {
    if (surahNum !== 1 && surahNum !== 9 && ayahNum === 1) {
      return text.replace(/﻿?بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/g, '');
    }
    return text;
  }

  isAyahBookmarked(ayah: Ayah): boolean {
    if (!this.surah) return false;
    return this.bookmarks.isBookmarked(`ayah-${this.surah.number}-${ayah.numberInSurah}`);
  }

  toggleAyahBookmark(ayah: Ayah) {
    if (!this.surah) return;
    const cleanText = this.cleanAyahText(ayah.text, this.surah.number, ayah.numberInSurah);
    this.bookmarks.toggleBookmark({
      id: `ayah-${this.surah.number}-${ayah.numberInSurah}`,
      type: 'ayah',
      title: `${this.surah.name} • الآية ${ayah.numberInSurah}`,
      arabicText: cleanText,
      subtitle: `الجزء ${ayah.juz} • صفحة ${ayah.page}`,
      sourceUrl: `/quran/surah/${this.surah.number}`,
      meta: {
        surahNumber: this.surah.number,
        ayahNumber: ayah.numberInSurah,
      },
      createdAt: new Date().toISOString(),
    });
  }

  shareAyah(ayah: Ayah) {
    if (!this.surah) return;
    const cleanText = this.cleanAyahText(ayah.text, this.surah.number, ayah.numberInSurah);
    this.shareService.openShare({
      title: `${this.surah.name} • الآية ${ayah.numberInSurah}`,
      text: cleanText,
      url: `/quran/surah/${this.surah.number}`,
      subtitle: `من سورة ${this.surah.name} (آية ${ayah.numberInSurah})`,
      type: 'ayah',
    });
  }

  isSurahBookmarked(): boolean {
    if (!this.surah) return false;
    return this.bookmarks.isBookmarked(`surah-${this.surah.number}`);
  }

  toggleSurahBookmark() {
    if (!this.surah) return;
    this.bookmarks.toggleBookmark({
      id: `surah-${this.surah.number}`,
      type: 'surah',
      title: `${this.surah.name} (${this.surah.englishName})`,
      arabicText: `سورة ${this.surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • عدد آياتها ${this.surah.numberOfAyahs} آية`,
      subtitle: `ترتيبها في المصحف: ${this.surah.number}`,
      sourceUrl: `/quran/surah/${this.surah.number}`,
      meta: {
        surahNumber: this.surah.number,
      },
      createdAt: new Date().toISOString(),
    });
  }

  shareSurah() {
    if (!this.surah) return;
    this.shareService.openShare({
      title: `${this.surah.name} كاملة برسم المصحف والتلاوات`,
      text: `استمع واقرأ ${this.surah.name} (${this.surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - ${this.surah.numberOfAyahs} آية) بأصوات كبار القراء عبر منصة نُورٌ وَهُدَى`,
      url: `/quran/surah/${this.surah.number}`,
      subtitle: `سورة ${this.surah.name}`,
      type: 'surah',
    });
  }

  isCurrentSurahPlaying(): boolean {
    return this.player.isPlaying() && this.player.currentSurah()?.number === this.surah?.number;
  }

  togglePlaySurah() {
    if (this.isCurrentSurahPlaying()) {
      this.player.togglePlay();
    } else {
      this.playFullSurah();
    }
  }

  jumpToAyah(ayahNum: number) {
    if (!ayahNum) return;
    this.selectedAyahJump = ayahNum;
    setTimeout(() => {
      const el = document.getElementById(`ayah-item-${ayahNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('jump-highlight');
        setTimeout(() => el.classList.remove('jump-highlight'), 2200);
      }
    }, 50);
  }

  increaseFontSize() {
    if (this.fontSize < 46) {
      this.fontSize += 2;
    }
  }

  decreaseFontSize() {
    if (this.fontSize > 18) {
      this.fontSize -= 2;
    }
  }

  resetFontSize() {
    this.fontSize = 28;
  }

  copyFullSurah() {
    if (!this.surah || !this.surah.ayahs) return;
    const bismillah = (this.surah.number !== 1 && this.surah.number !== 9) ? 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\n\n' : '';
    const text = bismillah + this.surah.ayahs.map(a => `${this.cleanAyahText(a.text, this.surah!.number, a.numberInSurah)} (${a.numberInSurah})`).join(' ');
    navigator.clipboard.writeText(`سورة ${this.surah.name}\n\n${text}`);
    alert(`تم نسخ سورة ${this.surah.name} الكريمة كاملة بنجاح 📋`);
  }
}
