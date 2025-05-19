"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/components/providers/auth-provider";

export default function AuthPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const {
    login,
    register,
    isLoadingAuth: isInitialAuthLoading, // Renamed for clarity
    user,
    setAuthError, // To clear global context errors
    setAuthSuccess,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false); // Local state for form submission

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null); // Form-specific error

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null); // Form-specific error
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null); // Form-specific success

  const passwordsMatch =
  registerPassword.length >= 8 &&
  registerPassword === registerPasswordConfirm;

  useEffect(() => {
    // If user is already authenticated (and initial check is done), redirect from login page
    if (user && !isInitialAuthLoading) {
      router.push("/");
    }
  }, [user, isInitialAuthLoading, router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);
    setAuthError(null); // Clear any global auth error from context

    try {
      await login(loginEmail, loginPassword);
      // Redirect on success is handled by the login function in AuthContext
    } catch (error: any) {
      setLoginError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setRegisterError(null);
    setRegisterSuccess(null);
    setAuthError(null); // Clear any global auth error
    setAuthSuccess(null); // Clear any global auth success

    try {
      await register(registerName, registerEmail, registerPassword);
      setRegisterSuccess("Registration successful! You can now log in.");
      // Clear form
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setActiveTab("login"); // Switch to login tab
    } catch (error: any) {
      setRegisterError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading during initial auth check, or if user exists (implies redirection is happening)
  if (isInitialAuthLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex max-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            // Clear form-specific messages and global context messages on tab change
            setLoginError(null);
            setRegisterError(null);
            setRegisterSuccess(null);
            setAuthError(null);
            setAuthSuccess(null);
          }}
          className="w-full"
        >
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
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">
                        {t("auth.password")}
                      </Label>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting
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
                    <Label htmlFor="register-email">{t("auth.email")}</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password-confirm">
                      {t("auth.passwordConfirm")}
                    </Label>
                    <Input
                      id="register-password-confirm"
                      type="password"
                      required
                      value={registerPasswordConfirm}          // ← use its own state
                      onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Show error only after the user has typed something */}
                  {registerPasswordConfirm && !passwordsMatch && (
                    <p className="text-sm text-red-500">
                      {t("auth.passwordsDontMatch")}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting
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