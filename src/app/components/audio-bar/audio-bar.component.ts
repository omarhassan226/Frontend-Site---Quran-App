import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioPlayerService } from '../../services/audio-player.service';

@Component({
  selector: 'app-audio-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (player.currentAyah()) {
      <div class="audio-dock-wrapper">
        <div class="container audio-dock-container">
          <!-- Ayah & Surah Info -->
          <div class="recitation-info">
            <div class="playing-pulse" [class.paused]="!player.isPlaying()">
              <i class="fa-solid fa-volume-high"></i>
            </div>
            <div class="text-meta">
              <span class="surah-name">
                {{ player.currentSurah()?.name || 'سورة' }}
                <span class="ayah-num">الآية {{ player.currentAyah()?.numberInSurah }}</span>
              </span>
              <span class="reciter-tag">
                <i class="fa-solid fa-microphone-lines"></i> بصوت القارئ: {{ player.reciterName() }}
              </span>
            </div>
          </div>

          <!-- Controls & Progress -->
          <div class="player-controls-section">
            <div class="control-buttons">
              <button class="btn-ctrl" (click)="player.prevAyah()" title="الآية السابقة">
                <i class="fa-solid fa-forward-step"></i>
              </button>

              <button class="btn-play-pause" (click)="player.togglePlay()" title="تشغيل / إيقاف">
                @if (player.isLoading()) {
                  <i class="fa-solid fa-spinner fa-spin"></i>
                } @else if (player.isPlaying()) {
                  <i class="fa-solid fa-pause"></i>
                } @else {
                  <i class="fa-solid fa-play"></i>
                }
              </button>

              <button class="btn-ctrl" (click)="player.nextAyah()" title="الآية التالية">
                <i class="fa-solid fa-backward-step"></i>
              </button>
            </div>

            <!-- Progress Bar -->
            <div class="progress-bar-container">
              <span class="time-label">{{ formatTime(player.currentTime()) }}</span>
              <input
                type="range"
                min="0"
                [max]="player.duration() || 100"
                [value]="player.currentTime()"
                (input)="onSeek($event)"
                class="progress-slider"
              />
              <span class="time-label">{{ formatTime(player.duration()) }}</span>
            </div>
          </div>

          <!-- Close / Stop Button -->
          <div class="dock-actions">
            <button class="btn-close-dock" (click)="player.stop()" title="إغلاق المشغل">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .audio-dock-wrapper {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid var(--border-emerald);
      box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.6);
      padding: 10px 0;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .audio-dock-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .recitation-info {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 250px;
    }

    .playing-pulse {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-emerald), #047857);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 1.1rem;
      animation: pulseGlow 2s infinite ease-in-out;
    }

    .playing-pulse.paused {
      animation: none;
      opacity: 0.7;
    }

    .text-meta {
      display: flex;
      flex-direction: column;
    }

    .surah-name {
      font-weight: 700;
      font-size: 1rem;
      color: var(--text-main);
    }

    .ayah-num {
      color: var(--gold-light);
      font-size: 0.85rem;
      margin-right: 6px;
    }

    .reciter-tag {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .player-controls-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      max-width: 600px;
      gap: 4px;
    }

    .control-buttons {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .btn-ctrl {
      color: var(--text-muted);
      font-size: 1.1rem;
      padding: 6px;
      transition: color 0.2s, transform 0.2s;
    }

    .btn-ctrl:hover {
      color: var(--text-main);
      transform: scale(1.1);
    }

    .btn-play-pause {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #ffffff;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      box-shadow: 0 4px 14px rgba(255, 255, 255, 0.2);
      transition: all 0.2s;
    }

    .btn-play-pause:hover {
      transform: scale(1.08);
      background: var(--gold-light);
    }

    .progress-bar-container {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
    }

    .time-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      min-width: 35px;
      text-align: center;
    }

    .progress-slider {
      flex: 1;
      height: 4px;
      accent-color: var(--primary-emerald);
      cursor: pointer;
    }

    .btn-close-dock {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .btn-close-dock:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .reciter-tag {
        display: none;
      }
      .progress-bar-container {
        display: none;
      }
    }
  `]
})
export class AudioBarComponent {
  player = inject(AudioPlayerService);

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  onSeek(event: any) {
    const val = parseFloat(event.target.value);
    this.player.seekTo(val);
  }
}
