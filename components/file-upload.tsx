"use client";

import type React from "react";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUp, Upload } from "lucide-react";

export function FileUpload() {
  const { t } = useTranslation("common");
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setIsUploading(true);

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      // Navigate to a tool page after successful upload
      router.push("/tools/merge");
    }, 1500);
  };

  return (
    <Card
      className={`border-2 border-dashed p-8 text-center ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-primary/10 p-4">
          <FileUp className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{t("upload.title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("upload.subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <label htmlFor="file-upload">
            <Button variant="outline" className="cursor-pointer" tabIndex={-1}>
              {t("upload.browseFiles")}
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          {file && (
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                t("upload.uploading")
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("upload.upload")} {file.name}
                </>
              )}
            </Button>
          )}
        </div>

        {file && (
          <p className="text-sm text-muted-foreground mt-2">
            {t("upload.selectedFile")} {file.name} (
            {(file.size / 1024 / 1024).toFixed(2)} {t("upload.mb")})
          </p>
        )}
      </div>
    </Card>
  );
}
