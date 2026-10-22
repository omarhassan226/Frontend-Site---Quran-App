import { Injectable, signal, inject } from '@angular/core';
import { Ayah, SurahDetail } from '../models/quran.model';
import { ActivityTrackerService } from './activity-tracker.service';

@Injectable({
  providedIn: 'root',
})
export class AudioPlayerService {
  private audio = new Audio();
  private tracker = inject(ActivityTrackerService);

  // Reactive State using Angular Signals
  isPlaying = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  currentAyah = signal<Ayah | null>(null);
  currentSurah = signal<SurahDetail | null>(null);
  currentAyahIndex = signal<number>(-1);
  currentTime = signal<number>(0);
  duration = signal<number>(0);
  reciterName = signal<string>('مشاري راشد العفاسي');

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    this.audio.addEventListener('play', () => this.isPlaying.set(true));
    this.audio.addEventListener('pause', () => this.isPlaying.set(false));
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime.set(this.audio.currentTime);
      this.duration.set(this.audio.duration || 0);
    });
    this.audio.addEventListener('loadstart', () => this.isLoading.set(true));
    this.audio.addEventListener('canplay', () => this.isLoading.set(false));
    this.audio.addEventListener('ended', () => {
      this.nextAyah();
    });
    this.audio.addEventListener('error', (e) => {
      console.error('[AudioPlayer Error]', e);
      this.isLoading.set(false);
      this.isPlaying.set(false);
    });
  }

  playAyah(ayah: Ayah, surah: SurahDetail, index: number, reciterDisplayName?: string) {
    if (reciterDisplayName) {
      this.reciterName.set(reciterDisplayName);
    }
    this.currentAyah.set(ayah);
    this.currentSurah.set(surah);
    this.currentAyahIndex.set(index);

    if (ayah.audio) {
      this.audio.src = ayah.audio;
      this.audio.load();
      this.audio.play().catch((err) => console.warn('Audio play error:', err));

      // Log audio playback activity
      this.tracker.log('PLAY_AUDIO', `استماع: ${surah.name} • الآية ${ayah.numberInSurah}`, {
        surahNumber: surah.number,
        ayahNumber: ayah.numberInSurah,
        reciter: this.reciterName(),
      });
    }
  }

  togglePlay() {
    if (!this.audio.src) return;
    if (this.isPlaying()) {
      this.audio.pause();
    } else {
      this.audio.play().catch((err) => console.warn('Audio play error:', err));
    }
  }

  nextAyah() {
    const surah = this.currentSurah();
    const curIdx = this.currentAyahIndex();
    if (!surah || curIdx === -1) return;

    if (curIdx + 1 < surah.ayahs.length) {
      const nextIdx = curIdx + 1;
      this.playAyah(surah.ayahs[nextIdx], surah, nextIdx);
    } else {
      this.stop();
    }
  }

  prevAyah() {
    const surah = this.currentSurah();
    const curIdx = this.currentAyahIndex();
    if (!surah || curIdx <= 0) return;

    const prevIdx = curIdx - 1;
    this.playAyah(surah.ayahs[prevIdx], surah, prevIdx);
  }

  seekTo(seconds: number) {
    if (this.audio.duration) {
      this.audio.currentTime = seconds;
    }
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying.set(false);
    this.currentAyah.set(null);
    this.currentAyahIndex.set(-1);
  }
}
