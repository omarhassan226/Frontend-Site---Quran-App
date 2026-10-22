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
        <a routerLink="/" class="brand-logo">
          <div class="logo-icon">
            <i class="fa-solid fa-kaaba"></i>
          </div>
          <div class="brand-text">
            <span class="brand-title">نُورٌ وَهُدَى</span>
            <span class="brand-subtitle">القرآن والسنة • صدقة جارية</span>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="nav-links" [class.open]="isMobileMenuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()">
            <i class="fa-solid fa-house"></i>
            <span>الرئيسية</span>
          </a>
          <a routerLink="/quran" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fa-solid fa-book-quran"></i>
            <span>القرآن الكريم</span>
          </a>
          <a routerLink="/hadiths" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fa-solid fa-scroll"></i>
            <span>الأحاديث الموثقة</span>
          </a>
          <a routerLink="/azkar" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fa-solid fa-hands-praying"></i>
            <span>الأذكار</span>
          </a>
          <a routerLink="/reflections" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fa-solid fa-heart-pulse"></i>
            <span>رقائق ومواعظ</span>
          </a>
          <a routerLink="/bookmarks" routerLinkActive="active" class="nav-bookmarks-link" (click)="closeMobileMenu()">
            <i class="fa-solid fa-bookmark"></i>
            <span>المحفوظات</span>
            @if (bookmarksService.count() > 0) {
              <span class="nav-count-badge">{{ bookmarksService.count() }}</span>
            }
          </a>
          <a routerLink="/memorial" routerLinkActive="active" class="nav-memorial-link" (click)="closeMobileMenu()">
            <i class="fa-solid fa-dove"></i>
            <span>إهداء ودعاء للجدة</span>
          </a>
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
          <a routerLink="/memorial" class="btn-prayer-quick">
            <i class="fa-solid fa-heart"></i>
            <span>ادعُ لجدتي</span>
          </a>

          <!-- Mobile Menu Toggle Button -->
          <button class="mobile-toggle-btn" (click)="toggleMobileMenu()" aria-label="القائمة">
            <i class="fa-solid" [class.fa-bars]="!isMobileMenuOpen" [class.fa-xmark]="isMobileMenuOpen"></i>
          </button>
        </div>
      </div>
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

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
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
    }

    :host-context(.light-theme) .brand-subtitle {
      color: var(--gold-accent);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 6px;
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

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .theme-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 14px;
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
      animation: pulseGlow 2.5s infinite;
      transition: transform 0.2s;
    }

    .btn-prayer-quick:hover {
      transform: scale(1.03);
    }

    .mobile-toggle-btn {
      display: none;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
      font-size: 1.2rem;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 1024px) {
      .mobile-toggle-btn {
        display: flex;
      }

      .btn-prayer-quick span {
        display: none;
      }

      .nav-links {
        position: fixed;
        top: 75px;
        right: 0;
        left: 0;
        background: var(--bg-surface);
        flex-direction: column;
        align-items: stretch;
        padding: 20px;
        border-bottom: 1px solid var(--border-subtle);
        transform: translateY(-120%);
        transition: transform 0.3s ease;
        box-shadow: var(--shadow-lg);
      }

      :host-context(.light-theme) .nav-links {
        background: #ffffff;
      }

      .nav-links.open {
        transform: translateY(0);
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
