// Admin-аас удирдах хэсгүүд. Талбар нэмэх бол энд нэмэхэд хангалттай.
// type: text | textarea | url | upload (файл, MongoDB-д хадгална) | list (таслалаар) | bool | number
export const collections = {
  projects: {
    label: "Төслүүд",
    title: "title",
    subtitle: "tech",
    fields: [
      { key: "title", label: "Гарчиг", required: true },
      { key: "description", label: "Тайлбар", type: "textarea" },
      { key: "tech", label: "Технологи (таслалаар: Next.js, MongoDB)", type: "list" },
      { key: "link", label: "Demo холбоос", type: "url" },
      { key: "github", label: "Source код холбоос", type: "url" },
      { key: "image", label: "Зураг", type: "upload", accept: "image/*" },
      { key: "featured", label: "Онцлох төсөл", type: "bool" },
      { key: "order", label: "Эрэмбэ (бага нь эхэнд)", type: "number" },
    ],
  },
  experience: {
    label: "Ажлын туршлага",
    title: "role",
    subtitle: "company",
    fields: [
      { key: "role", label: "Албан тушаал", required: true },
      { key: "company", label: "Байгууллага", required: true },
      { key: "period", label: "Хугацаа (2023 – Одоо)" },
      { key: "location", label: "Байршил" },
      { key: "description", label: "Хийсэн ажил, үр дүн", type: "textarea" },
      { key: "order", label: "Эрэмбэ (бага нь эхэнд)", type: "number" },
    ],
  },
  education: {
    label: "Боловсрол",
    title: "degree",
    subtitle: "school",
    fields: [
      { key: "degree", label: "Мэргэжил / Зэрэг", required: true },
      { key: "school", label: "Сургууль", required: true },
      { key: "period", label: "Хугацаа (2019 – 2023)" },
      { key: "description", label: "Нэмэлт мэдээлэл", type: "textarea" },
      { key: "order", label: "Эрэмбэ (бага нь эхэнд)", type: "number" },
    ],
  },
};

export const profileSchema = [
  { key: "name", label: "Нэр", required: true },
  { key: "role", label: "Мэргэжил (таслалаар бичвэл ээлжилж бичигдэнэ: Full-Stack Developer, UI Designer)" },
  { key: "bio", label: "Богино bio (sidebar дээр)" },
  { key: "about", label: "Миний тухай (товч, нүүр хуудсанд)", type: "textarea" },
  { key: "aboutLong", label: "Дэлгэрэнгүй танилцуулга (бөглөвөл /about хуудас үүснэ)", type: "textarea" },
  { key: "aboutImage", label: "Дэлгэрэнгүй хуудасны зураг (хоосон бол профайл зураг)", type: "upload", accept: "image/*" },
  { key: "avatar", label: "Профайл зураг", type: "upload", accept: "image/*" },
  { key: "resume", label: "CV (PDF)", type: "upload", accept: "application/pdf" },
  { key: "location", label: "Байршил" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Утас" },
  { key: "github", label: "GitHub", type: "url" },
  { key: "linkedin", label: "LinkedIn", type: "url" },
  { key: "available", label: "Ажлын санал хүлээн авч байгаа", type: "bool" },
  { key: "skills", label: "Ур чадвар (таслалаар)", type: "list" },
];

// Формын өгөгдлийг схемийн дагуу цэвэрлэнэ. Алдаа байвал { error } буцаана.
export function clean(fields, body) {
  const doc = {};
  for (const f of fields) {
    const v = body[f.key];
    if (f.type === "list") doc[f.key] = (Array.isArray(v) ? v.join(",") : v || "").split(",").map((s) => s.trim()).filter(Boolean);
    else if (f.type === "bool") doc[f.key] = Boolean(v);
    else if (f.type === "number") doc[f.key] = Number(v) || 0;
    else doc[f.key] = String(v ?? "").trim().slice(0, f.type === "textarea" ? 5000 : 500);

    if ((f.type === "url" || f.type === "upload") && doc[f.key] && !/^(https?:\/\/|\/)/.test(doc[f.key]))
      return { error: `${f.label}: http(s):// эсвэл / -ээр эхлэх ёстой` };
    if (f.required && !doc[f.key]) return { error: `${f.label} шаардлагатай` };
  }
  return { doc };
}
