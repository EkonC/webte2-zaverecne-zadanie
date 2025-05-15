"use client";

import type React from "react";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDown, ArrowUp, Download, FileUp, Trash2 } from "lucide-react";

export function PdfMergeTool() {
  const { t } = useTranslation("common");
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.currentTarget.files;
    if (fileList && fileList.length > 0) {
      setFiles(prev => [...prev, ...Array.from(fileList)]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [
      newFiles[index],
      newFiles[index - 1],
    ];
    setFiles(newFiles);
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;

    const newFiles = [...files];
    [newFiles[index], newFiles[index + 1]] = [
      newFiles[index + 1],
      newFiles[index],
    ];
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);

    // 1) Build a FormData with the actual File objects
    const form = new FormData();
    files.forEach((fileObj) => form.append("files", fileObj));

    // 2) POST to your new FastAPI endpoint
    const res = await fetch("/api/merge-pdf", { method: "POST", body: form });
    if (!res.ok) {
      // handle error…
      setIsProcessing(false);
      return;
    }

    // 3) Download the merged PDF
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "merged.pdf";
    a.click();
    URL.revokeObjectURL(url);

    setIsProcessing(false);
    setIsComplete(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="file-upload">
                {t("tools.merge.uploadPdfFiles")}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" className="shrink-0">
                  <FileUp className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleMerge}
              disabled={files.length < 2 || isProcessing}
              className="shrink-0"
            >
              {isProcessing
                ? t("tools.merge.processing")
                : t("tools.merge.mergeButton")}
            </Button>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">
                {t("tools.merge.filesToMerge")} ({files.length})
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {t("tools.merge.dragToReorder")}
              </p>

              <div className="border rounded-md divide-y">
                {files.map((file, index) => (
                  <div key={file.name} className="flex items-center p-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} {t("upload.mb")}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="h-8 w-8"
                      >
                        <ArrowUp className="h-4 w-4" />
                        <span className="sr-only">
                          {t("tools.merge.moveUp")}
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === files.length - 1}
                        className="h-8 w-8"
                      >
                        <ArrowDown className="h-4 w-4" />
                        <span className="sr-only">
                          {t("tools.merge.moveDown")}
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(file.name)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">
                          {t("tools.merge.remove")}
                        </span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isComplete && (
            <div className="mt-6 p-4 bg-primary/10 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">
                    {t("tools.merge.mergeComplete")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("tools.merge.mergeCompleteDesc")}
                  </p>
                </div>

                <Button className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{t("tools.merge.download")}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{t("tools.merge.howTo")}</h3>

        <ol className="space-y-3 list-decimal list-inside text-sm">
          <li>{t("tools.merge.steps.step1")}</li>
          <li>{t("tools.merge.steps.step2")}</li>
          <li>{t("tools.merge.steps.step3")}</li>
          <li>{t("tools.merge.steps.step4")}</li>
        </ol>

        <div className="mt-6 text-sm text-muted-foreground">
          <p className="font-medium">{t("tools.merge.tips.title")}</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>{t("tools.merge.tips.tip1")}</li>
            <li>{t("tools.merge.tips.tip2")}</li>
            <li>{t("tools.merge.tips.tip3")}</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
