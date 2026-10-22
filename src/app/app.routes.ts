import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { QuranListComponent } from './pages/quran/quran-list.component';
import { SurahDetailComponent } from './pages/quran/surah-detail.component';
import { HadithsComponent } from './pages/hadiths/hadiths.component';
import { AzkarComponent } from './pages/azkar/azkar.component';
import { ReflectionsComponent } from './pages/reflections/reflections.component';
import { MemorialComponent } from './pages/memorial/memorial.component';
import { BookmarksComponent } from './pages/bookmarks/bookmarks.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'الرئيسية | نور وهُدى - صدقة جارية' },
  { path: 'quran', component: QuranListComponent, title: 'سور القرآن الكريم | نور وهُدى' },
  { path: 'quran/surah/:id', component: SurahDetailComponent, title: 'المصحف المرتل | نور وهُدى' },
  { path: 'hadiths', component: HadithsComponent, title: 'الأحاديث النبوية الموثقة | نور وهُدى' },
  { path: 'azkar', component: AzkarComponent, title: 'الأذكار اليومية وحصن المسلم | نور وهُدى' },
  { path: 'reflections', component: ReflectionsComponent, title: 'رقائق ومواعظ توقظ القلوب | نور وهُدى' },
  { path: 'memorial', component: MemorialComponent, title: 'صدقة جارية عن روح جدتي رحمها الله' },
  { path: 'bookmarks', component: BookmarksComponent, title: 'قائمة المحفوظات والمفضلة | نور وهُدى' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
