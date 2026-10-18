"use client";
import { useMemo, useState } from "react";

const STEP = 6;
const ext = { target: "_blank", rel: "noreferrer" };

// Технологиор шүүх + "Цааш үзэх". Онцлох төслүүд том картаар, бусад нь grid-ээр.
export default function Projects({ items }) {
  const [filter, setFilter] = useState(null);
  const [limit, setLimit] = useState(STEP);

  // Хамгийн олон хэрэглэгдсэн технологиуд
  const tags = useMemo(() => {
    const count = {};
    items.forEach((p) => p.tech?.forEach((t) => (count[t] = (count[t] || 0) + 1)));
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [items]);

  const matched = filter ? items.filter((p) => p.tech?.includes(filter)) : items;
  const featured = filter ? [] : matched.filter((p) => p.featured);
  const rest = filter ? matched : matched.filter((p) => !p.featured);
  const shown = rest.slice(0, limit);

  function choose(t) {
    setFilter(t === filter ? null : t);
    setLimit(STEP);
  }

  return (
    <>
      {tags.length > 1 && items.length > 3 && (
        <div className="filters" role="group" aria-label="Технологиор шүүх">
          <button className={!filter ? "active" : ""} onClick={() => choose(null)}>
            Бүгд <span>{items.length}</span>
          </button>
          {tags.map(([t, n]) => (
            <button key={t} className={filter === t ? "active" : ""} onClick={() => choose(t)}>
              {t} <span>{n}</span>
            </button>
          ))}
        </div>
      )}

      {featured.length > 0 && (
        <div className="projects">
          {featured.map((p) => <Card key={p._id} p={p} wide />)}
        </div>
      )}

      {shown.length > 0 && (
        <div className="project-grid" key={filter || "all"}>
          {shown.map((p, i) => (
            <Card key={p._id} p={p} delay={(i % STEP) * 60} />
          ))}
        </div>
      )}

      {rest.length > limit && (
        <div className="more-wrap">
          <button className="btn btn-outline" onClick={() => setLimit(limit + STEP)}>
            Цааш үзэх <span className="muted">({rest.length - limit})</span>
          </button>
        </div>
      )}
    </>
  );
}

function Card({ p, wide, delay = 0 }) {
  return (
    <article className={wide ? "project featured" : "card-sm appear"} style={delay ? { animationDelay: `${delay}ms` } : undefined}>
      {p.image && (
        <div className="project-img">
          <img src={p.image} alt={p.title} loading="lazy" />
        </div>
      )}
      <div className="card-body">
        <h3>
          {p.link ? <a href={p.link} {...ext}>{p.title}</a> : p.title}
          {p.featured && <span className="pill">Онцлох</span>}
        </h3>
        {p.description && <div className={wide ? "prose" : "prose clamp"}>{p.description}</div>}
        {p.tech?.length > 0 && <p className="muted small">{p.tech.join(" · ")}</p>}
        {(p.link || p.github) && (
          <p className="small project-links">
            {p.link && <a href={p.link} {...ext}>Demo ↗</a>}
            {p.github && <a href={p.github} {...ext}>Source ↗</a>}
          </p>
        )}
      </div>
    </article>
  );
}
