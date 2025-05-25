"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Unexpected error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loading]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log("Starting signup process for:", email);

      // First, try to sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error("Supabase signup error:", error);
        return { error, data: null };
      }

      console.log("Signup successful:", data);

      // If signup was successful but user needs email confirmation
      if (data.user && !data.session) {
        console.log("User created, email confirmation required");
        return { error: null, data };
      }

      // If signup was successful and user is immediately signed in
      if (data.user && data.session) {
        console.log("User created and signed in immediately");
        return { error: null, data };
      }

      return { error: null, data };
    } catch (error) {
      console.error("Unexpected signup error:", error);
      return {
        error: {
          message:
            "An unexpected error occurred during signup. Please try again.",
        },
        data: null,
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Signin error:", error);
      }

      return { error };
    } catch (error) {
      console.error("Unexpected signin error:", error);
      return {
        error: { message: "An unexpected error occurred during signin" },
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Signout error:", error);
      }
    } catch (error) {
      console.error("Unexpected signout error:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      });
      return { error };
    } catch (error) {
      console.error("Unexpected reset password error:", error);
      return {
        error: {
          message: "An unexpected error occurred during password reset",
        },
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
