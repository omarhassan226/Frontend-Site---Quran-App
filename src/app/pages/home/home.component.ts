import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivityTrackerService } from '../../services/activity-tracker.service';
import { Hadith } from '../../models/hadith.model';
import { Reflection } from '../../models/reflection.model';
import { Memorial } from '../../models/memorial.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="home-wrapper">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container hero-container">
          <div class="hero-badge">
            <i class="fa-solid fa-moon"></i> موقع إسلامي موثوق • صدقة جارية لروح جدتي
          </div>
          <h1 class="hero-title">
            نُورٌ مِنَ القُرآنِ وَهُدًى مِنَ السُّنَّةِ
          </h1>
          <p class="hero-subtitle">
            اقرأ وتدبّر آيات الذكر الحكيم، واستمع لتلاوات أندى القراء، وتعرّف على صحيح هدي المصطفى ﷺ بدرجاتها ومصادرها المعتمدة.
          </p>

          <!-- Search Bar -->
          <div class="search-box-card card-glass">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
              placeholder="ابحث في القرآن الكريم أو الأحاديث النبوية (مثلاً: قيام الليل، الصبر، التوبة...)"
              class="search-input"
            />
            <button class="btn-primary search-btn" (click)="onSearch()">
              <span>بحث</span>
              <i class="fa-solid fa-arrow-left"></i>
            </button>
          </div>

          <!-- Quick Navigation Tags -->
          <div class="quick-tags">
            <span class="tag-label">مواضيع مؤثرة:</span>
            <a routerLink="/hadiths" [queryParams]="{ topic: 'قيام الليل والمواعظ' }" class="quick-tag">
              <i class="fa-solid fa-star-and-crescent"></i> قيام الليل
            </a>
            <a routerLink="/hadiths" [queryParams]="{ topic: 'الموت والآخرة' }" class="quick-tag">
              <i class="fa-solid fa-hourglass-half"></i> الموت والآخرة
            </a>
            <a routerLink="/hadiths" [queryParams]="{ topic: 'الصدقة الجارية والبر' }" class="quick-tag">
              <i class="fa-solid fa-hand-holding-heart"></i> الصدقة الجارية
            </a>
            <a routerLink="/hadiths" [queryParams]="{ topic: 'التوبة والاستغفار' }" class="quick-tag">
              <i class="fa-solid fa-water"></i> التوبة والاستغفار
            </a>
          </div>
        </div>
      </section>

      <!-- Memorial & Charity Banner -->
      <section class="memorial-section container">
        <div class="memorial-hero-card card-glass">
          <div class="memorial-left">
            <div class="grandma-ribbon">
              <i class="fa-solid fa-heart"></i> إهداء ودعاء بالرحمة
            </div>
            <h2 class="memorial-title">{{ memorial?.dedicationTitle || 'صدقة جارية عن روح جدتي رحمها الله' }}</h2>
            <p class="memorial-dua font-hadith">
              {{ memorial?.duaText || 'اللهم اغفر لها وارحمها وعافها واعفُ عنها، وأكرم نزلها، ووسّع مدخلها، واجعل قبرها روضة من رياض الجنة.' }}
            </p>
            <div class="prayer-action-row">
              <button class="btn-pray-now" (click)="prayForGrandmother()" [disabled]="hasPrayed">
                <i class="fa-solid fa-hands-praying"></i>
                <span>{{ hasPrayed ? 'جزاك الله خيراً، تقبل الله دعاءك' : 'اللهم آمين (ادعُ لها بضغطة زر)' }}</span>
              </button>
              <div class="prayers-counter-badge">
                <i class="fa-solid fa-users"></i>
                <span><strong>{{ memorial?.prayersCount || 1 }}</strong> دعاء سُجّل حتى الآن</span>
              </div>
            </div>
          </div>
          <div class="memorial-right">
            <div class="tasbeeh-quick-box">
              <span class="box-label">مجموع التسبيحات في المنصة</span>
              <span class="box-number">{{ memorial?.tasbeehCount || 0 }}</span>
              <span class="box-sub">تسبيحة مهداة في ميزان حسناتها</span>
              <button class="btn-quick-tasbeeh" (click)="incrementSubha()">
                <i class="fa-solid fa-fingerprint"></i>
                <span>تسبيحة سريعة +1</span>
              </button>
              <a href="#home-masbaha" class="link-more-duas">
                <span>المسبحة التفاعلية أدناه</span>
                <i class="fa-solid fa-arrow-down"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Today's Touching Hadith & Ayah -->
      <section class="daily-section container">
        <div class="daily-grid">
          <!-- Featured Hadith (e.g. Gabriel's advice) -->
          @if (featuredHadith) {
            <div class="daily-card card-glass hadith-spotlight">
              <div class="card-top-tag">
                <span class="badge badge-gold"><i class="fa-solid fa-crown"></i> وصية وموعظة جامعة</span>
                <span class="badge badge-emerald">{{ featuredHadith.grading }} • {{ featuredHadith.scholar }}</span>
              </div>
              <h3 class="daily-card-title">{{ featuredHadith.title }}</h3>
              <p class="hadith-text-highlight font-hadith">
                {{ featuredHadith.text }}
              </p>
              <div class="hadith-meta-footer">
                <div class="narrator-source">
                  <span><strong>الراوي:</strong> {{ featuredHadith.narrator }}</span>
                  <span><strong>المصدر:</strong> {{ featuredHadith.source }} ({{ featuredHadith.hadithNumber }})</span>
                </div>
                <div class="action-buttons">
                  <button class="btn-icon" (click)="copyText(featuredHadith.text)" title="نسخ الحديث">
                    <i class="fa-regular fa-copy"></i>
                  </button>
                  <a [routerLink]="['/hadiths']" [queryParams]="{ search: featuredHadith.title }" class="btn-more">
                    تخريج وشرح الحديث <i class="fa-solid fa-arrow-left"></i>
                  </a>
                </div>
              </div>
            </div>
          }

          <!-- Random Reflection of the Day -->
          @if (dailyReflection) {
            <div class="daily-card card-glass reflection-spotlight">
              <div class="card-top-tag">
                <span class="badge badge-purple"><i class="fa-solid fa-feather-pointed"></i> رقائق الصالحين</span>
                <span class="badge badge-blue">{{ dailyReflection.category }}</span>
              </div>
              <h3 class="daily-card-title">موعظة توقظ الغافل</h3>
              <blockquote class="reflection-quote font-hadith">
                «{{ dailyReflection.quote }}»
              </blockquote>
              <div class="reflection-author-tag">
                — {{ dailyReflection.author }}
                <span class="ref-source">({{ dailyReflection.source }})</span>
              </div>
              <div class="reflection-actions">
                <button class="btn-ghost" (click)="fetchRandomReflection()">
                  <i class="fa-solid fa-shuffle"></i> موعظة أخرى
                </button>
                <a routerLink="/reflections" class="btn-more">
                  كل المواعظ <i class="fa-solid fa-arrow-left"></i>
                </a>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Interactive Digital Masbaha Section (المسبحة الإلكترونية التفاعلية) -->
      <section id="home-masbaha" class="masbaha-section container">
        <div class="masbaha-card card-glass">
          <div class="masbaha-header">
            <span class="badge badge-emerald">
              <i class="fa-solid fa-bead-necklace"></i> المسبحة الإلكترونية التفاعلية
            </span>
            <h2 class="masbaha-title">سبّح واذكر الله واهدِ ثوابه</h2>
            <p class="masbaha-desc">
              كل تسبيحة تضغطها تُسجل فوراً في ميزان حسنات الصدقة الجارية وتثقل الموازين بإذن الله.
            </p>
          </div>

          <!-- Phrase Selector Chips -->
          <div class="subha-phrases-grid">
            @for (phrase of subhaPhrases; track phrase) {
              <button
                class="subha-chip-btn"
                [class.active]="selectedPhrase === phrase"
                (click)="selectPhrase(phrase)"
              >
                {{ phrase }}
              </button>
            }
          </div>

          <!-- Interactive Ring Counter -->
          <div class="masbaha-ring-wrap">
            <div
              class="subha-ring-button"
              [class.clicked]="isSubhaAnimating"
              (click)="incrementSubha()"
              role="button"
              tabindex="0"
              aria-label="تسبيح"
            >
              <span class="subha-number">{{ currentSubhaCount }}</span>
              <span class="subha-cycle-badge">
                <i class="fa-solid fa-rotate"></i> الدورة {{ getCycleNumber() }} ({{ currentSubhaCount % 33 }}/33)
              </span>
              <span class="subha-tap-hint">
                <i class="fa-solid fa-fingerprint"></i> اضغط للتسبيح
              </span>
            </div>
          </div>

          <!-- Current Phrase Display -->
          <div class="subha-active-display">
            <p class="subha-current-phrase font-hadith">{{ selectedPhrase }}</p>
          </div>

          <!-- Subha Footer Actions -->
          <div class="subha-bottom-actions">
            <button class="btn-ghost" (click)="resetSubha()" title="تصفير عداد هذه الجلسة">
              <i class="fa-solid fa-rotate-right"></i> تصفير المسبحة
            </button>
            <div class="subha-platform-counter">
              <i class="fa-solid fa-heart-pulse"></i>
              <span>إجمالي تسبيحات المنصة: <strong>{{ memorial?.tasbeehCount || 0 }}</strong></span>
            </div>
            <button class="btn-ghost" (click)="nextPhrase()" title="الانتقال للذكر التالي">
              <span>الذكر التالي</span>
              <i class="fa-solid fa-forward-step"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- Main Portals Grid -->
      <section class="portals-section container">
        <div class="section-header">
          <span class="badge badge-emerald"><i class="fa-solid fa-cubes"></i> أبواب الخير</span>
          <h2 class="section-title">استكشف أقسام منصة نور وهُدى</h2>
          <p class="section-desc">كل ما يحتاجه المسلم من كلام الله، وسنة نبيه، وأدعية وأذكار، ومواعظ تزكي النفس في مكان واحد.</p>
        </div>

        <div class="portals-grid">
          <!-- Quran Portal -->
          <a routerLink="/quran" class="portal-card card-glass">
            <div class="portal-icon emerald">
              <i class="fa-solid fa-book-quran"></i>
            </div>
            <h3 class="portal-title">القرآن الكريم والتلاوات</h3>
            <p class="portal-desc">
              تصفح سور القرآن الـ 114 بالرسم العثماني، مع إمكانية الاستماع بأصوات كبار المشايخ (العفاسي، المنشاوي، عبدالباسط، الحصري، المعيقلي).
            </p>
            <span class="portal-link">
              <span>تصفح المصحف المرتل</span>
              <i class="fa-solid fa-arrow-left"></i>
            </span>
          </a>

          <!-- Hadiths Portal -->
          <a routerLink="/hadiths" class="portal-card card-glass">
            <div class="portal-icon gold">
              <i class="fa-solid fa-scroll"></i>
            </div>
            <h3 class="portal-title">الأحاديث النبوية الموثقة</h3>
            <p class="portal-desc">
              موسوعة من الأحاديث المحققة في قيام الليل، الموت والآخرة، التوبة، الصدقة والبر، مع حكم المحدّثين وروابط التخريج من الدرر السنية.
            </p>
            <span class="portal-link">
              <span>استكشف صحيح السنة</span>
              <i class="fa-solid fa-arrow-left"></i>
            </span>
          </a>

          <!-- Azkar Portal -->
          <a routerLink="/azkar" class="portal-card card-glass">
            <div class="portal-icon blue">
              <i class="fa-solid fa-hands-praying"></i>
            </div>
            <h3 class="portal-title">أذكار المسلم والمسبحة</h3>
            <p class="portal-desc">
              أذكار الصباح والمساء، أذكار النوم والصلاة، مع عداد ومسبحة تفاعلية تساعدك على المداومة وتضيف في ميزان حسنات الصدقة الجارية.
            </p>
            <span class="portal-link">
              <span>اقرأ الأذكار الآن</span>
              <i class="fa-solid fa-arrow-left"></i>
            </span>
          </a>

          <!-- Reflections Portal -->
          <a routerLink="/reflections" class="portal-card card-glass">
            <div class="portal-icon purple">
              <i class="fa-solid fa-heart-pulse"></i>
            </div>
            <h3 class="portal-title">رقائق ومواعظ السلف</h3>
            <p class="portal-desc">
              كلمات تهدي القلوب من أقوال الحسن البصري، الفضيل بن عياض، عمر بن عبد العزيز، وابن القيم، لتذكير النفس بحقيقة الدنيا والاستعداد للقاء الله.
            </p>
            <span class="portal-link">
              <span>تأمل المواعظ</span>
              <i class="fa-solid fa-arrow-left"></i>
            </span>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-wrapper {
      padding-bottom: 40px;
    }

    /* Hero Section */
    .hero-section {
      padding: 70px 0 40px 0;
      text-align: center;
      position: relative;
    }

    .hero-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 18px;
      border-radius: var(--radius-full);
      background: rgba(16, 185, 129, 0.12);
      color: var(--text-emerald);
      border: 1px solid var(--border-emerald);
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .hero-title {
      font-size: 2.8rem;
      font-weight: 900;
      line-height: 1.25;
      color: var(--text-main);
      max-width: 850px;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }

    .hero-subtitle {
      font-size: 1.15rem;
      color: var(--text-muted);
      max-width: 700px;
      margin-bottom: 35px;
      line-height: 1.8;
    }

    /* Search Box */
    .search-box-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px 8px 18px;
      width: 100%;
      max-width: 680px;
      border-radius: var(--radius-full);
      background: rgba(15, 23, 42, 0.85);
      border: 1.5px solid var(--border-subtle);
      box-shadow: var(--shadow-md);
      transition: border-color 0.25s, box-shadow 0.25s;
    }

    .search-box-card:focus-within {
      border-color: var(--primary-emerald);
      box-shadow: 0 0 25px var(--primary-emerald-glow);
    }

    .search-icon {
      color: var(--text-muted);
      font-size: 1.1rem;
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-main);
      font-size: 1rem;
      font-family: inherit;
    }

    .search-btn {
      border-radius: var(--radius-full);
      padding: 10px 24px;
    }

    .quick-tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 24px;
    }

    .tag-label {
      color: var(--text-muted);
      font-size: 0.88rem;
      font-weight: 600;
    }

    .quick-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      font-size: 0.85rem;
      color: var(--text-muted);
      transition: all 0.2s;
    }

    .quick-tag:hover {
      background: rgba(16, 185, 129, 0.15);
      color: var(--text-emerald);
      border-color: var(--border-emerald);
    }

    /* Memorial Hero Card */
    .memorial-section {
      margin-top: 30px;
      margin-bottom: 50px;
    }

    .memorial-hero-card {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
      padding: 35px;
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.25), rgba(15, 23, 42, 0.9));
      border: 1px solid var(--border-emerald);
      border-radius: var(--radius-xl);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }

    .grandma-ribbon {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(225, 29, 72, 0.2);
      color: #fda4af;
      border: 1px solid rgba(225, 29, 72, 0.3);
      padding: 4px 14px;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .memorial-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-gold);
      margin-bottom: 12px;
    }

    .memorial-dua {
      font-size: 1.15rem;
      color: var(--text-main);
      line-height: 2.1;
      margin-bottom: 22px;
    }

    .prayer-action-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }

    .btn-pray-now {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #e11d48, #9f1239);
      color: #ffffff;
      padding: 12px 24px;
      border-radius: var(--radius-full);
      font-weight: 700;
      font-size: 0.95rem;
      box-shadow: 0 4px 18px rgba(225, 29, 72, 0.4);
      transition: all 0.25s ease;
      cursor: pointer;
    }

    .btn-pray-now:hover:not(:disabled) {
      transform: scale(1.03);
      box-shadow: 0 6px 24px rgba(225, 29, 72, 0.6);
    }

    .btn-pray-now:disabled {
      background: #047857;
      box-shadow: none;
      cursor: default;
    }

    .prayers-counter-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.06);
      padding: 10px 18px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-subtle);
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .prayers-counter-badge strong {
      color: var(--gold-light);
    }

    .tasbeeh-quick-box {
      background: rgba(15, 23, 42, 0.6);
      border: 1px dashed var(--border-emerald);
      border-radius: var(--radius-lg);
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 100%;
    }

    :host-context(.light-theme) .tasbeeh-quick-box {
      border: 1px dashed var(--border-emerald);
      border-radius: var(--radius-lg);
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 100%;
    }

    .box-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .box-number {
      font-size: 2.4rem;
      font-weight: 900;
      color: var(--text-emerald);
      line-height: 1.1;
      margin-bottom: 6px;
    }

    .box-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 16px;
    }

    .link-more-duas {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.88rem;
      color: var(--gold-light);
      font-weight: 600;
    }

    /* Daily Spotlight Section */
    .daily-section {
      margin-bottom: 60px;
    }

    .daily-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 25px;
    }

    .daily-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
    }

    .card-top-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
    }

    .daily-card-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 14px;
    }

    .hadith-text-highlight {
      font-size: 1.25rem;
      line-height: 2.2;
      color: var(--text-gold);
      background: rgba(217, 119, 6, 0.05);
      border-right: 4px solid var(--gold-accent);
      padding: 16px 20px;
      border-radius: var(--radius-md);
      margin-bottom: 18px;
      flex: 1;
    }

    .hadith-meta-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 14px;
      font-size: 0.85rem;
      color: var(--text-muted);
      gap: 12px;
    }

    .narrator-source {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .narrator-source strong {
      color: var(--text-main);
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 10px;
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

    .btn-more {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-emerald);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .reflection-quote {
      font-size: 1.2rem;
      line-height: 2.1;
      color: var(--text-main);
      font-style: italic;
      margin-bottom: 18px;
      flex: 1;
    }

    .reflection-author-tag {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--gold-light);
      margin-bottom: 18px;
    }

    .ref-source {
      font-weight: 400;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .reflection-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 14px;
    }

    /* Portals Section */
    .portals-section {
      margin-bottom: 50px;
    }

    .section-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-main);
      margin-top: 10px;
      margin-bottom: 10px;
    }

    .section-desc {
      color: var(--text-muted);
      font-size: 1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .portals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 22px;
    }

    .portal-card {
      padding: 30px;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .portal-icon {
      width: 58px;
      height: 58px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      margin-bottom: 20px;
    }

    .portal-icon.emerald {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .portal-icon.gold {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .portal-icon.blue {
      background: rgba(59, 130, 246, 0.15);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .portal-icon.purple {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .portal-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 10px;
    }

    .portal-desc {
      color: var(--text-muted);
      font-size: 0.92rem;
      line-height: 1.7;
      margin-bottom: 22px;
      flex: 1;
    }

    .portal-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--text-emerald);
      font-weight: 700;
      font-size: 0.9rem;
      transition: transform 0.2s;
    }

    .portal-card:hover .portal-link {
      transform: translateX(-4px);
    }

    /* Light Theme Enhancements for Home */
    :host-context(.light-theme) .hero-title {
      color: #0f172a;
    }

    :host-context(.light-theme) .hero-subtitle {
      color: #334155;
    }

    :host-context(.light-theme) .hero-badge {
      background: rgba(16, 185, 129, 0.1);
      color: #065f46;
      border-color: rgba(16, 185, 129, 0.3);
    }

    :host-context(.light-theme) .search-box-card {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.12);
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
    }

    :host-context(.light-theme) .search-input {
      color: #0f172a;
    }

    :host-context(.light-theme) .search-input::placeholder {
      color: #64748b;
    }

    :host-context(.light-theme) .tag-label {
      color: #475569;
    }

    :host-context(.light-theme) .memorial-hero-card {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), #ffffff);
      border-color: rgba(5, 150, 105, 0.25);
      box-shadow: 0 10px 30px rgba(5, 150, 105, 0.06);
    }

    :host-context(.light-theme) .memorial-title {
      color: #b45309;
    }

    :host-context(.light-theme) .memorial-dua {
      color: #0f172a;
    }

    :host-context(.light-theme) .tasbeeh-quick-box {
      background: #f8fafc;
      border-color: rgba(5, 150, 105, 0.3);
    }

    :host-context(.light-theme) .box-label {
      color: #475569;
    }

    :host-context(.light-theme) .box-number {
      color: #047857;
    }

    :host-context(.light-theme) .box-sub {
      color: #64748b;
    }

    :host-context(.light-theme) .link-more-duas {
      color: #b45309;
    }

    :host-context(.light-theme) .prayers-counter-badge {
      background: #f8fafc;
      border-color: rgba(15, 23, 42, 0.1);
      color: #334155;
    }

    :host-context(.light-theme) .prayers-counter-badge strong {
      color: #b45309;
    }

    :host-context(.light-theme) .daily-card-title,
    :host-context(.light-theme) .portal-title {
      color: #0f172a;
    }

    :host-context(.light-theme) .hadith-text-highlight {
      background: rgba(217, 119, 6, 0.08);
      color: #92400e;
      border-right-color: #d97706;
    }

    :host-context(.light-theme) .reflection-quote {
      background: rgba(168, 85, 247, 0.08);
      color: #581c87;
      border-right-color: #9333ea;
    }

    :host-context(.light-theme) .narrator-source,
    :host-context(.light-theme) .portal-desc {
      color: #475569;
    }

    @media (max-width: 900px) {
      .hero-title {
        font-size: 2.1rem;
      }
      .memorial-hero-card {
        grid-template-columns: 1fr;
      }
      .daily-grid {
        grid-template-columns: 1fr;
      }
      .masbaha-card {
        padding: 30px 18px;
      }
      .subha-ring-button {
        width: 180px;
        height: 180px;
      }
      .subha-number {
        font-size: 3.2rem;
      }
    }

    /* Quick Tasbeeh Button in Hero Memorial Banner */
    .btn-quick-tasbeeh {
      margin-top: 10px;
      margin-bottom: 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 20px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--primary-emerald), #059669);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
    }

    .btn-quick-tasbeeh:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
    }

    .btn-quick-tasbeeh:active {
      transform: scale(0.96);
    }

    /* Dedicated Masbaha Section on Home Page */
    .masbaha-section {
      margin-bottom: 70px;
    }

    .masbaha-card {
      padding: 40px 30px;
      border-radius: var(--radius-xl);
      text-align: center;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.25), rgba(15, 23, 42, 0.92));
      border: 1.5px solid var(--border-emerald);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
    }

    .masbaha-header {
      margin-bottom: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .masbaha-title {
      font-size: 2.1rem;
      font-weight: 900;
      color: var(--text-main);
      margin: 12px 0 8px 0;
    }

    .masbaha-desc {
      font-size: 1rem;
      color: var(--text-muted);
      max-width: 650px;
      line-height: 1.6;
    }

    /* Phrase Selection Grid */
    .subha-phrases-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-bottom: 35px;
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;
    }

    .subha-chip-btn {
      padding: 9px 20px;
      border-radius: var(--radius-full);
      font-size: 0.92rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .subha-chip-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-main);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .subha-chip-btn.active {
      background: linear-gradient(135deg, var(--primary-emerald), #047857);
      color: #ffffff;
      border-color: var(--primary-emerald-light);
      box-shadow: 0 4px 15px var(--primary-emerald-glow);
    }

    /* Subha Ring Button */
    .masbaha-ring-wrap {
      display: flex;
      justify-content: center;
      margin-bottom: 25px;
    }

    .subha-ring-button {
      width: 210px;
      height: 210px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #0f172a 30%, #064e3b 85%, #047857 100%);
      border: 5px solid var(--primary-emerald);
      box-shadow: 0 0 40px var(--primary-emerald-glow), inset 0 0 20px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      position: relative;
      transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
    }

    .subha-ring-button:hover {
      box-shadow: 0 0 55px rgba(16, 185, 129, 0.55), inset 0 0 25px rgba(16, 185, 129, 0.2);
      transform: scale(1.04);
    }

    .subha-ring-button:active,
    .subha-ring-button.clicked {
      transform: scale(0.94);
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.8);
    }

    .subha-number {
      font-size: 3.8rem;
      font-weight: 900;
      color: #a7f3d0;
      line-height: 1;
      text-shadow: 0 2px 12px rgba(16, 185, 129, 0.4);
    }

    .subha-cycle-badge {
      margin-top: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--gold-light);
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .subha-tap-hint {
      font-size: 0.82rem;
      color: #e2e8f0;
      margin-top: 6px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    /* Active Display */
    .subha-active-display {
      margin-bottom: 25px;
      padding: 12px 24px;
      display: inline-block;
      border-radius: var(--radius-full);
      background: rgba(217, 119, 6, 0.12);
      border: 1px solid rgba(217, 119, 6, 0.3);
    }

    .subha-current-phrase {
      font-size: 1.45rem;
      color: var(--text-gold);
      font-weight: 700;
      line-height: 1.5;
    }

    /* Subha Bottom Actions */
    .subha-bottom-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 22px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .subha-platform-counter {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.95rem;
      color: var(--text-muted);
    }

    .subha-platform-counter i {
      color: #ef4444;
    }

    .subha-platform-counter strong {
      color: var(--text-emerald);
      font-size: 1.15rem;
      font-weight: 800;
    }

    /* Light Theme Overrides for Masbaha */
    :host-context(.light-theme) .btn-quick-tasbeeh {
      background: linear-gradient(135deg, #059669, #047857);
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
    }

    :host-context(.light-theme) .masbaha-card {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.07), #ffffff);
      border-color: rgba(5, 150, 105, 0.25);
      box-shadow: 0 10px 40px rgba(5, 150, 105, 0.08);
    }

    :host-context(.light-theme) .masbaha-title {
      color: #0f172a;
    }

    :host-context(.light-theme) .masbaha-desc {
      color: #475569;
    }

    :host-context(.light-theme) .subha-chip-btn {
      background: #f1f5f9;
      color: #475569;
      border-color: rgba(15, 23, 42, 0.1);
    }

    :host-context(.light-theme) .subha-chip-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    :host-context(.light-theme) .subha-chip-btn.active {
      background: #059669;
      color: #ffffff;
      border-color: #059669;
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
    }

    :host-context(.light-theme) .subha-ring-button {
      background: radial-gradient(circle at 35% 35%, #ffffff 40%, #ecfdf5 85%, #d1fae5 100%);
      border-color: #059669;
      box-shadow: 0 0 35px rgba(5, 150, 105, 0.25);
    }

    :host-context(.light-theme) .subha-number {
      color: #064e3b;
      text-shadow: none;
    }

    :host-context(.light-theme) .subha-tap-hint {
      color: #047857;
    }

    :host-context(.light-theme) .subha-cycle-badge {
      color: #b45309;
    }

    :host-context(.light-theme) .subha-active-display {
      background: #fffbeb;
      border-color: #fde68a;
    }

    :host-context(.light-theme) .subha-current-phrase {
      color: #92400e;
    }

    :host-context(.light-theme) .subha-platform-counter {
      color: #475569;
    }

    :host-context(.light-theme) .subha-platform-counter strong {
      color: #047857;
    }
  `]
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private tracker = inject(ActivityTrackerService);
  private router = inject(Router);

  searchQuery = '';
  featuredHadith: Hadith | null = null;
  dailyReflection: Reflection | null = null;
  memorial: Memorial | null = null;
  hasPrayed = false;

  subhaPhrases: string[] = [
    'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ',
    'لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ',
    'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    'لاَ إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
  ];
  selectedPhrase = 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ';
  currentSubhaCount = 0;
  isSubhaAnimating = false;

  ngOnInit() {
    this.loadFeaturedData();
  }

  loadFeaturedData() {
    // Load Hadiths & Memorial
    this.api.getHadiths('الكل', 'الكل', '', 1, 1).subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this.featuredHadith = res.data[0];
        }
      },
    });

    this.api.getRandomReflection().subscribe({
      next: (res) => {
        if (res.data) this.dailyReflection = res.data;
      },
    });

    this.api.getMemorial().subscribe({
      next: (res) => {
        if (res.data) this.memorial = res.data;
      },
    });
  }

  prayForGrandmother() {
    if (this.hasPrayed) return;
    this.api.prayForGrandmother().subscribe({
      next: (res) => {
        if (this.memorial) {
          this.memorial.prayersCount = res.prayersCount;
        }
        this.hasPrayed = true;
      },
    });
  }

  fetchRandomReflection() {
    this.api.getRandomReflection().subscribe({
      next: (res) => {
        if (res.data) this.dailyReflection = res.data;
      },
    });
  }

  onSearch() {
    if (!this.searchQuery.trim()) return;
    this.router.navigate(['/hadiths'], { queryParams: { search: this.searchQuery.trim() } });
  }

  copyText(text: string) {
    navigator.clipboard.writeText(text);
    alert('تم نسخ النص بنجاح');
  }

  incrementSubha() {
    this.currentSubhaCount++;
    this.isSubhaAnimating = true;
    setTimeout(() => {
      this.isSubhaAnimating = false;
    }, 150);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(35);
      } catch (e) { }
    }

    if (this.memorial) {
      this.memorial.tasbeehCount = (this.memorial.tasbeehCount || 0) + 1;
    }

    this.api.recordTasbeeh(1).subscribe({
      next: (res) => {
        if (this.memorial && res && res.tasbeehCount) {
          this.memorial.tasbeehCount = res.tasbeehCount;
        }
      },
    });

    this.tracker.log('TASBEEH_CLICK', `تسبيحة في الصفحة الرئيسية: ${this.selectedPhrase}`, {
      phrase: this.selectedPhrase,
    });
  }

  selectPhrase(phrase: string) {
    this.selectedPhrase = phrase;
    this.currentSubhaCount = 0;
  }

  resetSubha() {
    this.currentSubhaCount = 0;
  }

  nextPhrase() {
    const currentIndex = this.subhaPhrases.indexOf(this.selectedPhrase);
    const nextIndex = (currentIndex + 1) % this.subhaPhrases.length;
    this.selectedPhrase = this.subhaPhrases[nextIndex];
    this.currentSubhaCount = 0;
  }

  getCycleNumber(): number {
    return Math.floor(this.currentSubhaCount / 33) + 1;
  }
}
