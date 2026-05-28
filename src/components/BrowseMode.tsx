import { useState } from "react";
import { questions } from "../data";
import { useApp } from "../context";

interface Props { onBack: () => void; }

const UI = {
  ru: { back: "← Назад", title: "Все билеты", billet: "Билет №", show: "Показать ответ", hide: "Скрыть ответ", q: "Вопрос" },
  kz: { back: "← Артқа", title: "Барлық билеттер", billet: "Билет №", show: "Жауапты көрсету", hide: "Жауапты жасыру", q: "Сұрақ" },
};

export default function BrowseMode({ onBack }: Props) {
  const { lang } = useApp();
  const t = UI[lang];
  const billets = Array.from(new Set(questions.map((q) => q.billetNum))).sort((a, b) => a - b);
  const [openBillet, setOpenBillet] = useState<number | null>(null);
  const [openAnswer, setOpenAnswer] = useState<Set<string>>(new Set());

  const toggleBillet = (n: number) => setOpenBillet((prev) => (prev === n ? null : n));
  const toggleAnswer = (id: string) => {
    setOpenAnswer((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="page">
      <div className="top-bar">
        <button className="btn-ghost" onClick={onBack}>{t.back}</button>
        <span className="top-title">{t.title}</span>
        <span />
      </div>

      <div className="browse-list">
        {billets.map((bNum) => {
          const bqs = questions.filter((q) => q.billetNum === bNum);
          const isOpen = openBillet === bNum;
          return (
            <div key={bNum} className="billet-block">
              <button className={`billet-header ${isOpen ? "open" : ""}`} onClick={() => toggleBillet(bNum)}>
                <span>{t.billet} {bNum}</span>
                <span className="billet-chevron">{isOpen ? "▲" : "▼"}</span>
              </button>
              {isOpen && (
                <div className="billet-questions">
                  {bqs.map((q) => (
                    <div key={q.id} className="browse-question">
                      <div className="browse-q-header">
                        <span className="browse-q-num">{t.q} {q.questionNum}</span>
                        <p className="browse-q-text">{q[lang].question}</p>
                        <button className="btn-show-answer" onClick={() => toggleAnswer(q.id)}>
                          {openAnswer.has(q.id) ? t.hide : t.show}
                        </button>
                      </div>
                      {openAnswer.has(q.id) && (
                        <div className="browse-answer">
                          {q[lang].answer.split("\n").map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
