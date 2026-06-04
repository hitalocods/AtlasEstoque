"use client";

import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getFirebaseAuth, hasFirebaseConfig } from "@/services/firebase";
import type { AppUser } from "@/types";

const demoUser: AppUser = {
  uid: "demo",
  email: "operacao@atlasestoque.local",
};

export function useAuth() {
  const firebaseEnabled = hasFirebaseConfig();
  const [user, setUser] = useState<AppUser | null>(() => {
    if (firebaseEnabled || typeof window === "undefined") return null;
    return window.localStorage.getItem("atlas-demo-auth") ? demoUser : null;
  });
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(
        firebaseUser
          ? { uid: firebaseUser.uid, email: firebaseUser.email }
          : null,
      );
      setLoading(false);
    });
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        window.localStorage.setItem("atlas-demo-auth", "true");
        setUser({ uid: "demo", email });
        toast.success("Entrada liberada em modo demonstração.");
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    window.localStorage.removeItem("atlas-demo-auth");
    setUser(null);
  }

  return { user, loading, login, logout, firebaseEnabled };
}
