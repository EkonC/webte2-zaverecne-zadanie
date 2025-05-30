"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  History,
  Home,
  Menu,
  BookOpen,
  LogOut,
  User,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";

export function DashboardHeader() {
  const { t } = useTranslation("common");
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const role = user?.role ?? null;

  const isAdmin = role === "admin";

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("buttons.toggleMenu")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  {t("nav.dashboard")}
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/history">
                    <History className="mr-2 h-4 w-4" />
                    {t("nav.history")}
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/guide">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {t("nav.guide")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="font-bold text-xl hidden sm:inline-block">
              {t("app.name")}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t("nav.dashboard")}
            </Link>
            {isAdmin && (
              <Link
                href="/history"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/history") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {t("nav.history")}
              </Link>
            )}
            <Link
              href="/guide"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/guide") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t("nav.guide")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">{t("nav.menu")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => router.push("/login")}
          >
            <User className="h-5 w-5" />
            <span className="sr-only">{t("nav.menu")}</span>
          </Button>
        )}
        </div>
      </div>
    </header>
  );
}
