import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Surah, SurahDetail, Reciter } from '../models/quran.model';
import { Hadith } from '../models/hadith.model';
import { Zikr } from '../models/zikr.model';
import { Reflection } from '../models/reflection.model';
import { Memorial } from '../models/memorial.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // ==================== QURAN ====================
  getSurahs(): Observable<{ success: boolean; data: Surah[] }> {
    return this.http.get<{ success: boolean; data: Surah[] }>(`${this.baseUrl}/quran/surahs`);
  }

  getReciters(): Observable<{ success: boolean; data: Reciter[] }> {
    return this.http.get<{ success: boolean; data: Reciter[] }>(`${this.baseUrl}/quran/reciters`);
  }

  getSurahDetail(number: number, reciter: string = 'ar.alafasy'): Observable<{ success: boolean; data: SurahDetail }> {
    return this.http.get<{ success: boolean; data: SurahDetail }>(
      `${this.baseUrl}/quran/surah/${number}?reciter=${reciter}`
    );
  }

  getRandomAyah(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/quran/ayah/random`);
  }

  // ==================== HADITH ====================
  getHadiths(topic?: string, grading?: string, search?: string, page: number = 1, limit: number = 20): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (topic && topic !== 'الكل') params = params.set('topic', topic);
    if (grading && grading !== 'الكل') params = params.set('grading', grading);
    if (search && search.trim()) params = params.set('search', search.trim());

    return this.http.get<any>(`${this.baseUrl}/hadiths`, { params });
  }

  getRandomHadith(): Observable<{ success: boolean; data: Hadith }> {
    return this.http.get<{ success: boolean; data: Hadith }>(`${this.baseUrl}/hadiths/random`);
  }

  getHadithById(id: string): Observable<{ success: boolean; data: Hadith }> {
    return this.http.get<{ success: boolean; data: Hadith }>(`${this.baseUrl}/hadiths/${id}`);
  }

  getHadithTopics(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.baseUrl}/hadiths/meta/topics`);
  }

  likeHadith(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/hadiths/${id}/like`, {});
  }

  createHadith(hadith: Partial<Hadith>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/hadiths`, hadith);
  }

  updateHadith(id: string, hadith: Partial<Hadith>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/hadiths/${id}`, hadith);
  }

  deleteHadith(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/hadiths/${id}`);
  }

  // ==================== AZKAR ====================
  getAzkar(category?: string): Observable<{ success: boolean; data: Zikr[] }> {
    let params = new HttpParams();
    if (category && category !== 'الكل') params = params.set('category', category);
    return this.http.get<{ success: boolean; data: Zikr[] }>(`${this.baseUrl}/azkar`, { params });
  }

  getAzkarCategories(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.baseUrl}/azkar/meta/categories`);
  }

  createZikr(zikr: Partial<Zikr>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/azkar`, zikr);
  }

  updateZikr(id: string, zikr: Partial<Zikr>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/azkar/${id}`, zikr);
  }

  deleteZikr(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/azkar/${id}`);
  }

  // ==================== REFLECTIONS ====================
  getReflections(category?: string, featured?: boolean): Observable<{ success: boolean; data: Reflection[] }> {
    let params = new HttpParams();
    if (category && category !== 'الكل') params = params.set('category', category);
    if (featured) params = params.set('featured', 'true');
    return this.http.get<{ success: boolean; data: Reflection[] }>(`${this.baseUrl}/reflections`, { params });
  }

  getRandomReflection(): Observable<{ success: boolean; data: Reflection }> {
    return this.http.get<{ success: boolean; data: Reflection }>(`${this.baseUrl}/reflections/random`);
  }

  createReflection(reflection: Partial<Reflection>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reflections`, reflection);
  }

  updateReflection(id: string, reflection: Partial<Reflection>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/reflections/${id}`, reflection);
  }

  deleteReflection(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/reflections/${id}`);
  }

  likeReflection(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reflections/${id}/like`, {});
  }

  // ==================== MEMORIAL & CHARITY ====================
  getMemorial(): Observable<{ success: boolean; data: Memorial }> {
    return this.http.get<{ success: boolean; data: Memorial }>(`${this.baseUrl}/memorial`);
  }

  updateMemorial(memorial: Partial<Memorial>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/memorial`, memorial);
  }

  prayForGrandmother(): Observable<{ success: boolean; prayersCount: number; message: string }> {
    return this.http.post<any>(`${this.baseUrl}/memorial/pray`, {});
  }

  recordTasbeeh(count: number = 1): Observable<{ success: boolean; tasbeehCount: number }> {
    return this.http.post<any>(`${this.baseUrl}/memorial/tasbeeh`, { count });
  }

  recordKhatma(): Observable<{ success: boolean; khatmaCount: number; message: string }> {
    return this.http.post<any>(`${this.baseUrl}/memorial/khatma`, {});
  }

  // ==================== DASHBOARD STATS ====================
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats`);
  }

  seedData(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/stats/seed`, {});
  }
}
