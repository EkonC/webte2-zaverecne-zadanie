"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUp, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

export function FileUpload() {
  const { t } = useTranslation("common");
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        console.warn("Selected file is not a PDF.");
        setFile(null);
      }
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        console.warn("Selected file is not a PDF.");
        //use toast to show error message
        toast.error(t("upload.errorMessage"));
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleBrowseButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    // Simulation of file upload
    setTimeout(() => {
      setIsUploading(false);
      console.log("Uploaded file:", file.name);
      // router.push("/tools/merge"); // Redirect to the merge tool page
      setFile(null);
    }, 1500);
  };

  return (
    <Card
      className={`w-full border-2 border-dashed p-6 sm:p-8 text-center transition-colors duration-200 ease-in-out ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-primary/50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <div
          className={`rounded-full p-4 transition-colors ${
            isDragging ? "bg-primary/20" : "bg-primary/10"
          }`}
        >
          <FileUp
            className={`h-10 w-10 sm:h-12 sm:w-12 transition-colors ${
              isDragging ? "text-primary-foreground" : "text-primary"
            }`}
          />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-semibold">
            {t("upload.title")}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("upload.subtitle")}
          </p>
        </div>

        <Input
          ref={fileInputRef}
          id="file-upload-input"
          type="file"
          accept=".pdf"
          className="sr-only"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3 mt-2 w-full px-4">
          {!file && (
            <Button
              variant="outline"
              onClick={handleBrowseButtonClick}
              className="w-full max-w-xs"
              disabled={isUploading}
            >
              {t("upload.browseFiles")}
            </Button>
          )}

          {file && (
            <>
              <p
                className="text-sm text-muted-foreground mt-2 w-full truncate text-center px-2"
                title={file.name}
              >
                {t("upload.selectedFile")} {file.name} (
                {(file.size / 1024 / 1024).toFixed(2)} {t("upload.mb")})
              </p>
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs justify-center">
                <Button
                  variant="outline"
                  onClick={handleBrowseButtonClick}
                  className="flex-grow sm:flex-grow-0"
                  disabled={isUploading}
                >
                  {t("upload.changeFile")}
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !file}
                  className="flex-grow sm:flex-grow-0"
                >
                  {isUploading ? (
                    t("upload.uploading")
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{t("upload.upload")}</span>
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
