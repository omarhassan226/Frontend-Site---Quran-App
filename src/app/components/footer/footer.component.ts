import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer-wrapper">
      <div class="container footer-container">
        <!-- Memorial Callout -->
        <div class="memorial-callout card-glass">
          <div class="memorial-badge">
            <i class="fa-solid fa-dove"></i> إهداء ودعاء بالرحمة
          </div>
          <h3 class="memorial-headline">اللهم اغفر لجدتي وارحمها وأسكنها الفردوس الأعلى</h3>
          <p class="memorial-desc font-hadith" style="display: flex; justify-content: center; align-items: center;">
            «إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلاَّ مِنْ ثَلاَثَةٍ: إِلاَّ مِنْ صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ»
          </p>
          <a routerLink="/memorial" class="btn-primary" style="margin-top: 14px;">
            <i class="fa-solid fa-hands-praying"></i>
            <span>اللهم آمين (ادعُ لها بضغطة زر)</span>
          </a>
        </div>

        <!-- Links Grid -->
        <div class="footer-grid">
          <div class="footer-col brand-col">
            <div class="brand-title">نُورٌ وَهُدَى</div>
            <p class="brand-text">
              منصة إسلامية موثوقة تجمع القرآن الكريم وتلاوات كبار القراء، وصحيح الأحاديث النبوية بدرجاتها ومصادرها، وأذكار المسلم، لتبقى نافعة لكل مسلم وتكون صدقة جارية مباركة بإذن الله.
            </p>
          </div>

          <div class="footer-col">
            <h4 class="col-title">أقسام المنصة</h4>
            <ul class="col-links">
              <li><a routerLink="/quran"><i class="fa-solid fa-angle-left"></i> القرآن الكريم والتلاوات</a></li>
              <li><a routerLink="/hadiths"><i class="fa-solid fa-angle-left"></i> الأحاديث النبوية الموثقة</a></li>
              <li><a routerLink="/azkar"><i class="fa-solid fa-angle-left"></i> أذكار الصباح والمساء</a></li>
              <li><a routerLink="/reflections"><i class="fa-solid fa-angle-left"></i> رقائق ومواعظ توقظ القلوب</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="col-title">المصادر المعتمدة</h4>
            <ul class="col-links">
              <li><a href="https://dorar.net" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> الموسوعة الحديثية (الدرر السنية)</a></li>
              <li><a href="https://quran.com" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> مجمع الملك فهد لطباعة المصحف</a></li>
              <li><a href="https://islamweb.net" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> موقع إسلام ويب للعلوم الشرعية</a></li>
              <li><a routerLink="/memorial"><i class="fa-solid fa-dove"></i> إهداء ودعاء لروح الجدة</a></li>
            </ul>
          </div>
        </div>

        <!-- Copyright -->
        <div class="footer-bottom">
          <p>مشروع إسلامي مفتوح النفع وخالص لوجه الله تعالى • تقبل الله منا ومنكم صالح الأعمال</p>
          <p class="sub-bottom">جميع الحقوق محفوظة لكل مسلم ومسلمة في نشر الخير والانتفاع به</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrapper {
      background: var(--bg-footer, #060a12);
      border-top: 1px solid var(--border-subtle);
      padding: 60px 0 30px 0;
      margin-top: 80px;
      position: relative;
      transition: background 0.3s ease, border-color 0.3s ease;
    }

    :host-context(.light-theme) .footer-wrapper {
      background: #ffffff;
      border-top-color: rgba(15, 23, 42, 0.08);
      box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.02);
    }

    .memorial-callout {
      text-align: center;
      padding: 35px 25px;
      margin-bottom: 50px;
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.35), rgba(15, 23, 42, 0.8));
      border: 1px solid var(--border-emerald);
      position: relative;
      border-radius: var(--radius-xl);
    }

    :host-context(.light-theme) .memorial-callout {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(248, 250, 252, 0.95));
      border-color: rgba(5, 150, 105, 0.25);
      box-shadow: 0 4px 20px rgba(5, 150, 105, 0.06);
    }

    .memorial-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(245, 158, 11, 0.15);
      color: var(--gold-light);
      padding: 4px 14px;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 15px;
    }

    :host-context(.light-theme) .memorial-badge {
      background: rgba(217, 119, 6, 0.12);
      color: #b45309;
    }

    .memorial-headline {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 12px;
    }

    :host-context(.light-theme) .memorial-headline {
      color: #064e3b;
    }

    .memorial-desc {
      font-size: 1.15rem;
      color: var(--text-gold);
      max-width: 750px;
      margin: 0 auto;
      line-height: 2.1;
    }

    :host-context(.light-theme) .memorial-desc {
      color: #1e293b;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 40px;
      padding-bottom: 40px;
      border-bottom: 1px solid var(--border-subtle);
    }

    :host-context(.light-theme) .footer-grid {
      border-bottom-color: rgba(15, 23, 42, 0.08);
    }

    .brand-col .brand-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 12px;
    }

    :host-context(.light-theme) .brand-col .brand-title {
      color: #0f172a;
    }

    .brand-col .brand-text {
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.8;
      max-width: 400px;
    }

    :host-context(.light-theme) .brand-col .brand-text {
      color: #475569;
    }

    .col-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 18px;
      position: relative;
    }

    :host-context(.light-theme) .col-title {
      color: #0f172a;
    }

    .col-title::after {
      content: '';
      position: absolute;
      bottom: -6px;
      right: 0;
      width: 30px;
      height: 2px;
      background: var(--primary-emerald);
    }

    .col-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .col-links a {
      color: var(--text-muted);
      font-size: 0.9rem;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    :host-context(.light-theme) .col-links a {
      color: #475569;
    }

    .col-links a:hover {
      color: var(--primary-emerald-light);
      transform: translateX(-4px);
    }

    :host-context(.light-theme) .col-links a:hover {
      color: #059669;
    }

    .footer-bottom {
      margin-top: 30px;
      text-align: center;
      padding-top: 20px;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    :host-context(.light-theme) .footer-bottom {
      color: #64748b;
    }

    .sub-bottom {
      margin-top: 6px;
      opacity: 0.8;
      font-size: 0.8rem;
    }

    @media (max-width: 850px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 30px;
      }
    }
  `]
})
export class FooterComponent { }
