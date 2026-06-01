"use client";

import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthState {
  user: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Token'ı yenile ve custom claim'leri al
        const tokenResult = await user.getIdTokenResult(true);
        const isAdmin = tokenResult.claims.role === "admin";
        setState({ user, isAdmin, loading: false });
      } else {
        setState({ user: null, isAdmin: false, loading: false });
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string, rememberMe = true) => {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Admin mi kontrol et
    const tokenResult = await cred.user.getIdTokenResult(true);
    if (tokenResult.claims.role !== "admin") {
      await firebaseSignOut(auth);
      throw new Error("Bu hesabın admin yetkisi yok.");
    }
    return cred.user;
  };

  const signOut = () => firebaseSignOut(auth);

  return { ...state, signIn, signOut };
}
