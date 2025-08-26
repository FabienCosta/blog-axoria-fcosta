"use client";
import React, { useRef } from "react";
import { login } from "@/lib/serverAction/session/sessionServerActions";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/authContext";

export default function Page() {
  const { setIsAuthenticated } = useAuth();
  const serverInfoRef = useRef();
  const submitButtonRef = useRef();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();

    serverInfoRef.current.textContent = "";
    submitButtonRef.current.disabled = true;

    try {
      const result = await login(new FormData(e.target));

      if (result.success) {
        setIsAuthenticated({
          loading: false,
          isConnected: true,
          userId: result.userId,
        });
        router.push("/");
      }
    } catch (error) {
      console.error("Error during login", error);
      submitButtonRef.current.disabled = false;
      serverInfoRef.current.textContent = error.message;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-36">
      <label htmlFor="userName" className="f-label">
        Your pseudo
      </label>
      <input
        type="text"
        className="f-auth-input"
        id="userName"
        name="userName"
        required
        placeholder="Your pseudo"
      />

      <label htmlFor="password" className="f-label">
        Your password
      </label>
      <input
        type="password"
        className="f-auth-input"
        id="password"
        name="password"
        required
        placeholder="Your password"
      />

      <button
        ref={submitButtonRef}
        className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold
       py-3 px-4 mt-6 mb-10 rounded border-none"
      >
        Submit
      </button>
      <p ref={serverInfoRef} className="hidden text-center mb-10"></p>
    </form>
  );
}
