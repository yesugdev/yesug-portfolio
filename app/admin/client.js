"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collections, profileSchema } from "@/lib/schema";

async function api(url, method = "GET", body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body && JSON.stringify(body),
  }).catch(() => null);
  const data = await res?.json().catch(() => null);
  if (!res?.ok) throw new Error(data?.error || "Сервертэй холбогдож чадсангүй");
  return data;
}

export function Login() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      await api("/api/auth", "POST", { password: e.target.password.value });
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit} className="form narrow">
      <h1>Admin</h1>
      <input name="password" type="password" placeholder="Нууц үг" required autoFocus />
      {error && <p className="error">{error}</p>}
      <button className="btn">Нэвтрэх</button>
    </form>
  );
}

const tabs = [["profile", "Профайл"], ...Object.entries(collections).map(([k, c]) => [k, c.label]), ["messages", "Мессеж"]];

export function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("profile");

  async function logout() {
    await api("/api/auth", "DELETE");
    router.refresh();
  }

  return (
    <>
      <div className="admin-head">
        <h1>Удирдлага</h1>
        <div className="links">
          <a href="/" target="_blank">Сайт үзэх ↗</a>
          <button className="btn-link" onClick={logout}>Гарах</button>
        </div>
      </div>
      <nav className="tabs">
        {tabs.map(([k, label]) => (
          <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>{label}</button>
        ))}
      </nav>
      {tab === "profile" && <ProfileForm />}
      {collections[tab] && <Collection key={tab} name={tab} />}
      {tab === "messages" && <Messages />}
    </>
  );
}

// Схемээс формын талбар үүсгэнэ
function Fields({ fields, form, setForm }) {
  return fields.map((f) => {
    const v = form[f.key];
    const onChange = (e) => setForm({ ...form, [f.key]: f.type === "bool" ? e.target.checked : e.target.value });
    const label = f.label + (f.required ? " *" : "");
    if (f.type === "upload")
      return <Upload key={f.key} field={f} value={v} onChange={(url) => setForm({ ...form, [f.key]: url })} />;
    if (f.type === "bool")
      return <label key={f.key} className="check"><input type="checkbox" checked={Boolean(v)} onChange={onChange} />{f.label}</label>;
    return (
      <label key={f.key} className="field">
        <span>{label}</span>
        {f.type === "textarea" ? (
          <textarea rows={4} value={v ?? ""} onChange={onChange} required={f.required} />
        ) : (
          <input type={f.type === "number" ? "number" : "text"} value={Array.isArray(v) ? v.join(", ") : v ?? ""} onChange={onChange} required={f.required} />
        )}
      </label>
    );
  });
}

// Дарж эсвэл чирж файл оруулна
function Upload({ field, value, onChange }) {
  const [drag, setDrag] = useState(false);
  const [status, setStatus] = useState({});
  const isImage = field.accept?.startsWith("image");

  async function upload(file) {
    if (!file) return;
    setStatus({ loading: true });
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/files", { method: "POST", body }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok) {
      onChange(data.url);
      setStatus({});
    } else setStatus({ error: data?.error || "Оруулж чадсангүй" });
  }

  function drop(e) {
    e.preventDefault();
    setDrag(false);
    upload(e.dataTransfer.files[0]);
  }

  return (
    <div className="field">
      <span>{field.label}</span>
      <label
        className={`dropzone${drag ? " drag" : ""}`}
        onDragOver={(e) => (e.preventDefault(), setDrag(true))}
        onDragLeave={() => setDrag(false)}
        onDrop={drop}
      >
        <input type="file" accept={field.accept} hidden onChange={(e) => upload(e.target.files[0])} />
        {value && isImage && <img src={value} alt="" />}
        <span>
          {status.loading ? "Оруулж байна..." : value ? "Солих: дарж эсвэл чирж оруулна" : "Дарж сонгох эсвэл энд чирж оруулах"}
          <small>{isImage ? "JPG, PNG, WEBP, GIF" : "PDF"} · 4MB хүртэл</small>
        </span>
      </label>
      {value && (
        <div className="upload-meta">
          <a href={value} target="_blank">{isImage ? "Зураг харах ↗" : "Файл харах ↗"}</a>
          <button type="button" className="btn-danger" onClick={() => onChange("")}>Арилгах</button>
        </div>
      )}
      {status.error && <p className="error">{status.error}</p>}
    </div>
  );
}

function ProfileForm() {
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState({});

  useEffect(() => {
    api("/api/profile").then(setForm).catch((e) => setMsg({ error: e.message }));
  }, []);

  async function save(e) {
    e.preventDefault();
    try {
      await api("/api/profile", "PUT", form);
      setMsg({ ok: "Хадгалагдлаа" });
    } catch (err) {
      setMsg({ error: err.message });
    }
  }

  if (!form) return msg.error ? <p className="error">{msg.error}</p> : <p className="muted">Ачаалж байна...</p>;
  return (
    <form onSubmit={save} className="form">
      <Fields fields={profileSchema} form={form} setForm={setForm} />
      {msg.ok && <p className="success">{msg.ok}</p>}
      {msg.error && <p className="error">{msg.error}</p>}
      <button className="btn">Хадгалах</button>
    </form>
  );
}

function Collection({ name }) {
  const { fields, title, subtitle, label } = collections[name];
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api(`/api/c/${name}`).then(setItems).catch((e) => setError(e.message));
  }, [name]);

  function reset() {
    setForm({});
    setEditing(null);
    setError("");
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        const doc = await api(`/api/c/${name}/${editing}`, "PUT", form);
        setItems(items.map((i) => (i._id === editing ? doc : i)));
      } else {
        const doc = await api(`/api/c/${name}`, "POST", form);
        setItems([...items, doc]);
      }
      reset();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Устгах уу?")) return;
    try {
      await api(`/api/c/${name}/${id}`, "DELETE");
      setItems(items.filter((i) => i._id !== id));
      if (editing === id) reset();
    } catch (err) {
      setError(err.message);
    }
  }

  function edit(item) {
    setForm(item);
    setEditing(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const sub = (i) => (Array.isArray(i[subtitle]) ? i[subtitle].join(", ") : i[subtitle]);

  return (
    <>
      <form onSubmit={save} className="form">
        <h2>{editing ? "Засах" : `Шинэ: ${label}`}</h2>
        <Fields fields={fields} form={form} setForm={setForm} />
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button className="btn" disabled={saving}>{saving ? "Хадгалж байна..." : editing ? "Хадгалах" : "Нэмэх"}</button>
          {editing && <button type="button" className="btn btn-outline" onClick={reset}>Болих</button>}
        </div>
      </form>

      <h2>Одоо байгаа ({items.length})</h2>
      {items.length === 0 ? (
        <p className="muted">Хоосон байна.</p>
      ) : (
        <ul className="list">
          {items.map((i) => (
            <li key={i._id} className={editing === i._id ? "editing" : ""}>
              <div>
                <strong>{i[title]}</strong>
                {i.featured && <span className="pill">Онцлох</span>}
                <p className="muted">{sub(i)}</p>
              </div>
              <div className="row-actions">
                <button className="btn-link" onClick={() => edit(i)}>Засах</button>
                <button className="btn-danger" onClick={() => remove(i._id)}>Устгах</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Messages() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/messages")
      .then((d) => setItems(d.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch((e) => setError(e.message));
  }, []);

  async function remove(id) {
    if (!confirm("Устгах уу?")) return;
    await api(`/api/messages/${id}`, "DELETE");
    setItems(items.filter((i) => i._id !== id));
  }

  if (error) return <p className="error">{error}</p>;
  if (!items) return <p className="muted">Ачаалж байна...</p>;
  if (!items.length) return <p className="muted">Мессеж ирээгүй байна.</p>;
  return (
    <ul className="list messages">
      {items.map((m) => (
        <li key={m._id}>
          <div>
            <strong>{m.name}</strong> <a className="muted" href={`mailto:${m.email}`}>{m.email}</a>
            <p className="muted small">{new Date(m.createdAt).toLocaleString()}</p>
            <p className="prose">{m.message}</p>
          </div>
          <button className="btn-danger" onClick={() => remove(m._id)}>Устгах</button>
        </li>
      ))}
    </ul>
  );
}
