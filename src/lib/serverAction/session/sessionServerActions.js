"use server";
import { User } from "@/lib/models/user";
import { connectToDB } from "@/lib/utils/db/connectToDB";
import slugify from "slugify";
import bcrypt from "bcryptjs";
import { Session } from "@/lib/models/session";
import { cookies } from "next/headers";
import AppError from "@/lib/utils/errorHandling/customError";
import { revalidateTag } from "next/cache";

export async function register(formData) {
  const { userName, email, password, passwordRepeat } =
    Object.fromEntries(formData);

  try {
    if (typeof userName !== "string" || userName.trim().length < 3) {
      throw new AppError("Username must be at least 3 characters long.");
    }

    if (typeof password !== "string" || password.trim().length < 6) {
      throw new AppError("Password must be at least 6 characters long.");
    }

    if (password !== passwordRepeat) {
      throw new AppError("Password do not match");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
      throw new AppError("Invalid email format");
    }

    await connectToDB();

    const user = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (user) {
      throw new AppError(
        user.userName === userName
          ? "Username already exists"
          : "Email already exists"
      );
    }

    const normalizedUserName = slugify(userName, { lower: true, strict: true });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      userName,
      normalizedUserName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return { success: true };
  } catch (error) {
    console.error("Error while registering:", error);

    if (error instanceof AppError) {
      throw error;
    }
    throw new Error("An error occured while registering");
  }
}

export async function login(formData) {
  const { userName, password } = Object.fromEntries(formData);

  try {
    await connectToDB();

    const user = await User.findOne({ userName });

    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    let session;
    const existingSession = await Session.findOne({
      userId: user._id,
      expireAt: { $gt: new Date() },
    });

    if (existingSession) {
      session = existingSession;
      existingSession.expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await existingSession.save();
    } else {
      session = new Session({
        userId: user._id,
        expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await session.save();
    }

    const cookieStore = await cookies();
    cookieStore.set("sessionId", session._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "Lax",
    });

    revalidateTag("auth-session");
    return { success: true, userId: user._id.toString() };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error(error.message);
  }
}

export async function logOut() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  try {
    await Session.findByIdAndDelete(sessionId);

    cookieStore.set("sessionId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0, // supprime immédiatement le cookie
      sameSite: "strict",
    });
    revalidateTag("auth-session");
    return { success: true };
  } catch (error) {
    console.log(error);
  }
}

export async function isPrivatePage(pathname) {
  const privateSegments = ["/dashboard", "/settings/profile"];

  return privateSegments.some(
    (segment) => pathname === segment || pathname.startsWith(segment + "/")
  );
}

export async function SAsessionInfo() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  if (!sessionId) {
    return { success: false, userId: null };
  }

  await connectToDB();

  const session = await Session.findById(sessionId);

  if (!session || session.expiresAt < new Date()) {
    return { success: false, userId: null };
  }

  const user = await User.findById(session.userId);

  if (!user) {
    return { success: false, userId: null };
  }

  return { success: true, userId: user._id.toString() };
}
