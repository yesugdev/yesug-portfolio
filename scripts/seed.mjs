// npm run seed: хоосон хэсгүүдэд жишээ өгөгдөл нэмнэ (байгаа өгөгдлийг өөрчлөхгүй)
import { MongoClient } from "mongodb";
import { readFileSync } from "node:fs";

const uri = readFileSync(".env.local", "utf8").match(/^MONGODB_URI=(.*)$/m)?.[1].trim().replace(/^MONGODB_URI=/, "");
const client = await new MongoClient(uri).connect();
const db = client.db();
const now = new Date();

const samples = {
  projects: [
    { title: "Portfolio вэбсайт", description: "Next.js болон MongoDB дээр бүтээсэн, admin хэсгээс удирддаг хувийн сайт.", tech: ["Next.js", "MongoDB"], link: "", github: "", image: "", featured: true, order: 0 },
  ],
  experience: [
    { role: "Frontend Developer", company: "Компанийн нэр", period: "2024 – Одоо", location: "Улаанбаатар", description: "- Хэрэглэгчийн интерфэйс хөгжүүлсэн\n- Хуудас ачаалах хурдыг 40% сайжруулсан", order: 0 },
  ],
  education: [
    { degree: "Програм хангамжийн инженер, бакалавр", school: "Их сургуулийн нэр", period: "2020 – 2024", description: "", order: 0 },
  ],
};

for (const [name, docs] of Object.entries(samples)) {
  if (await db.collection(name).countDocuments()) console.log(`- ${name}: өгөгдөл байгаа тул алгаслаа`);
  else {
    await db.collection(name).insertMany(docs.map((d) => ({ ...d, createdAt: now })));
    console.log(`+ ${name}: ${docs.length} жишээ нэмлээ`);
  }
}
await client.close();
