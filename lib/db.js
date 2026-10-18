import { MongoClient, ObjectId } from "mongodb";

let clientPromise = global._mongo;

export async function getDb() {
  if (!clientPromise) {
    // "MONGODB_URI=MONGODB_URI=..." гэж давхар хуулсан тохиолдлыг ч зөв уншина
    const uri = process.env.MONGODB_URI?.trim().replace(/^MONGODB_URI=/, "");
    if (!uri?.startsWith("mongodb")) throw new Error("MONGODB_URI буруу эсвэл тохируулаагүй байна (.env.local)");
    clientPromise = global._mongo = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 }).connect().catch((e) => {
      clientPromise = global._mongo = null; // дараагийн хүсэлт дахин холбогдохыг оролдоно
      throw e;
    });
  }
  return (await clientPromise).db();
}

export const toId = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);

// MongoDB баримтыг client руу дамжуулахад тохиромжтой болгоно
export const plain = ({ _id, ...rest }) => ({ _id: _id.toString(), ...rest });

export async function list(name) {
  const db = await getDb();
  const docs = await db.collection(name).find().sort({ order: 1, createdAt: -1 }).toArray();
  return docs.map(plain);
}
