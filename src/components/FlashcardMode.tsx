import { useState, useCallback } from "react";
import { allQuestions } from "../data";
import { useApp } from "../context";

interface Props { onBack: () => void; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const UI = {
  ru: { back: "← Назад", title: "Карточки", hint: "Нажмите для ответа", answer: "Ответ", know: "Знаю ✓", repeat: "Повторить", done: "Готово!", doneDesc: (t: number) => `Вы прошли все ${t} карточек.`, doneSub: (k: number, r: number) => `Знаете: ${k} · Повторить: ${r}`, restart: "Начать заново", billet: "Билет", question: "Вопрос", extra: "Доп." },
  kz: { back: "← Артқа", title: "Карточкалар", hint: "Жауап үшін басыңыз", answer: "Жауап", know: "Білемін ✓", repeat: "Қайталау", done: "Дайын!", doneDesc: (t: number) => `Сіз барлық ${t} карточканы өттіңіз.`, doneSub: (k: number, r: number) => `Білемін: ${k} · Қайталау: ${r}`, restart: "Қайта бастау", billet: "Билет", question: "Сұрақ", extra: "Қос." },
};

export default function FlashcardMode({ onBack }: Props) {
  const { lang, progress, markKnown, resetFlashcardProgress } = useApp();
  const t = UI[lang];
  const [deck, setDeck] = useState(() => shuffle(allQuestions));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = deck[index];
  const total = deck.length;
  const knownSet = new Set(progress.knownCards);

  const handleFlip = () => setFlipped((f) => !f);

  const handleKnow = useCallback(() => {
    markKnown(current.id);
    setFlipped(false);
    setIndex((i) => i + 1);
  }, [current.id, markKnown]);

  const handleRepeat = useCallback(() => {
    setFlipped(false);
    setIndex((i) => i + 1);
  }, []);

  const handleRestart = () => {
    resetFlashcardProgress();
    setDeck(shuffle(allQuestions));
    setIndex(0);
    setFlipped(false);
  };

  const done = index >= total;
  const knownInSession = deck.slice(0, index).filter((q) => knownSet.has(q.id)).length;

  return (
    <div className="page">
      <div className="top-bar">
        <button className="btn-ghost" onClick={onBack}>{t.back}</button>
        <span className="top-title">{t.title}</span>
        <span className="progress-text">{Math.min(index + 1, total)} / {total}</span>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${(progress.knownCards.length / total) * 100}%` }} />
      </div>

      {done ? (
        <div className="done-screen">
          <div className="done-emoji">🎉</div>
          <h2>{t.done}</h2>
          <p>{t.doneDesc(total)}</p>
          <p className="done-sub">{t.doneSub(knownInSession, total - knownInSession)}</p>
          <button className="btn-primary" onClick={handleRestart}>{t.restart}</button>
        </div>
      ) : (
        <>
          <div className={`card-wrap ${flipped ? "flipped" : ""}`} onClick={handleFlip}>
            <div className="card-inner">
              <div className="card-front">
                <span className="card-billet">{current.billetNum > 0 ? `${t.billet} ${current.billetNum} · ${t.question} ${current.questionNum}` : `${t.extra} · №${current.questionNum}`}</span>
                <p className="card-question">{current[lang].question}</p>
                <span className="card-hint">{t.hint}</span>
              </div>
              <div className="card-back">
                <span className="card-billet">{t.answer}</span>
                <p className="card-answer">{current[lang].answer}</p>
              </div>
            </div>
          </div>

          {flipped && (
            <div className="card-actions">
              <button className="btn-repeat" onClick={handleRepeat}>{t.repeat}</button>
              <button className="btn-know" onClick={handleKnow}>{t.know}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
