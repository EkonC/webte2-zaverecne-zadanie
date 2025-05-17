"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
// import { ThemeSwitcher } from "@/components/theme-switcher"; // Assuming these are present elsewhere
// import LanguageSwitcher from "@/components/language-switcher"; // Assuming these are present elsewhere

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuthPage() {
  const { t } = useTranslation("common");
  const router = useRouter(); // Initialize router

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    const formData = new URLSearchParams();
    formData.append("username", loginEmail); // FastAPI's OAuth2PasswordRequestForm uses 'username'
    formData.append("password", loginPassword);

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
        setLoginError(data.detail || "Login failed. Please check your credentials.");
      } else {
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("tokenType", data.token_type);
        router.push("/"); // Redirect to dashboard or home page
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setRegisterError(null);
    setRegisterSuccess(null);

    // Note: The backend UserCreate schema must support `full_name` or similar for the name to be used.
    // If your UserCreate schema only has email and password, the `full_name` field will be ignored by Pydantic
    // or might cause an error if it's not defined as an optional field in UserCreate.
    const payload = {
      email: registerEmail,
      password: registerPassword,
      full_name: registerName, // Or 'name', depending on your backend UserCreate schema
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
        setRegisterError(data.detail || "Registration failed. Please try again.");
      } else {
        setRegisterSuccess("Registration successful! You can now log in.");
        // Clear form
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
        // Optionally switch to login tab
        setActiveTab("login"); 
      }
    } catch (error) {
      console.error("Registration error:", error);
      setRegisterError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex max-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
            <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
          </TabsList>

          <Card className="w-full">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {t("auth.title")}
              </CardTitle>
              <CardDescription>{t("auth.subtitle")}</CardDescription>
            </CardHeader>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  {loginError && (
                    <p className="text-sm text-red-500 text-center">{loginError}</p>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t("auth.email")}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">
                        {t("auth.password")}
                      </Label>
                      <a
                        href="#" //TODO: Add forgot password link
                        className="text-sm text-primary hover:underline"
                        onClick={(e) => {
                            e.preventDefault();
                            alert("Forgot password functionality not yet implemented.");
                        }}
                      >
                        {t("auth.forgotPassword")}
                      </a>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? t("auth.loggingIn", "Logging in...")
                      : t("auth.login", "Login")}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4 pt-4">
                  {registerError && (
                    <p className="text-sm text-red-500 text-center">{registerError}</p>
                  )}
                  {registerSuccess && (
                    <p className="text-sm text-green-500 text-center">{registerSuccess}</p>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="register-name">{t("auth.name")}</Label>
                    <Input
                      id="register-name"
                      placeholder={t("auth.namePlaceholder")}
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">{t("auth.email")}</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">
                      {t("auth.password")}
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? t("auth.creatingAccount", "Creating account...")
                      : t("auth.createAccount", "Create account")}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}