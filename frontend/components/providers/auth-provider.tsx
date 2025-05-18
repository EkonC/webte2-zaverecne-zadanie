"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface JwtPayload {
  sub: string;
  role?: string;
  exp: number;
}

interface User {
  token: string;
  tokenType: string;
  role: string | null;
  // You can add more user details here if fetched after login, e.g., email, name
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  isLoadingAuth: boolean; // True during initial token check from localStorage
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  authError: string | null; // Global auth error messages
  setAuthError: (error: string | null) => void;
  authSuccess: string | null; // Global auth success messages
  setAuthSuccess: (success: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function extractRole(token: string): string | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // For initial token check
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for token on initial load
    const token = localStorage.getItem("accessToken");
    const tokenType = localStorage.getItem("tokenType");
    if (token && tokenType) {
      setUser({ token, tokenType, role: extractRole(token) });
      // TODO: Optionally, verify the token with a backend endpoint here
    }
    setIsLoadingAuth(false); // Initial check is complete
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      setAuthSuccess(null);

      const formData = new URLSearchParams();
      formData.append("username", email); // FastAPI's OAuth2PasswordRequestForm uses 'username'
      formData.append("password", password);

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.detail || "Login failed. Please check your credentials.";
          setAuthError(errorMsg);
          throw new Error(errorMsg);
        } else {
          localStorage.setItem("accessToken", data.access_token);
          localStorage.setItem("tokenType", data.token_type);
          setUser({ token: data.access_token, tokenType: data.token_type, role: extractRole(data.access_token)});
          // setAuthSuccess("Login successful!"); // Success message can be handled by component or redirect
          router.push("/"); // Redirect to dashboard or home page
        }
      } catch (error: any) {
        // If authError wasn't set by !response.ok (e.g. network error)
        if (!authError) {
            const message = error.message || "An unexpected error occurred during login.";
            setAuthError(message);
        }
        throw error; // Re-throw for the component to handle UI updates (e.g., stop loading spinner)
      }
    },
    [router, authError] // authError dependency to avoid stale closure if setting it
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setAuthError(null);
      setAuthSuccess(null);

      const payload = {
        email: email,
        password: password,
        full_name: name,
      };

      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.detail || "Registration failed. Please try again.";
          setAuthError(errorMsg);
          throw new Error(errorMsg);
        } else {
          setAuthSuccess("Registration successful! You can now log in.");
          // Don't auto-login, let user go to login tab or component decides next step
        }
      } catch (error: any) {
        if (!authError) {
            const message = error.message || "An unexpected error occurred during registration.";
            setAuthError(message);
        }
        throw error;
      }
    },
    [authError]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenType");
    setUser(null);
    setAuthError(null);
    setAuthSuccess(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isLoadingAuth,
        login,
        register,
        logout,
        authError,
        setAuthError,
        authSuccess,
        setAuthSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};