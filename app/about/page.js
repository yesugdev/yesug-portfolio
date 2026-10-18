import { notFound } from "next/navigation";
import { getProfile } from "@/lib/profile";
import Header from "../header";
import { Pin, Mail, Phone, Code, Link, File } from "../icons";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const site = await getProfile();
  return { title: `Миний тухай — ${site.name}`, description: site.about };
}

const ext = { target: "_blank", rel: "noreferrer" };

export default async function About() {
  const site = await getProfile();
  if (!site.aboutLong) notFound();
  const photo = site.aboutImage || site.avatar;

  return (
    <>
      <Header name={site.name} nav={[["/", "Нүүр"], ["/#projects", "Төслүүд"], ["/#contact", "Холбоо барих"]]} />

      <main className="about-page">
        <div className="about-photo intro">
          {photo ? <img src={photo} alt={site.name} /> : <div className="avatar avatar-fallback">{site.name?.[0]}</div>}
        </div>

        <div className="about-body intro">
          <p className="muted">{site.role?.split(",")[0]}</p>
          <h1>{site.name}</h1>
          {site.available && <p className="badge">Ажлын санал хүлээн авч байна</p>}

          <div className="prose about-text">{site.aboutLong}</div>

          {site.skills?.length > 0 && (
            <>
              <h2>Ур чадвар</h2>
              <ul className="tags">{site.skills.map((s) => <li key={s}>{s}</li>)}</ul>
            </>
          )}

          <h2>Мэдээлэл</h2>
          <ul className="author-links info-list">
            {site.location && <li><Pin />{site.location}</li>}
            {site.email && <li><a href={`mailto:${site.email}`}><Mail />{site.email}</a></li>}
            {site.phone && <li><a href={`tel:${site.phone}`}><Phone />{site.phone}</a></li>}
            {site.github && <li><a href={site.github} {...ext}><Code />GitHub</a></li>}
            {site.linkedin && <li><a href={site.linkedin} {...ext}><Link />LinkedIn</a></li>}
            {site.resume && <li><a href={site.resume} {...ext}><File />CV татах</a></li>}
          </ul>

          <div className="actions">
            <a className="btn" href="/#contact">Холбогдох</a>
            <a className="btn btn-outline" href="/">← Нүүр хуудас</a>
          </div>
        </div>
      </main>
    </>
  );
}
