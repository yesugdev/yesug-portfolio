# Portfolio (Next.js + MongoDB)

## Ажиллуулах

```bash
npm install     # анх удаа
npm run dev     # MongoDB-г автоматаар асааж, сайтыг ажиллуулна
```

- Сайт: http://localhost:3000
- Admin: http://localhost:3000/admin (нууц үг `.env.local` дахь `ADMIN_PASSWORD`)

Жишээ өгөгдөл нэмэх бол: `npm run seed`. MongoDB-г зогсоох бол: `npm run db:stop`.

## Admin хэсэгт юу засах вэ

| Таб | Агуулга |
|---|---|
| Профайл | Нэр, мэргэжил, bio, миний тухай, зураг, CV, холбоосууд, ур чадвар |
| Төслүүд | Нэмэх / засах / устгах, онцлох, эрэмбэ |
| Ажлын туршлага | Албан тушаал, байгууллага, хугацаа, хийсэн ажил |
| Боловсрол | Сургууль, мэргэжил, хугацаа |
| Мессеж | Холбоо барих формоос ирсэн мессежүүд |

Зураг, CV-гээ admin хэсэгт дарж эсвэл чирж оруулна (MongoDB-д хадгалагдана, 4MB хүртэл).

## Интернэтэд байршуулах (Vercel)

1. MongoDB Atlas дээр үнэгүй cluster үүсгэж холбоосоо авна (Network Access → `0.0.0.0/0`).
2. Кодоо GitHub руу push хийгээд vercel.com дээр import хийнэ.
3. Environment Variables: `MONGODB_URI`, `ADMIN_PASSWORD`, `SITE_URL`.

## Бүтэц

- `lib/schema.js` — admin хэсгийн талбарууд (шинэ талбар энд нэмнэ)
- `app/page.js` — нүүр хуудас
- `app/admin/` — удирдлага
- `app/globals.css` — загвар (өнгө файлын эхэнд)
- `scripts/run.mjs` — ажиллуулах скрипт
# yesug-portfolio
