"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Download as DownloadIcon, RefreshCw, Archive, ImageIcon } from "lucide-react";
import { useFile } from "../providers/file-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";
import { FileUp } from "lucide-react"; // Import FileUp icon
const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/pdf';

export function PdfExportJpgTool() {
  const { t } = useTranslation("common");
  const { sharedFile, setSharedFile, toolTarget, setToolTarget } = useFile();
  const router = useRouter();
  const { user } = useAuth();

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState<number>(300);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
      if (sharedFile) {
        setCurrentFile(sharedFile);
        setIsComplete(false);
        if (downloadUrl) { 
            URL.revokeObjectURL(downloadUrl); 
            setDownloadUrl(null);             
        }
        setDpi(300);
      }
    }, [sharedFile, router, t]);
  
    useEffect(() => {
      let needsReset = false;
  
      if (downloadUrl) { 
          URL.revokeObjectURL(downloadUrl);
          setDownloadUrl(null);
      }
      setIsComplete(false);
  
    }, [currentFile, dpi]);

  useEffect(() => {
    const currentUrl = downloadUrl;
    return () => { if (currentUrl) URL.revokeObjectURL(currentUrl); };
  }, [downloadUrl]);

  const handleExportJpg = async () => {
    if (!currentFile) {
      toast.error(t("tools.exportJpg.noFileSelectedError"));
      return;
    }
    setIsProcessing(true); setIsComplete(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const formData = new FormData();
    formData.append("file", currentFile);
    formData.append("dpi", String(dpi));

    const headers: HeadersInit = {};
    if (user && user.token) {
      headers['Authorization'] = `${user.tokenType} ${user.token}`; // e.g., "Bearer yourjwttoken"
    }

    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/pdf-to-jpg`, {
        method: "POST",
        body: formData,
        headers: headers,
      });
      if (!response.ok) { /* ... error handling ... */ throw new Error(`HTTP error! status: ${response.status}`); }
      const blob = await response.blob();
      if (blob.type !== "application/zip") { /* ... error handling ... */ throw new Error("Invalid response type, expected ZIP."); }

      const newUrl = URL.createObjectURL(blob);
      setDownloadUrl(newUrl);
      setIsComplete(true);
      toast.success(t("tools.exportJpg.exportComplete"));
    } catch (error) {
      console.error("Error exporting to JPG:", error);
      toast.error(`${t("tools.exportJpg.errorProcessing")} ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAndUploadNew = () => { /* ... same as other tools ... */
    setCurrentFile(null); setSharedFile(null); setToolTarget(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null); setIsComplete(false);
    setDpi(300);
    router.push("/");
  };


  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type === "application/pdf") {
          setCurrentFile(selectedFile);
          if (sharedFile) setSharedFile(null); // Clear context if local is chosen
        } else {
          toast.error(t("upload.errorMessage"));
          setCurrentFile(null);
          if (e.target) e.target.value = ""; // Reset file input
        }
      }
    };

  // Fallback if no file is loaded (e.g., direct navigation)
  if (!currentFile && !sharedFile) {
    return (
      <Card className="p-6 text-center w-full mx-auto">
        <FileUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t("tools.addWatermark.noFileLoadedTitle")}</h3>
        <p className="text-muted-foreground mb-4">{t("tools.addWatermark.noFileLoadedDesc")}</p>
        <Label htmlFor="pdf-upload-fallback" className="sr-only">
          {t("tools.addWatermark.uploadPdfFileFallback")}
        </Label>
        <div className="flex items-center gap-2 max-w-md mx-auto mb-4">
          <Input
            id="pdf-upload-fallback"
            type="file"
            accept=".pdf"
            onChange={handleLocalFileChange}
            className="flex-1"
          />
        </div>
        <Button variant="outline" onClick={() => router.push('/')}>
          {t("tools.addWatermark.goBackToUpload")}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>{t("tools.titles.exportJpg")}</CardTitle>
                <Button variant="outline" size="sm" onClick={handleResetAndUploadNew}>
                    <RefreshCw className="h-3 w-3 mr-1.5" />{t("tools.changeFile")}
                </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-1">{t("tools.exportJpg.description")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-md"> {/* File Info */}
                <p className="text-sm font-medium truncate max-w-xs sm:max-w-md" title={currentFile?.name}>{currentFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                    {currentFile ? (currentFile.size / 1024 / 1024).toFixed(2) : "0.00"} MB
                </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-medium">{t("tools.exportJpg.optionsTitle")}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="dpi-jpg">{t("tools.exportJpg.resolutionLabel")}</Label>
                  <span className="text-sm text-muted-foreground">{dpi} DPI</span>
                </div>
                <Slider
                  id="dpi-jpg"
                  value={[dpi]}
                  min={72}
                  max={600}
                  step={12}
                  onValueChange={([v]) => setDpi(v)}
                />
                <p className="text-xs text-muted-foreground">{t("tools.exportJpg.resolutionDesc")}</p>
              </div>
            </div>

            <Button
              onClick={handleExportJpg}
              disabled={isProcessing || !currentFile}
              className="w-full sm:w-auto"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t("tools.exportJpg.processing")}
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {t("tools.exportJpg.exportButton")}
                </>
              )}
            </Button>

            {isComplete && downloadUrl && (
              <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-md mt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-green-700 dark:text-green-300">
                      {t("tools.exportJpg.exportCompleteTitle")}
                    </h3>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {t("tools.exportJpg.exportCompleteDesc")}
                    </p>
                  </div>
                  <Button asChild className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                    <a
                      href={downloadUrl}
                      download={`${currentFile?.name.replace(/\.pdf$/i, '') || 'document'}_jpg_images.zip`}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      <span>{t("tools.exportJpg.downloadZipButton")}</span>
                    </a>
                  </Button>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
      <Card> {/* How To Card */}
        <CardHeader><CardTitle>{t("tools.exportJpg.howToTitle")}</CardTitle></CardHeader>
        <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                <li>{t("tools.exportJpg.steps.step1")}</li>
                <li>{t("tools.exportJpg.steps.step2")}</li>
                <li>{t("tools.exportJpg.steps.step3")}</li>
                <li>{t("tools.exportJpg.steps.step4")}</li>
            </ol>
        </CardContent>
      </Card>
    </div>
  );
}