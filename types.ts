
export type Rank = 'bronze' | 'silver' | 'gold' | 'plat' | 'diamond';

export interface Title {
  lv: number;
  name: string;
  status: string;
  rank: Rank;
  icon: string;
}

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
}

export interface LogEntry {
  id: number;
  date: string; // ISO String
  displayDate: string;
  type: 'draw' | 'write' | 'side';
  note: string;
  cp?: string;
  wordCount?: number;
  rating?: string;
  title?: string;
}

export interface Holiday {
  date: string; // MM-DD or YYYY-MM-DD
  name: string;
  type: 'love' | 'fun' | 'custom';
}

export interface BGM {
  artist: string;
  title: string;
  type: string;
}

export interface ReportData {
  title: string;
  count: number;
  wordCount: number;
  rank: string;
  topCp: string;
  r18Ratio: number; // 0-100
  flavorText: string;
  rpgClass: string;
  stats: {
    str: number; // Based on Volume
    agi: number; // Based on Frequency
    int: number; // Based on Streak/Variety
    chr: number; // Based on Achievements
  };
}

export interface AppState {
  rpg: {
    level: number;
    xp: number;
    nextLevelXp: number;
    unlockedAchievements: string[];
    lastReportRank: number | null;
  };
  checkin: {
    lastDate: string | null;
    streak: number;
    total: number;
  };
  history: LogEntry[];
  customHolidays: Holiday[];
  draw: {
    done: boolean;
    count: number;
    lastResetWeek: string | null;
  };
  write: {
    done: boolean;
    count: number;
    lastResetMonth: string | null;
  };
  side: {
    done: boolean;
    text: string;
    concept: string;
    date: string | null;
    count: number;
  };
}
