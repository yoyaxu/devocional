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

export type ViewType = 'home' | 'reader' | 'favorites' | 'journal' | 'progress' | 'about' | 'mood';

interface AppState {
  favorites: number[];
  toggleFavorite: (num: number) => void;
  isFavorite: (num: number) => boolean;

  journal: Record<number, JournalEntry>;
  saveJournalEntry: (num: number, text: string) => void;
  getJournalEntry: (num: number) => JournalEntry | null;

  readReflections: number[];
  markAsRead: (num: number) => void;
  isRead: (num: number) => boolean;

  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  currentReflection: number | null;
  setCurrentReflection: (num: number | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (num: number) =>
        set((state) => ({
          favorites: state.favorites.includes(num)
            ? state.favorites.filter((n) => n !== num)
            : [...state.favorites, num],
        })),
      isFavorite: (num: number) => get().favorites.includes(num),

      journal: {},
      saveJournalEntry: (num: number, text: string) =>
        set((state) => ({
          journal: {
            ...state.journal,
            [num]: { reflectionNumber: num, text, date: new Date().toISOString() },
          },
        })),
      getJournalEntry: (num: number) => get().journal[num] || null,

      readReflections: [],
      markAsRead: (num: number) =>
        set((state) => ({
          readReflections: state.readReflections.includes(num)
            ? state.readReflections
            : [...state.readReflections, num],
        })),
      isRead: (num: number) => get().readReflections.includes(num),

      currentView: 'home' as ViewType,
      setCurrentView: (view: ViewType) => set({ currentView: view }),
      currentReflection: null,
      setCurrentReflection: (num: number | null) => set({ currentReflection: num }),
    }),
    { name: '365-reflexiones-v2' }
  )
);