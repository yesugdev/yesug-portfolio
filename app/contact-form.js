"use client";
import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState({});

  async function submit(e) {
    e.preventDefault();
    const form = e.target;
    setStatus({ sending: true });
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    }).catch(() => null);
    if (res?.ok) {
      form.reset();
      setStatus({ ok: "Баярлалаа! Мессеж тань илгээгдлээ." });
    } else {
      setStatus({ error: (await res?.json().catch(() => null))?.error || "Илгээж чадсангүй." });
    }
  }

  return (
    <form onSubmit={submit} className="form contact-form">
      <div className="row">
        <input name="name" placeholder="Нэр" required maxLength={100} />
        <input name="email" type="email" placeholder="Email" required maxLength={200} />
      </div>
      <textarea name="message" placeholder="Мессеж" rows={5} required maxLength={3000} />
      <input name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {status.ok && <p className="success">{status.ok}</p>}
      {status.error && <p className="error">{status.error}</p>}
      <button className="btn" disabled={status.sending}>{status.sending ? "Илгээж байна..." : "Илгээх"}</button>
    </form>
  );
}
