"use client";
import LanguageSwitcher from "@/components/language-switcher";
import { redirect } from "next/navigation";
//import { FileUpload } from "@/components/file-upload";
//import { FeatureGrid } from "@/components/feature-grid";
//import { DashboardHeader } from "@/components/dashboard-header";
import { useTranslation } from "react-i18next";

export default function Home() {
  // In a real app, you would check authentication status here
  // For demo purposes, we'll assume the user is authenticated
  const isAuthenticated = true;
  const { t, i18n } = useTranslation("common");

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* <DashboardHeader />*/}
      <main className="flex-1 container mx-auto px-4 py-8">
        <LanguageSwitcher />

        {/*<FileUpload />*/}

        <div>
          <h1>{t("welcomeMessage")}</h1>
          <p>{t("greeting", { name: "Používateľ" })}</p>{" "}
          {/* Príklad s interpoláciou */}
          <p>Toto je {t("homePage")}.</p>
          <p>Aktuálny jazyk z page.tsx: {i18n.language}</p>
        </div>
      </main>
    </div>
  );
}
