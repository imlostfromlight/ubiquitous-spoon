import { useState } from "react";
import { questions } from "../data";
import { useApp } from "../context";

interface Props { onBack: () => void; }

const UI = {
  ru: {
    back: "← Назад", backList: "← К билетам", title: "По билетам",
    billet: "Билет №", question: "Вопрос", answer: "Ответ",
    hint: "Нажмите для ответа", know: "Знаю ✓", repeat: "Повторить",
    next: "Следующий →", prev: "← Предыдущий", done: "Билет завершён!",
    doneBack: "К списку билетов", known: "изучено",
  },
  kz: {
    back: "← Артқа", backList: "← Билеттерге", title: "Билет бойынша",
    billet: "Билет №", question: "Сұрақ", answer: "Жауап",
    hint: "Жауап үшін басыңыз", know: "Білемін ✓", repeat: "Қайталау",
    next: "Келесі →", prev: "← Алдыңғы", done: "Билет аяқталды!",
    doneBack: "Билеттер тізіміне", known: "үйренілді",
  },
};

export default function BilletMode({ onBack }: Props) {
  const { lang, progress, markKnown } = useApp();
  const t = UI[lang];
  const [selectedBillet, setSelectedBillet] = useState<number | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const billets = Array.from({ length: 24 }, (_, i) => i + 1);
  const knownSet = new Set(progress.knownCards);

  if (selectedBillet === null) {
    return (
      <div className="page">
        <div className="top-bar">
          <button className="btn-ghost" onClick={onBack}>{t.back}</button>
          <span className="top-title">{t.title}</span>
          <span />
        </div>
        <div className="billet-grid">
          {billets.map((n) => {
            const bqs = questions.filter((q) => q.billetNum === n);
            const knownCount = bqs.filter((q) => knownSet.has(q.id)).length;
            const allKnown = knownCount === bqs.length;
            return (
              <button
                key={n}
                className={`billet-tile ${allKnown ? "billet-tile-done" : ""}`}
                onClick={() => { setSelectedBillet(n); setQIndex(0); setFlipped(false); }}
              >
                <span className="billet-tile-num">{n}</span>
                <span className="billet-tile-label">{t.billet.replace("№", "").trim()}</span>
                <div className="billet-tile-dots">
                  {bqs.map((q) => (
                    <span key={q.id} className={`dot ${knownSet.has(q.id) ? "dot-known" : ""}`} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const bqs = questions.filter((q) => q.billetNum === selectedBillet);
  const current = bqs[qIndex];
  const done = qIndex >= bqs.length;

  const handleFlip = () => setFlipped((f) => !f);
  const handleKnow = () => {
    markKnown(current.id);
    setFlipped(false);
    setQIndex((i) => i + 1);
  };
  const handleRepeat = () => {
    setFlipped(false);
    setQIndex((i) => i + 1);
  };
  const handlePrev = () => {
    setFlipped(false);
    setQIndex((i) => Math.max(0, i - 1));
  };

  const knownInBillet = bqs.filter((q) => knownSet.has(q.id)).length;

  return (
    <div className="page">
      <div className="top-bar">
        <button className="btn-ghost" onClick={() => setSelectedBillet(null)}>{t.backList}</button>
        <span className="top-title">{t.billet} {selectedBillet}</span>
        <span className="progress-text">{Math.min(qIndex + 1, bqs.length)} / {bqs.length}</span>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${(qIndex / bqs.length) * 100}%` }} />
      </div>

      {done ? (
        <div className="done-screen">
          <div className="done-emoji">{knownInBillet === bqs.length ? "🏆" : "📋"}</div>
          <h2>{t.done}</h2>
          <p className="done-sub">{knownInBillet} / {bqs.length} {t.known}</p>
          <div className="done-buttons">
            <button className="btn-primary" onClick={() => { setQIndex(0); setFlipped(false); }}>
              {lang === "ru" ? "Пройти снова" : "Қайта өту"}
            </button>
            <button className="btn-ghost-large" onClick={() => setSelectedBillet(null)}>{t.doneBack}</button>
          </div>
        </div>
      ) : (
        <>
          <div className={`card-wrap ${flipped ? "flipped" : ""}`} onClick={handleFlip}>
            <div className="card-inner">
              <div className="card-front">
                <span className="card-billet">{t.question} {current.questionNum}</span>
                <p className="card-question">{current[lang].question}</p>
                <span className="card-hint">{t.hint}</span>
              </div>
              <div className="card-back">
                <span className="card-billet">{t.answer}</span>
                <p className="card-answer">{current[lang].answer}</p>
              </div>
            </div>
          </div>

          <div className="billet-nav">
            <button className="btn-ghost" onClick={handlePrev} disabled={qIndex === 0}>{t.prev}</button>
            {flipped ? (
              <div className="card-actions-inline">
                <button className="btn-repeat" onClick={handleRepeat}>{t.repeat}</button>
                <button className="btn-know" onClick={handleKnow}>{t.know}</button>
              </div>
            ) : (
              <div />
            )}
            {!flipped && qIndex < bqs.length - 1 && (
              <button className="btn-ghost" onClick={() => { setFlipped(false); setQIndex((i) => i + 1); }}>{t.next}</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
