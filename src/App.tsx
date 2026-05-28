import { useState } from "react";
import FlashcardMode from "./components/FlashcardMode";
import QuizMode from "./components/QuizMode";
import BrowseMode from "./components/BrowseMode";
import BilletMode from "./components/BilletMode";
import { useApp } from "./context";
import { allQuestions } from "./data";
import "./App.css";

type Mode = "home" | "flashcard" | "quiz" | "browse" | "billet";

const UI = {
  ru: {
    badge: "Итоговый экзамен",
    title: "Связь — основное средство управления войсками",
    sub: (n: number) => `${n} вопросов · 24 билета + доп. материалы`,
    flashcard: "Карточки", flashDesc: "Все вопросы вперемешку",
    quiz: "Тест", quizDesc: "Выберите правильный вариант из четырёх",
    billet: "По билетам", billetDesc: "Выберите билет и отвечайте по порядку",
    browse: "Все билеты", browseDesc: "Просмотр всех вопросов и ответов",
    progressTitle: "Мой прогресс",
    known: "Изучено карточек", bestScore: "Лучший результат теста",
    attempts: "Попыток теста", of: "из", noAttempts: "Ещё не проходили",
    resetAll: "Сбросить прогресс",
  },
  kz: {
    badge: "Қорытынды емтихан",
    title: "Байланыс — әскерді басқарудың негізгі құралы",
    sub: (n: number) => `${n} сұрақ · 24 билет + қос. материалдар`,
    flashcard: "Карточкалар", flashDesc: "Барлық сұрақтар аралас",
    quiz: "Тест", quizDesc: "Төрт нұсқадан дұрыс жауапты таңдаңыз",
    billet: "Билет бойынша", billetDesc: "Билетті таңдап, кезекпен жауап беріңіз",
    browse: "Барлық билеттер", browseDesc: "Барлық сұрақтар мен жауаптарды қарау",
    progressTitle: "Менің прогресім",
    known: "Үйренілген карточкалар", bestScore: "Тесттің үздік нәтижесі",
    attempts: "Тест əрекеттері", of: "/", noAttempts: "Әлі өтпеген",
    resetAll: "Прогресті тастау",
  },
};

export default function App() {
  const [mode, setMode] = useState<Mode>("home");
  const { lang, setLang, progress, resetAll } = useApp();
  const t = UI[lang];
  const total = allQuestions.length;

  if (mode === "flashcard") return <FlashcardMode onBack={() => setMode("home")} />;
  if (mode === "quiz")      return <QuizMode      onBack={() => setMode("home")} />;
  if (mode === "browse")    return <BrowseMode    onBack={() => setMode("home")} />;
  if (mode === "billet")    return <BilletMode    onBack={() => setMode("home")} />;

  const knownPct = Math.round((progress.knownCards.length / total) * 100);
  const bestPct  = progress.quizAttempts > 0
    ? Math.round((progress.quizBestScore / total) * 100) : null;

  return (
    <div className="home">
      <div className="home-inner">
        <div className="lang-toggle">
          <button className={`lang-btn ${lang === "ru" ? "active" : ""}`} onClick={() => setLang("ru")}>РУС</button>
          <button className={`lang-btn ${lang === "kz" ? "active" : ""}`} onClick={() => setLang("kz")}>ҚАЗ</button>
        </div>

        <div className="home-badge">{t.badge}</div>
        <h1 className="home-title">{t.title}</h1>
        <p className="home-sub">{t.sub(total)}</p>

        <div className="mode-grid">
          <button className="mode-card" onClick={() => setMode("flashcard")}>
            <span className="mode-icon">🃏</span>
            <span className="mode-name">{t.flashcard}</span>
            <span className="mode-desc">{t.flashDesc}</span>
          </button>
          <button className="mode-card" onClick={() => setMode("billet")}>
            <span className="mode-icon">📋</span>
            <span className="mode-name">{t.billet}</span>
            <span className="mode-desc">{t.billetDesc}</span>
          </button>
          <button className="mode-card" onClick={() => setMode("quiz")}>
            <span className="mode-icon">✅</span>
            <span className="mode-name">{t.quiz}</span>
            <span className="mode-desc">{t.quizDesc}</span>
          </button>
          <button className="mode-card" onClick={() => setMode("browse")}>
            <span className="mode-icon">📖</span>
            <span className="mode-name">{t.browse}</span>
            <span className="mode-desc">{t.browseDesc}</span>
          </button>
        </div>

        <div className="progress-panel">
          <h2 className="progress-panel-title">{t.progressTitle}</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">{t.known}</span>
              <span className="stat-value">{progress.knownCards.length} <span className="stat-denom">{t.of} {total}</span></span>
              <div className="stat-bar-wrap">
                <div className="stat-bar-fill green" style={{ width: `${knownPct}%` }} />
              </div>
              <span className="stat-pct">{knownPct}%</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{t.bestScore}</span>
              {bestPct !== null ? (
                <>
                  <span className="stat-value">{progress.quizBestScore} <span className="stat-denom">{t.of} {total}</span></span>
                  <div className="stat-bar-wrap">
                    <div className="stat-bar-fill blue" style={{ width: `${bestPct}%` }} />
                  </div>
                  <span className="stat-pct">{bestPct}%</span>
                </>
              ) : (
                <span className="stat-none">{t.noAttempts}</span>
              )}
            </div>
            <div className="stat-card">
              <span className="stat-label">{t.attempts}</span>
              <span className="stat-value big">{progress.quizAttempts}</span>
            </div>
          </div>
          {(progress.knownCards.length > 0 || progress.quizAttempts > 0) && (
            <button className="btn-reset" onClick={resetAll}>{t.resetAll}</button>
          )}
        </div>
      </div>
    </div>
  );
}
