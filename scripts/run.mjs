// npm run dev / npm start: .env.local шалгаж, локал MongoDB-г асаагаад Next.js-ийг ажиллуулна.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";
import net from "node:net";

const mode = process.argv[2] || "dev";
const log = (m) => console.log(`\x1b[36m[portfolio]\x1b[0m ${m}`);
const fail = (m) => (console.error(`\x1b[31m[portfolio]\x1b[0m ${m}`), process.exit(1));

// 1. .env.local байхгүй бол үүсгэнэ
if (!existsSync(".env.local")) {
  const password = randomBytes(6).toString("hex");
  writeFileSync(".env.local", `MONGODB_URI=mongodb://127.0.0.1:27017/portfolio\nADMIN_PASSWORD=${password}\n`);
  log(`.env.local үүсгэлээ. Admin нууц үг: ${password}`);
}

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/))
    .filter(Boolean)
    .map(([, k, v]) => [k, v.trim().replace(/^["']|["']$/g, "")])
);
const uri = (env.MONGODB_URI || "").replace(/^MONGODB_URI=/, "");
if (!uri.startsWith("mongodb")) fail(".env.local дахь MONGODB_URI нь mongodb:// эсвэл mongodb+srv:// -ээр эхлэх ёстой");
if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD === "change-me") log("Анхаар: .env.local дахь ADMIN_PASSWORD-оо өөрчилнө үү");

// 2. Локал MongoDB бол ажиллаж байгаа эсэхийг шалгаж, асаана
const local = uri.match(/^mongodb:\/\/(?:[^@/]*@)?(localhost|127\.0\.0\.1)(?::(\d+))?/);
const isOpen = (port) =>
  new Promise((ok) => {
    const s = net.connect(port, "127.0.0.1", () => (s.end(), ok(true)));
    s.on("error", () => ok(false));
  });

if (local) {
  const port = Number(local[2] || 27017);
  if (await isOpen(port)) log(`MongoDB ажиллаж байна (port ${port})`);
  else {
    const dbpath = process.env.MONGO_DBPATH || join(homedir(), "mongo-data");
    mkdirSync(dbpath, { recursive: true });
    log(`MongoDB асааж байна (${dbpath})...`);
    const r = spawnSync("mongod", ["--dbpath", dbpath, "--port", String(port), "--bind_ip", "127.0.0.1", "--fork", "--logpath", join(dbpath, "mongod.log")], { stdio: "ignore" });
    if (r.error || r.status !== 0 || !(await isOpen(port)))
      fail(`MongoDB асаж чадсангүй. Лог: ${join(dbpath, "mongod.log")}\n  Эсвэл .env.local-д MongoDB Atlas холбоос тавина уу.`);
    log("MongoDB асав");
  }
} else log("Cloud MongoDB (Atlas) ашиглаж байна");

// 3. Next.js
if (mode === "start" && !existsSync(".next/BUILD_ID")) {
  log("Build хийж байна...");
  if (spawnSync("npx", ["next", "build"], { stdio: "inherit" }).status !== 0) process.exit(1);
}
const port = process.env.PORT || 3000;
log(`Сайт: http://localhost:${port}   Admin: http://localhost:${port}/admin`);
spawn("npx", ["next", mode, "-p", String(port)], { stdio: "inherit" }).on("exit", (c) => process.exit(c ?? 0));
