import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ShareService } from '../../services/share.service';
import { ActivityTrackerService } from '../../services/activity-tracker.service';
import { Memorial } from '../../models/memorial.model';

@Component({
  selector: 'app-memorial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="memorial-page-wrapper container">
      <!-- Top Dedication Banner -->
      <section class="dedication-hero card-glass">
        <div class="dove-icon-wrap">
          <i class="fa-solid fa-dove"></i>
        </div>
        <span class="badge badge-gold">صدقة جارية • وفاءً وبرّاً</span>
        <h1 class="dedication-title">{{ memorial?.dedicationTitle || 'صدقة جارية عن روح جدتي رحمها الله' }}</h1>
        <p class="dedication-lead">
          اللهم تقبل هذا العمل خالصاً لوجهك الكريم، واجعله نوراً وسروراً وضياءً في قبرها، وثقلاً في ميزان حسناتها يوم نلقاك.
        </p>

        <div class="memorial-share-action">
          <button class="btn-share-memorial" (click)="shareMemorial()">
            <i class="fa-solid fa-share-nodes"></i>
            <span>انشر الصفحة واكسب الأجر (الدال على الخير كفاعله)</span>
          </button>
        </div>

        <!-- Stats Counter Row -->
        <div class="memorial-stats-row">
          <div class="stat-pill card-glass">
            <i class="fa-solid fa-hands-praying stat-icon"></i>
            <div class="stat-texts">
              <span class="stat-val">{{ memorial?.prayersCount || 0 }}</span>
              <span class="stat-lbl">دعاء مُسجّل</span>
            </div>
          </div>

          <div class="stat-pill card-glass">
            <i class="fa-solid fa-book-bookmark stat-icon gold"></i>
            <div class="stat-texts">
              <span class="stat-val">{{ memorial?.khatmaCount || 0 }}</span>
              <span class="stat-lbl">ختمة قرآن مهداة</span>
            </div>
          </div>

          <div class="stat-pill card-glass">
            <i class="fa-solid fa-bead-necklace stat-icon emerald"></i>
            <div class="stat-texts">
              <span class="stat-val">{{ memorial?.tasbeehCount || 0 }}</span>
              <span class="stat-lbl">تسبيحة واستغفار</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Duas Grid -->
      <section class="duas-section">
        <div class="section-title-wrap">
          <h2 class="section-heading">أدعية مأثورة للمتوفاة وأهل القبور</h2>
          <p class="section-sub">شارك بالدعاء وتأمين الحضور؛ فدعاء المسلم لأخيه بظهر الغيب مستجاب وله ملك يقول ولك بمثل.</p>
        </div>

        <div class="duas-list">
          <div class="dua-card card-glass">
            <p class="dua-body font-hadith">
              {{ memorial?.duaText || 'اللهم اغفر لها وارحمها وعافها واعفُ عنها، وأكرم نزلها، ووسّع مدخلها، واغسلها بالماء والثلج والبرد، ونقّها من الذنوب والخطايا كما يُنقّى الثوب الأبيض من الدنس، واجعل قبرها روضة من رياض الجنة ولا تجعله حفرة من حفر النار.' }}
            </p>
            <div class="dua-card-bottom">
              <button class="btn-pray-heart" (click)="prayNow()" [disabled]="hasPrayed">
                <i class="fa-solid fa-heart"></i>
                <span>{{ hasPrayed ? 'جزاك الله خيراً، تقبل الله دعاءك' : 'اللهم آمين (سجّل تأمينك على الدعاء)' }}</span>
              </button>
            </div>
          </div>

          <div class="dua-card card-glass">
            <p class="dua-body font-hadith">
              {{ memorial?.secondaryDua || 'اللهم اجعل كل حرفٍ يُقرأ في هذا الموقع وكل تسبيحةٍ واستغفار في ميزان حسناتها، ونوراً في قبرها، ورفعةً لدرجاتها في جنات النعيم برفقة النبيين والصديقين والشهداء والصالحين وحسن أولئك رفيقاً.' }}
            </p>
          </div>

          <div class="dua-card card-glass">
            <p class="dua-body font-hadith">
              «اللَّهُمَّ إِنَّ فُلاَنَةَ فِي ذِمَّتِكَ وَحَبْلِ جِوَارِكَ، فَقِهَا فِتْنَةَ الْقَبْرِ وَعَذَابَ النَّارِ، وَأَنْتَ أَهْلُ الْوَفَاءِ وَالْحَقِّ، فَاغْفِرْ لَهَا وَارْحَمْهَا إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ».
            </p>
            <span class="dua-source">رواه أبو داود وابن ماجه عن واثلة بن الأسقع رضي الله عنه</span>
          </div>
        </div>
      </section>

      <!-- Digital Subha (مسبحة إلكترونية) -->
      <section class="subha-section card-glass">
        <div class="subha-header">
          <span class="badge badge-emerald"><i class="fa-solid fa-bead-necklace"></i> مسبحة الصدقة الجارية</span>
          <h2 class="subha-title">سبّح واذكر الله واهدِ ثوابه</h2>
          <p class="subha-desc">كل تسبيحة تضغطها تُسجل فوراً في عداد الصدقة الجارية وتثقل الموازين بإذن الله.</p>
        </div>

        <div class="subha-types-row">
          @for (phrase of subhaPhrases; track phrase) {
            <button
              class="phrase-btn"
              [class.active]="selectedPhrase === phrase"
              (click)="selectedPhrase = phrase; currentSubhaCount = 0"
            >
              {{ phrase }}
            </button>
          }
        </div>

        <div class="subha-counter-center">
          <div class="subha-ring-button" (click)="incrementSubha()">
            <span class="subha-number">{{ currentSubhaCount }}</span>
            <span class="subha-tap-hint">اضغط للتسبيح</span>
          </div>
        </div>

        <div class="subha-bottom-actions">
          <span class="subha-current-phrase font-hadith">{{ selectedPhrase }}</span>
          <button class="btn-ghost" (click)="currentSubhaCount = 0">
            <i class="fa-solid fa-rotate-right"></i> تصفير المسبحة
          </button>
        </div>
      </section>

      <!-- Khatma Dedication Form -->
      <section class="khatma-section card-glass">
        <div class="khatma-header">
          <i class="fa-solid fa-book-quran khatma-icon"></i>
          <div>
            <h3 class="khatma-title">إهداء ختمة قرآن كريم</h3>
            <p class="khatma-desc">إذا أتممت قراءة القرآن الكريم كاملاً، سجّل ختمتك لتُضاف إلى عدد الختمات المهداة لروحها.</p>
          </div>
        </div>
        <button class="btn-gold" (click)="dedicateKhatma()" [disabled]="hasDedicatedKhatma">
          <i class="fa-solid fa-check-double"></i>
          <span>{{ hasDedicatedKhatma ? 'تم تسجيل الختمة المباركة • جزاك الله خيراً' : 'أتممت ختمة قرآن وأهدي ثوابها' }}</span>
        </button>
      </section>
    </div>
  `,
  styles: [`
    .memorial-page-wrapper {
      padding: 50px 20px 80px 20px;
      max-width: 1350px;
    }

    /* Dedication Hero */
    .dedication-hero {
      text-align: center;
      padding: 45px 30px;
      border-radius: var(--radius-xl);
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.3), rgba(15, 23, 42, 0.9));
      border: 1px solid var(--border-emerald);
      margin-bottom: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .dove-icon-wrap {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(245, 158, 11, 0.2);
      color: var(--gold-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      margin-bottom: 16px;
      border: 1px solid var(--border-gold);
      animation: pulseGlow 2.5s infinite;
    }

    .dedication-title {
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--text-gold);
      margin-top: 14px;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }

    .dedication-lead {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 700px;
      line-height: 1.8;
      margin-bottom: 30px;
    }

    .memorial-stats-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 16px;
      width: 100%;
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 24px;
      border-radius: var(--radius-lg);
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid var(--border-subtle);
      min-width: 180px;
    }

    .stat-icon {
      font-size: 1.6rem;
      color: #f43f5e;
    }

    .stat-icon.gold {
      color: var(--gold-light);
    }

    .stat-icon.emerald {
      color: var(--primary-emerald-light);
    }

    .stat-texts {
      display: flex;
      flex-direction: column;
      text-align: right;
    }

    .stat-val {
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--text-main);
      line-height: 1.1;
    }

    .stat-lbl {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Duas */
    .duas-section {
      margin-bottom: 50px;
    }

    .section-title-wrap {
      text-align: center;
      margin-bottom: 25px;
    }

    .section-heading {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 8px;
    }

    .section-sub {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .duas-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .dua-card {
      padding: 28px;
      border-radius: var(--radius-lg);
    }

    .dua-body {
      font-size: 1.35rem;
      line-height: 2.3;
      color: var(--text-main);
      margin-bottom: 14px;
    }

    .dua-card-bottom {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .btn-pray-heart {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #e11d48, #be123c);
      color: #ffffff;
      padding: 10px 22px;
      border-radius: var(--radius-full);
      font-weight: 700;
      font-size: 0.95rem;
      box-shadow: 0 4px 15px rgba(225, 29, 72, 0.35);
      transition: all 0.2s;
    }

    .btn-pray-heart:hover:not(:disabled) {
      transform: scale(1.03);
    }

    .btn-pray-heart:disabled {
      background: #047857;
      box-shadow: none;
    }

    .dua-source {
      font-size: 0.82rem;
      color: var(--text-muted);
      display: block;
    }

    /* Digital Subha */
    .subha-section {
      padding: 35px;
      border-radius: var(--radius-xl);
      text-align: center;
      margin-bottom: 35px;
    }

    .subha-header {
      margin-bottom: 25px;
    }

    .subha-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-main);
      margin-top: 10px;
      margin-bottom: 6px;
    }

    .subha-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .subha-types-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-bottom: 35px;
    }

    .phrase-btn {
      padding: 8px 18px;
      border-radius: var(--radius-full);
      font-size: 0.9rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      transition: all 0.2s;
    }

    .phrase-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-main);
    }

    .phrase-btn.active {
      background: var(--primary-emerald);
      color: #ffffff;
      border-color: var(--primary-emerald);
    }

    .subha-counter-center {
      display: flex;
      justify-content: center;
      margin-bottom: 30px;
    }

    .subha-ring-button {
      width: 170px;
      height: 170px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--bg-surface-elevated) 40%, #064e3b 100%);
      border: 4px solid var(--primary-emerald);
      box-shadow: 0 0 35px var(--primary-emerald-glow);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s;
    }

    .subha-ring-button:hover {
      box-shadow: 0 0 50px rgba(16, 185, 129, 0.6);
      transform: scale(1.05);
    }

    .subha-ring-button:active {
      transform: scale(0.95);
    }

    .subha-number {
      font-size: 3.2rem;
      font-weight: 900;
      color: var(--text-emerald);
      line-height: 1;
    }

    .subha-tap-hint {
      font-size: 0.78rem;
      color: var(--text-gold);
      margin-top: 4px;
    }

    .subha-bottom-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 20px;
      flex-wrap: wrap;
      gap: 14px;
    }

    .subha-current-phrase {
      font-size: 1.25rem;
      color: var(--text-gold);
      font-weight: 700;
    }

    /* Khatma section */
    .khatma-section {
      padding: 28px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
      border-color: var(--border-gold);
    }

    .khatma-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .khatma-icon {
      font-size: 2.2rem;
      color: var(--gold-light);
    }

    .khatma-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    /* Light Theme Enhancements for Memorial */
    :host-context(.light-theme) .dedication-hero {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), #ffffff);
      border-color: rgba(5, 150, 105, 0.25);
      box-shadow: 0 10px 40px rgba(5, 150, 105, 0.06);
    }

    :host-context(.light-theme) .grandma-name-highlight {
      color: #b45309;
    }

    :host-context(.light-theme) .hero-dua-text {
      color: #0f172a;
    }

    :host-context(.light-theme) .stat-card {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.08);
      box-shadow: 0 2px 14px rgba(15, 23, 42, 0.04);
    }

    :host-context(.light-theme) .stat-label {
      color: #475569;
    }

    :host-context(.light-theme) .stat-num {
      color: #047857;
    }

    :host-context(.light-theme) .section-heading,
    :host-context(.light-theme) .subha-title,
    :host-context(.light-theme) .khatma-title {
      color: #0f172a;
    }

    :host-context(.light-theme) .section-sub,
    :host-context(.light-theme) .subha-desc,
    :host-context(.light-theme) .khatma-desc {
      color: #475569;
    }

    :host-context(.light-theme) .dua-card {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.08);
      box-shadow: 0 2px 14px rgba(15, 23, 42, 0.04);
    }

    :host-context(.light-theme) .dua-body {
      color: #0f172a;
    }

    :host-context(.light-theme) .subha-section {
      background: #ffffff;
      border-color: rgba(5, 150, 105, 0.25);
      box-shadow: 0 10px 40px rgba(15, 23, 42, 0.05);
    }

    :host-context(.light-theme) .phrase-btn {
      background: #f1f5f9;
      color: #475569;
      border-color: rgba(15, 23, 42, 0.1);
    }

    :host-context(.light-theme) .phrase-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    :host-context(.light-theme) .phrase-btn.active {
      background: #059669;
      color: #ffffff;
      border-color: #059669;
    }

    :host-context(.light-theme) .subha-ring-button {
      background: radial-gradient(circle, #ffffff 40%, #e6f4ea 100%);
      border-color: #059669;
      box-shadow: 0 0 35px rgba(5, 150, 105, 0.2);
    }

    :host-context(.light-theme) .ring-count {
      color: #064e3b;
    }

    :host-context(.light-theme) .ring-phrase {
      color: #047857;
    }

    .memorial-share-action {
      margin-top: 15px;
      margin-bottom: 25px;
    }

    .btn-share-memorial {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(16, 185, 129, 0.2));
      border: 1px solid rgba(212, 175, 55, 0.4);
      color: var(--gold-light);
      padding: 10px 24px;
      border-radius: 50px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .btn-share-memorial:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
      border-color: var(--gold-primary);
      color: #ffffff;
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.35), rgba(16, 185, 129, 0.35));
    }

    :host-context(.light-theme) .btn-share-memorial {
      background: linear-gradient(135deg, #fef3c7, #d1fae5);
      border-color: #f59e0b;
      color: #92400e;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.12);
    }

    :host-context(.light-theme) .btn-share-memorial:hover {
      background: linear-gradient(135deg, #fde68a, #a7f3d0);
      color: #78350f;
    }

    :host-context(.light-theme) .khatma-section {
      background: #ffffff;
      border-color: rgba(217, 119, 6, 0.25);
      box-shadow: 0 10px 40px rgba(15, 23, 42, 0.05);
    }
  `]
})
export class MemorialComponent implements OnInit {
  private api = inject(ApiService);
  private shareService = inject(ShareService);
  private tracker = inject(ActivityTrackerService);

  memorial: Memorial | null = null;
  hasPrayed = false;
  hasDedicatedKhatma = false;

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

  ngOnInit() {
    this.loadMemorial();
  }

  loadMemorial() {
    this.api.getMemorial().subscribe({
      next: (res) => {
        if (res.data) this.memorial = res.data;
      },
    });
  }

  shareMemorial() {
    this.shareService.openShare({
      title: this.memorial?.dedicationTitle || 'صدقة جارية عن روح جدتي رحمها الله',
      text: 'شارك بالدعاء وقراءة القرآن والتسبيح كصدقة جارية، والدال على الخير كفاعله 🤍',
      url: '/memorial',
      subtitle: 'صفحة الصدقة الجارية والوفاء',
      type: 'memorial',
    });
  }

  prayNow() {
    if (this.hasPrayed) return;
    this.api.prayForGrandmother().subscribe({
      next: (res) => {
        if (this.memorial) this.memorial.prayersCount = res.prayersCount;
        this.hasPrayed = true;
        this.tracker.log('DUA_CLICK', 'تأمين ودعاء للمتوفاة في صفحة الصدقة الجارية');
      },
    });
  }

  incrementSubha() {
    this.currentSubhaCount++;
    this.api.recordTasbeeh(1).subscribe({
      next: (res) => {
        if (this.memorial) this.memorial.tasbeehCount = res.tasbeehCount;
      },
    });
    this.tracker.log('TASBEEH_CLICK', `تسبيحة في المسبحة: ${this.selectedPhrase}`, {
      phrase: this.selectedPhrase,
    });
  }

  dedicateKhatma() {
    if (this.hasDedicatedKhatma) return;
    this.api.recordKhatma().subscribe({
      next: (res) => {
        if (this.memorial) this.memorial.khatmaCount = res.khatmaCount;
        this.hasDedicatedKhatma = true;
        this.tracker.log('PAGE_VIEW', 'إهداء ثواب تلاوة وختمة للصدقة الجارية');
      },
    });
  }
}
