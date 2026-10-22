import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AudioBarComponent } from './components/audio-bar/audio-bar.component';
import { ShareModalComponent } from './components/share-modal/share-modal.component';
import { ActivityTrackerService } from './services/activity-tracker.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AudioBarComponent, ShareModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'نور وهُدى | القرآن الكريم والسنة النبوية - صدقة جارية';
  private router = inject(Router);
  private tracker = inject(ActivityTrackerService);

  ngOnInit() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = event.urlAfterRedirects || event.url;
      const title = this.getPageFriendlyTitle(url);
      this.tracker.log('PAGE_VIEW', title, { url });
    });
  }

  private getPageFriendlyTitle(url: string): string {
    if (url === '/' || url === '') return 'زيارة الصفحة الرئيسية';
    if (url.startsWith('/quran/surah/')) {
      const parts = url.split('/');
      const num = parts[3];
      return `قراءة وتدبر سورة في المصحف (سورة #${num || ''})`;
    }
    if (url.startsWith('/quran')) return 'تصفح فهرس سور القرآن الكريم';
    if (url.startsWith('/hadiths')) return 'تصفح موسوعة الأحاديث النبوية';
    if (url.startsWith('/azkar')) return 'تصفح الأذكار وحصن المسلم';
    if (url.startsWith('/reflections')) return 'تصفح الرقائق والمواعظ الإيمانية';
    if (url.startsWith('/memorial')) return 'زيارة صفحة الصدقة الجارية والوفاء';
    if (url.startsWith('/bookmarks')) return 'فتح قائمة المحفوظات والمفضلة';
    return `زيارة صفحة: ${url}`;
  }
}

