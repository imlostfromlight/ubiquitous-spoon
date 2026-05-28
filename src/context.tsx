import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type Lang = "ru" | "kz";

interface Progress {
  knownCards: string[];          // flashcard IDs marked "known"
  quizAttempts: number;
  quizBestScore: number;         // 0–48
}

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  progress: Progress;
  markKnown: (id: string) => void;
  unmarkKnown: (id: string) => void;
  resetFlashcardProgress: () => void;
  recordQuizResult: (score: number, total: number) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue>(null!);

const STORAGE_KEY = "voenka_progress";

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { knownCards: [], quizAttempts: 0, quizBestScore: 0 };
}

function saveProgress(p: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("voenka_lang") as Lang) || "ru";
  });
  const [progress, setProgress] = useState<Progress>(loadProgress);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("voenka_lang", l);
  };

  useEffect(() => { saveProgress(progress); }, [progress]);

  const markKnown = (id: string) =>
    setProgress((p) => ({ ...p, knownCards: [...new Set([...p.knownCards, id])] }));

  const unmarkKnown = (id: string) =>
    setProgress((p) => ({ ...p, knownCards: p.knownCards.filter((x) => x !== id) }));

  const resetFlashcardProgress = () =>
    setProgress((p) => ({ ...p, knownCards: [] }));

  const recordQuizResult = (score: number, _total: number) =>
    setProgress((p) => ({
      ...p,
      quizAttempts: p.quizAttempts + 1,
      quizBestScore: Math.max(p.quizBestScore, score),
    }));

  const resetAll = () => {
    const fresh: Progress = { knownCards: [], quizAttempts: 0, quizBestScore: 0 };
    setProgress(fresh);
  };

  return (
    <AppContext.Provider value={{ lang, setLang, progress, markKnown, unmarkKnown, resetFlashcardProgress, recordQuizResult, resetAll }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
