"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
  useRef, // Import useRef
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_RENEWAL_BUFFER_MS = 5 * 60 * 1000; // Renew 5 minutes before expiry

interface JwtPayload {
  sub: string;
  role?: string;
  exp: number; // Expiration time in seconds since epoch
  // iat?: number; // Issued at (optional, but often present)
  // nbf?: number; // Not before (optional, but often present)
}

interface User {
  token: string;
  tokenType: string;
  role: string | null;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  authSuccess: string | null;
  setAuthSuccess: (success: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function extractPayload(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    console.error("Failed to decode token");
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const router = useRouter();
  const renewalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearRenewalTimeout = useCallback(() => {
    if (renewalTimeoutRef.current) {
      clearTimeout(renewalTimeoutRef.current);
      renewalTimeoutRef.current = null;
    }
  }, []);

  // Logout function definition needs to be hoisted or defined before being used in renewToken or scheduleRenewal
  const performLogout = useCallback(() => {
    clearRenewalTimeout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenType");
    setUser(null);
    setAuthError(null);
    setAuthSuccess(null);
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        router.push("/login");
    }
  }, [router, clearRenewalTimeout]);


  const renewToken = useCallback(async () => {
    console.log("Attempting to renew token...");
    const currentToken = localStorage.getItem("accessToken");
    if (!currentToken) {
      console.log("No token to renew, logging out.");
      performLogout();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/renew`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Token renewal failed:", data.detail || "Unknown error");
        setAuthError(data.detail || "Session expired. Please log in again.");
        performLogout(); // Force logout if renewal fails
        throw new Error(data.detail || "Token renewal failed");
      } else {
        const payload = extractPayload(data.access_token);
        if (!payload) {
          console.error("Renewed token is invalid.");
          setAuthError("Received an invalid token upon renewal. Please log in again.");
          performLogout();
          return;
        }
        localStorage.setItem("accessToken", data.access_token);
        // Assuming token_type remains the same, or backend sends it
        localStorage.setItem("tokenType", data.token_type || "bearer"); 
        setUser({
          token: data.access_token,
          tokenType: data.token_type || "bearer",
          role: payload.role ?? null,
        });
        setAuthSuccess("Session renewed successfully.");
        console.log("Token renewed successfully.");
        // scheduleRenewal will be called by the useEffect watching `user`
      }
    } catch (error) {
      console.error("Error during token renewal:", error);
      setAuthError("Could not renew session. Please log in again.");
      performLogout();
    }
  }, [performLogout, setAuthError, setAuthSuccess]); // Added API_URL, performLogout

  const scheduleRenewal = useCallback((currentToken: string) => {
    clearRenewalTimeout();

    const payload = extractPayload(currentToken);
    if (!payload || !payload.exp) {
      console.error("Cannot schedule renewal: Invalid token or no expiration time.");
      // Potentially logout if token is invalid right away
      if (!payload) performLogout();
      return;
    }

    const expirationTimeMs = payload.exp * 1000;
    const currentTimeMs = Date.now();
    let timeUntilRenewal = expirationTimeMs - currentTimeMs - TOKEN_RENEWAL_BUFFER_MS;

    if (timeUntilRenewal <= 0) {
      // Token is already expired or very close to expiring, try to renew immediately
      // or if it's too old (e.g. beyond buffer into expiry), logout
      if (expirationTimeMs < currentTimeMs) {
          console.log("Token already expired. Logging out.");
          performLogout();
          return;
      }
      console.log("Token is about to expire or buffer time passed, renewing now.");
      renewToken(); // Attempt immediate renewal
      return;
    }

    console.log(`Scheduling token renewal in ${Math.round(timeUntilRenewal / 1000 / 60)} minutes.`);
    renewalTimeoutRef.current = setTimeout(renewToken, timeUntilRenewal);

  }, [clearRenewalTimeout, renewToken, performLogout]); // Added renewToken and performLogout

  useEffect(() => {
    // Check for token on initial load
    setIsLoadingAuth(true);
    const token = localStorage.getItem("accessToken");
    const tokenType = localStorage.getItem("tokenType");

    if (token && tokenType) {
      const payload = extractPayload(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({ token, tokenType, role: payload.role ?? null });
        // scheduleRenewal(token); // This will be handled by the effect below watching `user`
      } else {
        // Token is invalid or expired
        localStorage.removeItem("accessToken");
        localStorage.removeItem("tokenType");
        // User remains null
        if (payload) console.log("Token from localStorage is expired.");
      }
    }
    setIsLoadingAuth(false);
  }, []); // Removed scheduleRenewal as it will be caught by the next useEffect

  // Effect to schedule/clear renewal when user state changes
  useEffect(() => {
    if (user?.token) {
      scheduleRenewal(user.token);
    } else {
      clearRenewalTimeout();
    }
    // Cleanup function for when component unmounts or user changes
    return () => clearRenewalTimeout();
  }, [user, scheduleRenewal, clearRenewalTimeout]);


  const login = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      setAuthSuccess(null);
      setIsLoadingAuth(true); // Indicate loading during login

      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.detail || "Login failed.";
          setAuthError(errorMsg);
          throw new Error(errorMsg);
        } else {
          const payload = extractPayload(data.access_token);
          if (!payload) {
            setAuthError("Received an invalid token from server.");
            throw new Error("Invalid token received");
          }
          localStorage.setItem("accessToken", data.access_token);
          localStorage.setItem("tokenType", data.token_type);
          setUser({
            token: data.access_token,
            tokenType: data.token_type,
            role: payload.role ?? null,
          });
          // setAuthSuccess("Login successful!"); // Let scheduleRenewal handle its messages
          router.push("/");
        }
      } catch (error: any) {
        if (!authError) {
          const message = error.message || "Login error.";
          setAuthError(message);
        }
        // No re-throw needed if we handle loading state properly
      } finally {
        setIsLoadingAuth(false);
      }
    },
    [router, authError, API_URL] // Removed setAuthSuccess, scheduleRenewal from deps
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setAuthError(null);
      setAuthSuccess(null);
      // setIsLoadingAuth(true); // Optional: if register takes time

      const payload = { email, password, full_name: name };
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          const errorMsg = data.detail || "Registration failed.";
          setAuthError(errorMsg);
          throw new Error(errorMsg);
        } else {
          setAuthSuccess("Registration successful! You can now log in.");
        }
      } catch (error: any) {
        if (!authError) {
          const message = error.message || "Registration error.";
          setAuthError(message);
        }
        // No re-throw needed
      } finally {
        // setIsLoadingAuth(false);
      }
    },
    [authError, API_URL] // Removed setAuthSuccess
  );

  // Use the performLogout function for the context's logout
  const logout = performLogout;


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