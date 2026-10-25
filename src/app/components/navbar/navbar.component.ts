import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { BookmarksService } from '../../services/bookmarks.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar-wrapper">
      <div class="container navbar-container">
        <!-- Logo & Branding -->
        <a routerLink="/" class="brand-logo" (click)="closeMobileMenu()">
          <div class="logo-icon">
            <i class="fa-solid fa-kaaba"></i>
          </div>
          <div class="brand-text">
            <span class="brand-title">نُورٌ وَهُدَى</span>
            <span class="brand-subtitle">القرآن والسنة • صدقة جارية</span>
          </div>
        </a>

        <!-- Navigation Links (Desktop & Mobile Drawer) -->
        <nav class="nav-links" [class.open]="isMobileMenuOpen">
          <!-- Mobile Drawer Header Tag -->
          <div class="mobile-drawer-tag">
            <i class="fa-solid fa-moon"></i>
            <span>منصة نُورٌ وَهُدَى • صدقة جارية</span>
          </div>

          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()">
            <div class="nav-link-main">
              <i class="fa-solid fa-house nav-icon icon-emerald"></i>
              <span>الرئيسية</span>
            </div>
            <i class="fa-solid fa-chevron-left mobile-arrow"></i>
          </a>

          <a routerLink="/quran" routerLinkActive="active" (click)="closeMobileMenu()">
            <div class="nav-link-main">
              <i class="fa-solid fa-book-quran nav-icon icon-emerald"></i>
              <span>القرآن الكريم</span>
            </div>
            <i class="fa-solid fa-chevron-left mobile-arrow"></i>
          </a>

          <a routerLink="/hadiths" routerLinkActive="active" (click)="closeMobileMenu()">
            <div class="nav-link-main">
              <i class="fa-solid fa-scroll nav-icon icon-gold"></i>
              <span>الأحاديث الموثقة</span>
            </div>
            <i class="fa-solid fa-chevron-left mobile-arrow"></i>
          </a>

          <a routerLink="/azkar" routerLinkActive="active" (click)="closeMobileMenu()">
            <div class="nav-link-main">
              <i class="fa-solid fa-hands-praying nav-icon icon-blue"></i>
              <span>الأذكار والمسبحة</span>
            </div>
            <i class="fa-solid fa-chevron-left mobile-arrow"></i>
          </a>

          <a routerLink="/reflections" routerLinkActive="active" (click)="closeMobileMenu()">
            <div class="nav-link-main">
              <i class="fa-solid fa-heart-pulse nav-icon icon-purple"></i>
              <span>رقائق ومواعظ</span>
            </div>
            <i class="fa-solid fa-chevron-left mobile-arrow"></i>
          </a>

          <a routerLink="/bookmarks" routerLinkActive="active" class="nav-bookmarks-link" (click)="closeMobileMenu()">
            <div class="nav-link-main">
              <i class="fa-solid fa-bookmark nav-icon icon-amber"></i>
              <span>المحفوظات</span>
            </div>
            <div class="nav-badge-wrap">
              @if (bookmarksService.count() > 0) {
                <span class="nav-count-badge">{{ bookmarksService.count() }}</span>
              }
              <i class="fa-solid fa-chevron-left mobile-arrow"></i>
            </div>
          </a>

          <a routerLink="/memorial" routerLinkActive="active" class="nav-memorial-link" (click)="closeMobileMenu()">
            <div class="nav-link-main">
              <i class="fa-solid fa-dove nav-icon icon-rose"></i>
              <span>إهداء ودعاء للجدة</span>
            </div>
            <i class="fa-solid fa-chevron-left mobile-arrow"></i>
          </a>

          <!-- Mobile Drawer Footer Card -->
          <div class="drawer-footer-card">
            <a routerLink="/memorial" (click)="closeMobileMenu()" class="drawer-prayer-card">
              <div class="drawer-prayer-icon">
                <i class="fa-solid fa-heart"></i>
              </div>
              <div class="drawer-prayer-text">
                <span class="prayer-title">صدقة جارية لروح جدتي رحمها الله</span>
                <span class="prayer-sub">أهدِ ثواب دعاء أو تسبيحة أو ختمة مباركة</span>
              </div>
              <i class="fa-solid fa-arrow-left prayer-action-arrow"></i>
            </a>
          </div>
        </nav>

        <!-- Actions -->
        <div class="nav-actions">
          <!-- Theme Toggle Button (Light / Dark Mode) -->
          <button 
            class="theme-toggle-btn" 
            (click)="themeService.toggleTheme()" 
            [title]="themeService.isDark() ? 'تفعيل الوضع النهاري (Light Mode)' : 'تفعيل الوضع الليلي (Dark Mode)'"
            aria-label="تبديل الوضع الليلي والنهاري"
          >
            <i class="fa-solid" [class.fa-sun]="themeService.isDark()" [class.fa-moon]="!themeService.isDark()"></i>
            <span class="theme-text-pill">{{ themeService.isDark() ? 'نهاري' : 'ليلي' }}</span>
          </button>

          <!-- Pray for Grandma Quick Button -->
          <a routerLink="/memorial" class="btn-prayer-quick" title="ادعُ لجدتي رحمها الله">
            <i class="fa-solid fa-heart"></i>
            <span>ادعُ لجدتي</span>
          </a>

          <!-- Mobile Menu Toggle Button -->
          <button 
            class="mobile-toggle-btn" 
            [class.active]="isMobileMenuOpen"
            (click)="toggleMobileMenu()" 
            aria-label="القائمة"
            [title]="isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'"
          >
            <i class="fa-solid" [class.fa-bars]="!isMobileMenuOpen" [class.fa-xmark]="isMobileMenuOpen"></i>
          </button>
        </div>
      </div>

      <!-- Backdrop Overlay for Mobile Drawer -->
      <div 
        class="mobile-backdrop" 
        [class.show]="isMobileMenuOpen" 
        (click)="closeMobileMenu()" 
        aria-hidden="true"
      ></div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg-navbar, rgba(9, 14, 23, 0.88));
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :host-context(.light-theme) .navbar-wrapper {
      background: rgba(255, 255, 255, 0.95);
      border-bottom-color: rgba(15, 23, 42, 0.08);
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
    }

    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 75px;
      gap: 16px;
    }

    /* Brand Logo */
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
      flex-shrink: 0;
    }

    .logo-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary-emerald), #047857);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 1.3rem;
      box-shadow: var(--shadow-glow);
      flex-shrink: 0;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-weight: 800;
      font-size: 1.25rem;
      letter-spacing: -0.5px;
      color: var(--text-main);
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 0.78rem;
      color: var(--gold-light);
      font-weight: 500;
      line-height: 1.3;
    }

    :host-context(.light-theme) .brand-subtitle {
      color: var(--gold-accent);
    }

    /* Desktop Navigation Links */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-link-main {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .nav-badge-wrap {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .mobile-arrow,
    .mobile-drawer-tag,
    .drawer-footer-card,
    .mobile-backdrop {
      display: none;
    }

    .nav-links a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: var(--radius-md);
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .nav-links a:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }

    :host-context(.light-theme) .nav-links a {
      color: #475569;
    }

    :host-context(.light-theme) .nav-links a:hover {
      background: rgba(15, 23, 42, 0.05);
      color: #0f172a;
    }

    .nav-links a.active {
      color: #ffffff;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    :host-context(.light-theme) .nav-links a.active {
      color: #047857;
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.4);
      font-weight: 700;
    }

    .nav-links a.nav-memorial-link {
      color: var(--gold-light);
    }

    :host-context(.light-theme) .nav-links a.nav-memorial-link {
      color: #b45309;
    }

    .nav-count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: var(--radius-full);
      background: var(--primary-emerald);
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 700;
      margin-right: 4px;
    }

    :host-context(.light-theme) .nav-count-badge {
      background: #059669;
      color: #ffffff;
    }

    /* Actions */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .theme-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.06);
      border: 1.5px solid var(--border-subtle);
      color: var(--gold-light);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .theme-toggle-btn:hover {
      background: rgba(245, 158, 11, 0.15);
      border-color: var(--gold-accent);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
    }

    :host-context(.light-theme) .theme-toggle-btn {
      background: #f1f5f9;
      border-color: rgba(15, 23, 42, 0.12);
      color: #0f172a;
    }

    :host-context(.light-theme) .theme-toggle-btn:hover {
      background: #e2e8f0;
      border-color: #047857;
      color: #047857;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    }

    .theme-text-pill {
      font-size: 0.82rem;
      font-weight: 700;
    }

    .btn-prayer-quick {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #e11d48, #be123c);
      color: #ffffff;
      padding: 8px 18px;
      border-radius: var(--radius-full);
      font-size: 0.88rem;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(225, 29, 72, 0.35);
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-prayer-quick:hover {
      transform: translateY(-1px) scale(1.02);
      box-shadow: 0 6px 20px rgba(225, 29, 72, 0.45);
    }

    .mobile-toggle-btn {
      display: none;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      font-size: 1.2rem;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    /* =======================================================
       RESPONSIVE MOBILE NAVBAR (Harmonious & Professional)
       ======================================================= */
    @media (max-width: 1024px) {
      .navbar-container {
        height: 64px;
        gap: 8px;
        padding: 0 14px;
      }

      /* Logo scaling on mobile */
      .brand-logo {
        gap: 10px;
      }

      .logo-icon {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        font-size: 1.15rem;
      }

      .brand-title {
        font-size: 1.12rem;
        line-height: 1.15;
      }

      .brand-subtitle {
        font-size: 0.68rem;
        max-width: 140px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Perfectly unified action buttons (38x38px) */
      .nav-actions {
        gap: 8px;
      }

      .theme-toggle-btn,
      .btn-prayer-quick,
      .mobile-toggle-btn {
        width: 38px;
        height: 38px;
        min-width: 38px;
        min-height: 38px;
        border-radius: 11px;
        padding: 0;
        margin: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.05rem;
        box-sizing: border-box;
      }

      .theme-toggle-btn {
        border: 1.5px solid var(--border-subtle);
      }

      .theme-text-pill {
        display: none;
      }

      .btn-prayer-quick {
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 2px 10px rgba(225, 29, 72, 0.3);
      }

      .btn-prayer-quick span {
        display: none;
      }

      .btn-prayer-quick i {
        font-size: 1.05rem;
      }

      .mobile-toggle-btn {
        display: inline-flex;
        border: 1.5px solid var(--border-subtle);
        background: rgba(255, 255, 255, 0.06);
        color: var(--text-main);
      }

      :host-context(.light-theme) .mobile-toggle-btn {
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      .mobile-toggle-btn.active {
        background: rgba(16, 185, 129, 0.15);
        border-color: var(--primary-emerald);
        color: var(--primary-emerald-light);
      }

      :host-context(.light-theme) .mobile-toggle-btn.active {
        background: rgba(16, 185, 129, 0.15);
        border-color: #059669;
        color: #047857;
      }

      /* Mobile Drawer Navigation */
      .nav-links {
        position: fixed;
        top: 64px;
        right: 0;
        left: 0;
        background: rgba(9, 14, 23, 0.98);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        flex-direction: column;
        align-items: stretch;
        padding: 14px 14px 24px 14px;
        border-bottom: 2px solid var(--border-emerald);
        transform: translateY(-120%);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
        max-height: calc(100dvh - 64px);
        overflow-y: auto;
        gap: 8px;
        z-index: 100;
      }

      :host-context(.light-theme) .nav-links {
        background: rgba(255, 255, 255, 0.98);
        border-bottom-color: rgba(5, 150, 105, 0.3);
        box-shadow: 0 25px 50px rgba(15, 23, 42, 0.1);
      }

      .nav-links.open {
        transform: translateY(0);
        opacity: 1;
        pointer-events: auto;
      }

      /* Mobile Drawer Tag */
      .mobile-drawer-tag {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        border-radius: var(--radius-full);
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid var(--border-emerald);
        color: var(--text-emerald);
        font-size: 0.8rem;
        font-weight: 700;
        width: fit-content;
        margin-bottom: 4px;
      }

      :host-context(.light-theme) .mobile-drawer-tag {
        background: rgba(16, 185, 129, 0.1);
        color: #047857;
      }

      /* Mobile Drawer Link Item Cards */
      .nav-links a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        color: var(--text-main);
        font-size: 0.95rem;
        font-weight: 600;
      }

      :host-context(.light-theme) .nav-links a {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.08);
        color: #1e293b;
      }

      .nav-links a:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.12);
      }

      :host-context(.light-theme) .nav-links a:hover {
        background: #e2e8f0;
        border-color: rgba(15, 23, 42, 0.15);
      }

      .nav-links a.active {
        background: rgba(16, 185, 129, 0.16);
        border-color: var(--primary-emerald);
        color: #ffffff;
        font-weight: 700;
      }

      :host-context(.light-theme) .nav-links a.active {
        background: rgba(16, 185, 129, 0.12);
        border-color: #059669;
        color: #047857;
      }

      .nav-link-main {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .nav-icon {
        width: 22px;
        text-align: center;
        font-size: 1.1rem;
      }

      .icon-emerald { color: #34d399; }
      .icon-gold { color: #fbbf24; }
      .icon-blue { color: #38bdf8; }
      .icon-purple { color: #c084fc; }
      .icon-amber { color: #f59e0b; }
      .icon-rose { color: #fb7185; }

      .mobile-arrow {
        display: block;
        font-size: 0.85rem;
        color: var(--text-muted);
        opacity: 0.7;
      }

      /* Mobile Drawer Footer Prayer Card */
      .drawer-footer-card {
        display: block;
        margin-top: 10px;
        padding-top: 12px;
        border-top: 1px solid var(--border-subtle);
      }

      .drawer-prayer-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 13px 14px;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(15, 23, 42, 0.7));
        border: 1px solid rgba(225, 29, 72, 0.35);
        text-decoration: none;
      }

      :host-context(.light-theme) .drawer-prayer-card {
        background: linear-gradient(135deg, #fff1f2, #ffe4e6);
        border-color: #fecdd3;
      }

      .drawer-prayer-icon {
        width: 38px;
        height: 38px;
        min-width: 38px;
        border-radius: 10px;
        background: #e11d48;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);
      }

      .drawer-prayer-text {
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .prayer-title {
        font-size: 0.88rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.3;
      }

      :host-context(.light-theme) .prayer-title {
        color: #9f1239;
      }

      .prayer-sub {
        font-size: 0.72rem;
        color: #fecdd3;
        margin-top: 2px;
      }

      :host-context(.light-theme) .prayer-sub {
        color: #be123c;
      }

      .prayer-action-arrow {
        color: #fda4af;
        font-size: 0.95rem;
      }

      /* Backdrop Overlay */
      .mobile-backdrop {
        display: block;
        position: fixed;
        top: 64px;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 99;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .mobile-backdrop.show {
        opacity: 1;
        pointer-events: auto;
      }
    }

    /* Extra small mobile screens (<= 380px) */
    @media (max-width: 380px) {
      .navbar-container {
        padding: 0 10px;
      }

      .brand-subtitle {
        max-width: 105px;
        font-size: 0.64rem;
      }

      .nav-actions {
        gap: 6px;
      }

      .theme-toggle-btn,
      .btn-prayer-quick,
      .mobile-toggle-btn {
        width: 36px;
        height: 36px;
        min-width: 36px;
        min-height: 36px;
        border-radius: 10px;
      }
    }
  `]
})
export class NavbarComponent {
  readonly themeService = inject(ThemeService);
  readonly bookmarksService = inject(BookmarksService);

  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}

