"use client";
import { useEffect, useState } from "react";

// Мэргэжлийг бичиж, арилгаж, дараагийнх руу шилжинэ. "A, B, C" гэж өгвөл ээлжилнэ.
export default function Typewriter({ text }) {
  const words = text.split(",").map((w) => w.trim()).filter(Boolean);
  const [i, setI] = useState(0);
  const [len, setLen] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const word = words[i % words.length] || "";

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setLen(word.length);
    let delay = deleting ? 40 : 90;
    if (!deleting && len === word.length) {
      if (words.length === 1) return; // ганц үг бол бичээд зогсоно
      delay = 2000;
    } else if (deleting && len === 0) delay = 400;

    const t = setTimeout(() => {
      if (!deleting && len === word.length) setDeleting(true);
      else if (deleting && len === 0) {
        setDeleting(false);
        setI(i + 1);
      } else setLen(len + (deleting ? -1 : 1));
    }, delay);
    return () => clearTimeout(t);
  }, [len, deleting, word, words.length, i]);

  // Сүүлийн үг (Developer) цэнхэр, бусад нь хар
  const typed = word.slice(0, len);
  const split = word.lastIndexOf(" ") + 1;

  return (
    <h1 className="typewriter" aria-label={words.join(", ")}>
      <span aria-hidden="true">{typed.slice(0, split)}</span>
      <span aria-hidden="true" className="accent">{typed.slice(split)}</span>
      <span className="caret" aria-hidden="true" />
    </h1>
  );
}
