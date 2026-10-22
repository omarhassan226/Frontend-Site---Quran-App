import { Injectable, signal, computed, effect } from '@angular/core';

export type AppLanguage = 'ar' | 'en';

export interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

const DICTIONARY: Translations = {
  // Brand
  'brand.title': { ar: 'نُورٌ وَهُدَى', en: 'Nour & Huda' },
  'brand.subtitle': { ar: 'القرآن والسنة • صدقة جارية', en: 'Quran & Sunnah • Ongoing Charity' },

  // Navigation
  'nav.home': { ar: 'الرئيسية', en: 'Home' },
  'nav.quran': { ar: 'القرآن الكريم', en: 'Holy Quran' },
  'nav.hadiths': { ar: 'الأحاديث الموثقة', en: 'Authentic Hadiths' },
  'nav.azkar': { ar: 'الأذكار', en: 'Daily Adhkar' },
  'nav.reflections': { ar: 'رقائق ومواعظ', en: 'Heart Softeners' },
  'nav.memorial': { ar: 'إهداء ودعاء للجدة', en: 'Grandmother Memorial' },
  'nav.pray_for_grandma': { ar: 'ادعُ لجدتي', en: 'Pray for Grandma' },

  // Themes & Lang
  'theme.dark': { ar: 'الوضع الليلي', en: 'Dark Mode' },
  'theme.light': { ar: 'الوضع النهاري', en: 'Light Mode' },
  'lang.switch': { ar: 'English', en: 'العربية' },

  // Home Hero
  'hero.badge': { ar: 'موقع إسلامي موثوق • صدقة جارية لروح جدتي', en: 'Verified Islamic Resource • Charity for my Grandmother' },
  'hero.title': { ar: 'نُورٌ مِنَ القُرآنِ وَهُدًى مِنَ السُّنَّةِ', en: 'Light from the Quran & Guidance from the Sunnah' },
  'hero.subtitle': {
    ar: 'اقرأ وتدبّر آيات الذكر الحكيم، واستمع لتلاوات أندى القراء، وتعرّف على صحيح هدي المصطفى ﷺ بدرجاتها ومصادرها المعتمدة.',
    en: 'Read and reflect upon the verses of the Holy Quran, listen to revered reciters, and explore verified Prophetic Hadiths with authentic gradings and citations.'
  },
  'hero.search_placeholder': { ar: 'ابحث في القرآن الكريم أو الأحاديث النبوية (مثلاً: قيام الليل، الصبر، التوبة...)', en: 'Search Quran or Hadiths (e.g., Night Prayer, Patience, Repentance...)' },
  'hero.search_btn': { ar: 'بحث', en: 'Search' },
  'hero.topics_label': { ar: 'مواضيع مؤثرة:', en: 'Featured Topics:' },
  'hero.topic_qiyam': { ar: 'قيام الليل', en: 'Night Prayer' },
  'hero.topic_death': { ar: 'الموت والآخرة', en: 'Death & Hereafter' },
  'hero.topic_charity': { ar: 'الصدقة الجارية', en: 'Ongoing Charity' },
  'hero.topic_tawbah': { ar: 'التوبة والاستغفار', en: 'Repentance' },

  // Memorial & Dua
  'memorial.tag': { ar: 'إهداء ودعاء بالرحمة', en: 'Dedication & Prayer for Mercy' },
  'memorial.pray_btn': { ar: 'اللهم آمين (ادعُ لها بضغطة زر)', en: 'Ameen (Click to Pray for Her)' },
  'memorial.prayed_btn': { ar: 'جزاك الله خيراً، تقبل الله دعاءك', en: 'May Allah reward you, Dua accepted' },
  'memorial.prayers_count_label': { ar: 'دعاء سُجّل حتى الآن', en: 'prayers recorded so far' },
  'memorial.tasbeeh_count_label': { ar: 'مجموع التسبيحات في المنصة', en: 'Total Tasbeeh on Platform' },
  'memorial.tasbeeh_sub': { ar: 'تسبيحة مهداة في ميزان حسناتها', en: 'Tasbeehs dedicated to her scale of good deeds' },
  'memorial.more_duas': { ar: 'المزيد من الأدعية والختمات', en: 'More Duas & Khatmas' },

  // Quran Page
  'quran.badge': { ar: 'القرآن الكريم', en: 'The Holy Quran' },
  'quran.title': { ar: 'فهرس سور القرآن الكريم', en: 'Index of the Noble Quran' },
  'quran.subtitle': { ar: 'تصفح سور القرآن الـ 114 مع الاستماع الصوتي العذب لأشهر القراء وتفسير المعاني وتدبرها.', en: 'Browse all 114 Surahs with recitations by world-renowned reciters and reflections on their meanings.' },
  'quran.search_surah': { ar: 'ابحث عن سورة بالاسم أو الرقم...', en: 'Search Surah by name or number...' },
  'quran.filter_all': { ar: 'جميع السور', en: 'All Surahs' },
  'quran.filter_meccan': { ar: 'مكية', en: 'Meccan' },
  'quran.filter_medinan': { ar: 'مدنية', en: 'Medinan' },
  'quran.ayah_count': { ar: 'آية', en: 'Verses' },
  'quran.read_listen': { ar: 'قراءة واستماع', en: 'Read & Listen' },

  // Hadiths Page
  'hadiths.badge': { ar: 'السنة النبوية المطهرة', en: 'Prophetic Sunnah' },
  'hadiths.title': { ar: 'الأحاديث النبوية الموثقة', en: 'Authentic Hadiths' },
  'hadiths.subtitle': { ar: 'موسوعة من الأحاديث الصحيحة والمحققة في الرقائق والمواعظ وفضائل الأعمال، مع بيان درجتها ومصدرها وتخريجها.', en: 'Verified Hadiths on heart softeners, reminders, and virtuous deeds with citations and authentic grading.' },
  'hadiths.search': { ar: 'ابحث في نصوص الأحاديث والفضائل...', en: 'Search Hadith texts and virtues...' },
  'hadiths.filter_all': { ar: 'جميع الأبواب', en: 'All Chapters' },
  'hadiths.narrator': { ar: 'الراوي:', en: 'Narrator:' },
  'hadiths.source': { ar: 'المصدر:', en: 'Source:' },
  'hadiths.grade': { ar: 'درجة الحديث:', en: 'Grading:' },
  'hadiths.copy': { ar: 'نسخ الحديث', en: 'Copy Hadith' },

  // Azkar Page
  'azkar.badge': { ar: 'حصن المسلم', en: 'Fortress of the Muslim' },
  'azkar.title': { ar: 'الأذكار والأدعية اليومية', en: 'Daily Adhkar & Duas' },
  'azkar.subtitle': { ar: 'حصّن يومك وليلتك بأذكار المصطفى ﷺ، واجعل لسانك رطباً بذكر الله مع العداد التفاعلي الذكي.', en: 'Protect your day and night with the Prophet’s remembrance and interactive counter.' },
  'azkar.morning': { ar: 'أذكار الصباح', en: 'Morning Adhkar' },
  'azkar.evening': { ar: 'أذكار المساء', en: 'Evening Adhkar' },
  'azkar.sleep': { ar: 'أذكار النوم', en: 'Sleeping Adhkar' },
  'azkar.prayer': { ar: 'أذكار بعد الصلاة', en: 'After Prayer Adhkar' },
  'azkar.tasbeeh_btn': { ar: 'تسبيح', en: 'Praise' },
  'azkar.completed': { ar: 'اكتملت القراءة', en: 'Completed' },
  'azkar.reset': { ar: 'إعادة العداد', en: 'Reset' },

  // Reflections Page
  'reflections.badge': { ar: 'رقائق ومواعظ', en: 'Heart Softeners & Reminders' },
  'reflections.title': { ar: 'كلمات توقظ القلب وتذكّر بالآخرة', en: 'Words that Awaken the Heart & Remind of Hereafter' },
  'reflections.subtitle': { ar: 'درر من أقوال السلف الصالح وعلماء الأمة في الزهد، وقيام الليل، وإصلاح السرائر، وحقيقة الرحيل عن الدنيا.', en: 'Pearls of wisdom from righteous scholars on asceticism, night prayer, inner rectitude, and eternity.' },

  // Footer
  'footer.headline': { ar: 'اللهم اغفر لجدتي وارحمها وأسكنها الفردوس الأعلى', en: 'O Allah, forgive my grandmother and grant her Jannatul Firdaus' },
  'footer.hadith': {
    ar: '«إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلاَّ مِنْ ثَلاَثَةٍ: إِلاَّ مِنْ صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ»',
    en: '"When a human being dies, their deeds end except for three: ongoing charity, beneficial knowledge, or a righteous child who prays for them."'
  },
  'footer.quick_links': { ar: 'روابط سريعة', en: 'Quick Links' },
  'footer.rights': { ar: 'جميع الحقوق محفوظة لكل مسلم ومسلمة • صدقة جارية', en: 'Free for every Muslim • Ongoing Charity' }
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly LANG_KEY = 'nour_app_lang';

  readonly currentLang = signal<AppLanguage>(this.getInitialLanguage());
  readonly isArabic = computed(() => this.currentLang() === 'ar');
  readonly direction = computed(() => (this.currentLang() === 'ar' ? 'rtl' : 'ltr'));

  constructor() {
    this.applyLanguage(this.currentLang());

    effect(() => {
      const lang = this.currentLang();
      this.applyLanguage(lang);
      try {
        localStorage.setItem(this.LANG_KEY, lang);
      } catch (e) { }
    });
  }

  private getInitialLanguage(): AppLanguage {
    try {
      const saved = localStorage.getItem(this.LANG_KEY);
      if (saved === 'ar' || saved === 'en') {
        return saved;
      }
    } catch (e) { }
    return 'ar';
  }

  toggleLanguage(): void {
    this.currentLang.update(lang => (lang === 'ar' ? 'en' : 'ar'));
  }

  setLanguage(lang: AppLanguage): void {
    this.currentLang.set(lang);
  }

  translate(key: string): string {
    const item = DICTIONARY[key];
    if (!item) return key;
    return item[this.currentLang()] || item['ar'] || key;
  }

  t(key: string): string {
    return this.translate(key);
  }

  private applyLanguage(lang: AppLanguage): void {
    if (typeof document === 'undefined') return;

    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.body.setAttribute('data-lang', lang);
    document.body.setAttribute('dir', dir);
  }
}
