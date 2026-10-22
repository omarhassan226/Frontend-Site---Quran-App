export interface Hadith {
  _id?: string;
  title: string;
  text: string;
  narrator: string;
  source: string;
  hadithNumber: string;
  grading: string;
  scholar: string;
  topic: string;
  explanation: string;
  referenceUrl: string;
  isFeatured: boolean;
  views?: number;
  likes?: number;
  createdAt?: string;
}
