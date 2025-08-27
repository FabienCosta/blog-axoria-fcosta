// import mongoose from "mongoose";

// export async function connectToDB() {
//   if (mongoose.connection.readyState) {
//     return;
//   }
//   try {
//     await mongoose.connect(process.env.MONGO);
//     console.log("Connected to database:", mongoose.connection.name);
//   } catch (err) {
//     throw new Error("Failed to connect to the Database");
//   }
// }

import mongoose from "mongoose";

let isConnected = false;

export async function connectToDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO, {
      dbName: "axoriablogeducation",
    });
    isConnected = true;
    console.log("✅ Connected to database:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ Failed to connect to the Database:", err);
    throw err; // permet de voir l’erreur exacte dans les logs Vercel
  }
}
