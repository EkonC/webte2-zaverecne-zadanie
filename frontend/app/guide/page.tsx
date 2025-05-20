"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { UserManual } from "@/components/user-manual";

export default function AuthPage() {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("guide.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("guide.subtitle")}</p>

        <div className="mt-12">
            <UserManual />
        </div>
    </main>
    </div>
  );
}