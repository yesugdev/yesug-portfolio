import { list } from "@/lib/db";
import { getProfile } from "@/lib/profile";
import ContactForm from "./contact-form";
import Typewriter from "./typewriter";
import Header from "./header";
import { Pin, Mail, Phone, Code, Link, File } from "./icons";

export const dynamic = "force-dynamic";

const safeList = (name) => list(name).catch(() => []);

const ext = { target: "_blank", rel: "noreferrer" };

export default async function Home() {
  const [site, projects, experience, education] = await Promise.all([
    getProfile(),
    safeList("projects"),
    safeList("experience"),
    safeList("education"),
  ]);
  projects.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  const nav = [
    [site.aboutLong ? "/about" : "#about", "Миний тухай"],
    projects.length && ["#projects", "Төслүүд"],
    experience.length && ["#experience", "Туршлага"],
    education.length && ["#education", "Боловсрол"],
    ["#contact", "Холбоо барих"],
  ].filter(Boolean);

  return (
    <>
      <Header name={site.name} nav={nav} />

      <div className="page">
        <aside className="sidebar intro">
          {site.avatar ? (
            <img className="avatar" src={site.avatar} alt={site.name} />
          ) : (
            <div className="avatar avatar-fallback">{site.name?.[0]}</div>
          )}
          <div>
            <h3 className="author-name">{site.name}</h3>
            {site.bio && <p className="author-bio">{site.bio}</p>}
            {site.available && <p className="badge">Ажлын санал хүлээн авч байна</p>}
          </div>
          <ul className="author-links">
            {site.location && <li><Pin />{site.location}</li>}
            {site.email && <li><a href={`mailto:${site.email}`}><Mail />Email</a></li>}
            {site.phone && <li><a href={`tel:${site.phone}`}><Phone />{site.phone}</a></li>}
            {site.github && <li><a href={site.github} {...ext}><Code />GitHub</a></li>}
            {site.linkedin && <li><a href={site.linkedin} {...ext}><Link />LinkedIn</a></li>}
            {site.resume && <li><a href={site.resume} {...ext}><File />CV татах</a></li>}
          </ul>
        </aside>

        <main className="content">
          <section id="about" className="intro">
            <Typewriter text={site.role || ""} />
            <div className="prose">{site.about}</div>
            {site.aboutLong && <a className="more" href="/about">Дэлгэрэнгүй →</a>}
            {site.skills?.length > 0 && (
              <>
                <h2>Ур чадвар</h2>
                <ul className="tags">{site.skills.map((s) => <li key={s}>{s}</li>)}</ul>
              </>
            )}
            <div className="actions">
              <a className="btn" href="#contact">Холбогдох</a>
              {site.resume && <a className="btn btn-outline" href={site.resume} {...ext}>CV татах</a>}
            </div>
          </section>

          {projects.length > 0 && (
            <section id="projects" data-reveal>
              <h2>Төслүүд</h2>
              <div className="projects">
                {projects.map((p) => (
                  <article key={p._id} className={p.featured ? "project featured" : "project"} data-reveal>
                    {p.image && <div className="project-img"><img src={p.image} alt={p.title} loading="lazy" /></div>}
                    <div>
                      <h3>
                        {p.link ? <a href={p.link} {...ext}>{p.title}</a> : p.title}
                        {p.featured && <span className="pill">Онцлох</span>}
                      </h3>
                      {p.description && <div className="prose">{p.description}</div>}
                      {p.tech?.length > 0 && <p className="muted small">{p.tech.join(" · ")}</p>}
                      {(p.link || p.github) && (
                        <p className="small project-links">
                          {p.link && <a href={p.link} {...ext}>Demo ↗</a>}
                          {p.github && <a href={p.github} {...ext}>Source ↗</a>}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {experience.length > 0 && (
            <section id="experience" data-reveal>
              <h2>Ажлын туршлага</h2>
              <Timeline items={experience.map((e) => ({ ...e, title: e.role, sub: e.company }))} />
            </section>
          )}

          {education.length > 0 && (
            <section id="education" data-reveal>
              <h2>Боловсрол</h2>
              <Timeline items={education.map((e) => ({ ...e, title: e.degree, sub: e.school }))} />
            </section>
          )}

          <section id="contact" data-reveal>
            <h2>Холбоо барих</h2>
            <p>
              Хамтран ажиллах санал, асуулт байвал доорх формоор
              {site.email && <> эсвэл <a href={`mailto:${site.email}`}>{site.email}</a> хаягаар</>} холбогдоорой.
            </p>
            <ContactForm />
          </section>

          <footer className="footer">© {new Date().getFullYear()} {site.name}</footer>
        </main>
      </div>
    </>
  );
}

function Timeline({ items }) {
  return (
    <ol className="timeline">
      {items.map((i) => (
        <li key={i._id} data-reveal>
          <div className="timeline-head">
            <h3>{i.title}<span className="muted"> · {i.sub}</span></h3>
            <span className="muted small">{[i.period, i.location].filter(Boolean).join(" · ")}</span>
          </div>
          {i.description && <div className="prose">{i.description}</div>}
        </li>
      ))}
    </ol>
  );
}
