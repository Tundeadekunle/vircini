"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  bio: any;
  avatar: string;
  id: string;
  username: string;
  email: string;
}

const UserContext = createContext<User | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Try to get user from localStorage/session (for demo)
    const stored = localStorage.getItem("vircini_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
