"use client";

import Link from "next/link";
import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <FileX className="h-24 w-24 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-bold mb-2">{t("errors.notFound")}</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        {t("errors.notFoundDesc")}
      </p>
      <Button asChild>
        <Link href="/public">{t("errors.backHome")}</Link>
      </Button>
    </div>
  );
}
