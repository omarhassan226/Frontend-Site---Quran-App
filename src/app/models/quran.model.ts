export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
  audio?: string;
}

export interface SurahDetail extends Surah {
  reciter: string;
  ayahs: Ayah[];
}

export interface Reciter {
  id: string;
  name: string;
  englishName: string;
  style: string;
}
