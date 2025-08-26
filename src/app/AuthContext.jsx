"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { SAsessionInfo } from "@/lib/serverAction/session/sessionServerActions";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState({
    loading: true,
    isConnected: false,
    userId: null,
  });

  useEffect(() => {
    async function fetchSession() {
      const session = await SAsessionInfo();
      setIsAuthenticated({
        loading: false,
        isConnected: session.success,
        userId: session.userId,
      });
    }
  }, []);
}
