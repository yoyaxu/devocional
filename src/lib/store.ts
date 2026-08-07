import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Reflection {
  number: number;
  title: string;
  quote: string;
  body: string;
}

export interface JournalEntry {
  reflectionNumber: number;
  text: string;
  date: string;
}

interface AppState {
  // Favorites
  favorites: number[];
  toggleFavorite: (num: number) => void;
  isFavorite: (num: number) => boolean;

  // Journal
  journal: Record<number, JournalEntry>;
  saveJournalEntry: (num: number, text: string) => void;
  getJournalEntry: (num: number) => JournalEntry | null;

  // Reading Progress
  readReflections: number[];
  markAsRead: (num: number) => void;
  isRead: (num: number) => boolean;
  getStreak: () => number;
  getLastReadDate: () => string | null;

  // Current view
  currentView: 'home' | 'reader' | 'favorites' | 'journal' | 'progress';
  setCurrentView: (view: 'home' | 'reader' | 'favorites' | 'journal' | 'progress') => void;

  // Current reflection being viewed
  currentReflection: number | null;
  setCurrentReflection: (num: number | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Favorites
      favorites: [],
      toggleFavorite: (num: number) =>
        set((state) => ({
          favorites: state.favorites.includes(num)
            ? state.favorites.filter((n) => n !== num)
            : [...state.favorites, num],
        })),
      isFavorite: (num: number) => get().favorites.includes(num),

      // Journal
      journal: {},
      saveJournalEntry: (num: number, text: string) =>
        set((state) => ({
          journal: {
            ...state.journal,
            [num]: { reflectionNumber: num, text, date: new Date().toISOString() },
          },
        })),
      getJournalEntry: (num: number) => get().journal[num] || null,

      // Reading Progress
      readReflections: [],
      markAsRead: (num: number) =>
        set((state) => ({
          readReflections: state.readReflections.includes(num)
            ? state.readReflections
            : [...state.readReflections, num],
        })),
      isRead: (num: number) => get().readReflections.includes(num),
      getStreak: () => {
        const readDates = get().readReflections.length;
        return readDates;
      },
      getLastReadDate: () => {
        const state = get();
        if (state.readReflections.length === 0) return null;
        const lastNum = state.readReflections[state.readReflections.length - 1];
        return new Date().toISOString();
      },

      // Navigation
      currentView: 'home',
      setCurrentView: (view) => set({ currentView: view }),
      currentReflection: null,
      setCurrentReflection: (num) => set({ currentReflection: num }),
    }),
    {
      name: '365-reflexiones-storage',
    }
  )
);
