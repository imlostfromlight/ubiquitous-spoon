import { useState, useMemo } from "react";
import { allQuestions } from "../data";
import type { Question } from "../data";
import { useApp } from "../context";

interface Props { onBack: () => void; }

interface QuizQuestion {
  q: Question;
  options: string[];
  correctIndex: number;
}

const UI = {
  ru: { back: "← Назад", title: "Тест", correct: "Верно!", wrong: "Неверно.", correctAnswer: "Правильный ответ:", prev: "← Предыдущий", next: "Следующий вопрос →", finish: "Завершить", result: "Результат", again: "Пройти снова", home: "На главную", billet: "Билет", question: "Вопрос" },
  kz: { back: "← Артқа", title: "Тест", correct: "Дұрыс!", wrong: "Қате.", correctAnswer: "Дұрыс жауап:", prev: "← Алдыңғы", next: "Келесі сұрақ →", finish: "Аяқтау", result: "Нәтиже", again: "Қайта өту", home: "Басты бетке", billet: "Билет", question: "Сұрақ" },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(qs: Question[], lang: "ru" | "kz"): QuizQuestion[] {
  return shuffle(qs).map((q) => {
    const distractors = shuffle(qs.filter((o) => o.id !== q.id))
      .slice(0, 3)
      .map((o) => o[lang].answer);
    const options = shuffle([q[lang].answer, ...distractors]);
    return { q, options, correctIndex: options.indexOf(q[lang].answer) };
  });
}

function truncate(text: string, max = 130) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function QuizMode({ onBack }: Props) {
  const { lang, recordQuizResult } = useApp();
  const t = UI[lang];
  const quiz = useMemo(() => buildQuiz(allQuestions, lang), [lang]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(quiz.length).fill(null));
  const [finished, setFinished] = useState(false);

  const current = quiz[index];
  const total = quiz.length;
  const selected = answers[index];
  const answered = selected !== null;

  const score = answers.filter((a, i) => a !== null && a === quiz[i].correctIndex).length;

  const handleSelect = (i: number) => {
    if (answered) return;
    setAnswers((prev) => { const next = [...prev]; next[index] = i; return next; });
  };

  const handlePrev = () => { if (index > 0) setIndex((i) => i - 1); };

  const handleNext = () => {
    if (index + 1 >= total) {
      recordQuizResult(score, total);
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (finished) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="page">
        <div className="top-bar">
          <button className="btn-ghost" onClick={onBack}>{t.back}</button>
          <span className="top-title">{t.result}</span>
          <span />
        </div>
        <div className="done-screen">
          <div className="done-emoji">{pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📚"}</div>
          <h2>{t.result}</h2>
          <p className="score-big">{score} / {total}</p>
          <p className="done-sub">{pct}%</p>
          <div className="done-buttons">
            <button className="btn-primary" onClick={() => window.location.reload()}>{t.again}</button>
            <button className="btn-ghost-large" onClick={onBack}>{t.home}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="top-bar">
        <button className="btn-ghost" onClick={onBack}>{t.back}</button>
        <span className="top-title">{t.title}</span>
        <span className="progress-text">{index + 1} / {total}</span>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${(index / total) * 100}%` }} />
      </div>

      <div className="quiz-wrap">
        <span className="card-billet">{current.q.billetNum > 0 ? `${t.billet} ${current.q.billetNum} · ${t.question} ${current.q.questionNum}` : `Доп. · №${current.q.questionNum}`}</span>
        <h2 className="quiz-question">{current.q[lang].question}</h2>

        <div className="options-list">
          {current.options.map((opt, i) => {
            let cls = "option";
            if (answered) {
              if (i === current.correctIndex) cls += " correct";
              else if (i === selected) cls += " wrong";
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)}>
                <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                <span className="opt-text">{truncate(opt)}</span>
              </button>
            );
          })}
        </div>

        <div className="quiz-nav">
          <button className="btn-ghost" onClick={handlePrev} disabled={index === 0}>{t.prev}</button>
          {answered && (
            <button className="btn-primary" onClick={handleNext}>
              {index + 1 < total ? t.next : t.finish}
            </button>
          )}
        </div>

        {answered && (
          <div className="quiz-feedback">
            {selected === current.correctIndex ? (
              <p className="feedback-correct">{t.correct}</p>
            ) : (
              <div className="feedback-wrong-block">
                <p className="feedback-wrong">{t.wrong}</p>
                <p className="feedback-answer-label">{t.correctAnswer}</p>
                <p className="feedback-answer-text">{current.options[current.correctIndex]}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
