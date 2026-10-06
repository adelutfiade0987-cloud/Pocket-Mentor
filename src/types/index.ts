export type LifeStage =
  | 'High school grad'
  | 'Semester 1–2'
  | 'Semester 3–4'
  | 'Semester 5–6'
  | 'Semester 7'
  | 'Semester 8'
  | 'Already working';

export type GoalCategory = 'study' | 'career' | 'health' | 'finance' | 'content';

export type MoodType = 'great' | 'good' | 'neutral' | 'tired' | 'stressed';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  origin: string; // e.g. "Bandung", "Jakarta", "Yogyakarta"
  stage: LifeStage;
  collegeSemester?: number; // 1 to 8
  major?: string; // Field of study
  currentRole?: string; // If already working
  industry?: string;
  interests: string[];
  careerDirection: string; // Target industry/dream role
  desiredContribution: string; // "Kamu mau dibutuhkan sebagai apa"
  targetDestination?: string; // Target uni, company, city
  focusAreas: string[]; // e.g. "Career & job prep", "Daily habits & goals", "Journaling", "Money management", "Content creation"
  reminderTime: string; // e.g. "20:00"
  bannerNotifications: boolean;
  onboarded: boolean;
}

export interface Goal {
  id: string;
  title: string;
  completed: boolean;
  category: GoalCategory;
  linkedMilestoneId?: string;
  date: string; // YYYY-MM-DD
}

export interface Milestone {
  id: string;
  stageId: LifeStage;
  title: string;
  description: string;
  category: GoalCategory;
  completed: boolean;
  convertedToGoalId?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  prompt: string;
  content: string;
  mood: MoodType;
  updatedAt: string;
}

export interface FinanceData {
  monthlyIncome: number;
  currency: 'IDR' | 'USD';
  needsPercent: number; // default 50
  wantsPercent: number; // default 30
  savingsPercent: number; // default 20
  emergencyFundTargetMonths: number;
  emergencyFundCurrent: number;
}

export interface SceneAnalysisResult {
  mood: string;
  sceneAnalysis: string;
  openingStory: string;
  reflectionTakeaway: string;
  imageSrc?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export type EventUrgency = 'urgent' | 'penting' | 'sebentar_lagi' | 'masih_lama' | 'karir';
export type EventType = 'tugas' | 'skripsi' | 'magang' | 'ujian' | 'aktivitas';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "14:00"
  location?: string;
  urgency: EventUrgency;
  type?: EventType;
  description?: string;
  completed: boolean;
}

