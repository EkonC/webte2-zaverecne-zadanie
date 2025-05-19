"use client";

import { useTranslation } from "react-i18next";
import { PdfMergeTool } from "@/components/tools/pdf-merge-tool";

export default function MergePage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex max-h-screen flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">
          {t("tools.merge.pageTitle")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("tools.merge.pageSubtitle")}
        </p>

        <PdfMergeTool />
      </main>
    </div>
  );
}
