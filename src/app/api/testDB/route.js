// src/app/api/test-db/route.js
import { connectToDB } from "@/lib/utils/db/connectToDB";
import { Session } from "@/lib/models/session";

export async function GET() {
  try {
    await connectToDB();
    const sessionCount = await Session.countDocuments();
    return new Response(`✅ DB connectée, ${sessionCount} sessions trouvées`);
  } catch (err) {
    console.error(err);
    return new Response(`❌ Erreur DB: ${err.message}`, { status: 500 });
  }
}
