"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, ArrowRight, MoreVertical, Eye, Download as DownloadIcon, Combine, Baseline, FileImage, FileMinus2, RotateCw, Edit3, Layers, LayoutGrid, Trash2, Scissors, FileDown, Stamp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useFile } from "./providers/file-provider";
import { toolFeatures, getToolFeatureByKey, ToolFeature } from "@/lib/tool-features";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export function FileUpload() {
  const { t } = useTranslation("common"); // "common" and "tools" namespaces might be needed
  const [isDragging, setIsDragging] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSharedFile, setToolTarget } = useFile();

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
        setLocalFile(droppedFile);
        setSharedFile(droppedFile); // Set in context immediately
      } else {
        toast.error(t("upload.errorMessage"));
        setLocalFile(null);
        setSharedFile(null);
      }
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setLocalFile(selectedFile);
        setSharedFile(selectedFile); // Set in context immediately
      } else {
        toast.error(t("upload.errorMessage"));
        setLocalFile(null);
        setSharedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleBrowseButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleToolSelection = (tool: ToolFeature) => {
    if (!localFile) {
      toast.error(t("upload.selectFileFirst"));
      return;
    }
    setToolTarget(tool.key);
    // setSharedFile(localFile); // Already set on file change/drop
    router.push(tool.href);
  };

  const handleClearFile = () => {
    setLocalFile(null);
    setSharedFile(null);
    setToolTarget(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  // Simple file actions (view, download, delete - implement actual logic as needed)
  const onViewFile = (file: File) => toast.info(`Viewing ${file.name} (not implemented)`);
  const onDownloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t("upload.downloaded", { fileName: file.name }));
  };
  const onDeleteFile = (file: File) => {
    toast.warning(t("upload.deleted", { fileName: file.name })); // Simulate deletion
    handleClearFile();
  };

  return (
    <div className="w-full mx-auto space-y-6">
      {!localFile ? (
        <Card
          className={`w-full border-2 border-dashed p-8 sm:p-12 text-center transition-colors duration-200 ease-in-out ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className={`rounded-full p-4 transition-colors ${isDragging ? "bg-primary/20" : "bg-primary/10"}`}>
              <FileUp className={`h-12 w-12 transition-colors ${isDragging ? "text-primary-foreground" : "text-primary"}`} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-semibold">{t("upload.title")}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{t("upload.subtitlePdfOnly")}</p>
            </div>
            <Input ref={fileInputRef} id="file-upload-input" type="file" accept=".pdf" className="sr-only" onChange={handleFileChange} />
            <Button variant="default" size="lg" onClick={handleBrowseButtonClick} className="mt-4">
              {t("upload.browseFiles")}
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>{t("upload.fileSelected")}</CardTitle>
                    <p className="text-sm text-muted-foreground truncate max-w-xs sm:max-w-md" title={localFile.name}>
                        {localFile.name} ({(localFile.size / 1024 / 1024).toFixed(2)} {t("upload.mb")})
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleClearFile}>
                        {t("upload.changeFile")}
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-medium mb-4 text-center">{t("upload.selectToolPrompt")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {toolFeatures.map((tool) => (
                <Button
                  key={tool.key}
                  variant="outline"
                  className="flex flex-col items-center justify-center h-28 p-4 text-center"
                  onClick={() => handleToolSelection(tool)}
                >
                  <span className="text-xs sm:text-sm font-medium">{t(tool.titleKey)}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}