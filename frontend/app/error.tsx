"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { FileWarning } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation("common");

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <FileWarning className="h-24 w-24 text-destructive mb-6" />
      <h1 className="text-4xl font-bold mb-2">{t("errors.somethingWrong")}</h1>

      <Button onClick={reset}>{t("errors.tryAgain")}</Button>
    </div>
  );
}
