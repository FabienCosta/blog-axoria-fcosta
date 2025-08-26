import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expireAt: {
    type: Date,
    require: true,
    index: { expireAfterSeconds: 0 },
  },
});

export const Session =
  mongoose.models?.Session || mongoose.model("Session", sessionSchema);
