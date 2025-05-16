"use client";

import type React from "react";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileUp } from "lucide-react";

export function PdfDeletePagesTool() {
  const { t } = useTranslation("common");
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Simulate getting page count from PDF
      setTotalPages(Math.floor(Math.random() * 20) + 5);
    }
  };

  const handleDelete = () => {
    if (!file || !pageRange) return;

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">
              {t("tools.delete.uploadPdfFile")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button variant="outline" size="icon" className="shrink-0">
                <FileUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {file && (
            <>
              <div className="p-4 bg-muted rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} {t("upload.mb")} •{" "}
                      {totalPages} {t("tools.split.pages")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">
                  {t("tools.delete.deleteOptions")}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="page-range">
                    {t("tools.delete.pageRange")}
                  </Label>
                  <Input
                    id="page-range"
                    placeholder="e.g., 1,3,5-7"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("tools.delete.pageRangeDesc")}
                  </p>
                </div>

                <Button
                  onClick={handleDelete}
                  disabled={isProcessing || !pageRange}
                  className="w-full"
                >
                  {isProcessing
                    ? t("tools.delete.processing")
                    : t("tools.delete.deleteButton")}
                </Button>
              </div>
            </>
          )}

          {isComplete && (
            <div className="p-4 bg-primary/10 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">
                    {t("tools.delete.deleteComplete")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("tools.delete.deleteCompleteDesc")}
                  </p>
                </div>

                <Button className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{t("tools.delete.download")}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{t("tools.delete.howTo")}</h3>

        <ol className="space-y-3 list-decimal list-inside text-sm">
          <li>{t("tools.delete.steps.step1")}</li>
          <li>{t("tools.delete.steps.step2")}</li>
          <li>{t("tools.delete.steps.step3")}</li>
          <li>{t("tools.delete.steps.step4")}</li>
        </ol>

        <div className="mt-6 text-sm text-muted-foreground">
          <p className="font-medium">{t("tools.delete.tips.title")}</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>{t("tools.delete.tips.tip1")}</li>
            <li>{t("tools.delete.tips.tip2")}</li>
            <li>{t("tools.delete.tips.tip3")}</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
