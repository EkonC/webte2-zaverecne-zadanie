"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // For page range (UI only)
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download as DownloadIcon, RefreshCw, LayoutGrid } from "lucide-react";
import { useFile } from "../providers/file-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";
import { FileUp } from "lucide-react"; // Import FileUp icon
const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/pdf';

// map "pages per sheet" select value → [cols, rows] for backend
const layoutMap: Record<string, [number, number]> = {
    "1":  [1, 1], // Though not typical for N-up, good to have a base
    "2":  [2, 1], // 2 pages horizontal
    "2v": [1, 2], // 2 pages vertical (custom if needed, or stick to standard options)
    "4":  [2, 2],
    "6":  [3, 2],
    "8":  [4, 2],
    "9":  [3, 3],
    "16": [4, 4],
};

export function PdfNUpTool() {
  const { t } = useTranslation(["common", "tools"]);
  const { sharedFile, setSharedFile, toolTarget, setToolTarget } = useFile();
  const router = useRouter();
  const { user } = useAuth();

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pagesPerSheetKey, setPagesPerSheetKey] = useState<string>("4"); // Key for layoutMap
  // const [pageRange, setPageRange] = useState<string>(""); // UI only
  // const [pageOrder, setPageOrder] = useState<string>("horizontal"); // UI only
  // const [pageOrientation, setPageOrientation] = useState<string>("auto"); // UI only

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  // const [resultPages, setResultPages] = useState<number>(0); // Can't easily get this from current backend

  useEffect(() => {
    if (sharedFile) {
      setCurrentFile(sharedFile);
      setIsComplete(false); if (downloadUrl) URL.revokeObjectURL(downloadUrl); setDownloadUrl(null);
      setPagesPerSheetKey("4"); // Reset options
      setTotalPages(0); // Simulate
    } 
  }, [sharedFile, router, t]);

  useEffect(() => {
    if (downloadUrl || isComplete) {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null); setIsComplete(false);
    }
  }, [currentFile, pagesPerSheetKey]); // Reset if main affecting param changes

  useEffect(() => {
    const currentUrl = downloadUrl;
    return () => { if (currentUrl) URL.revokeObjectURL(currentUrl); };
  }, [downloadUrl]);

  const handleNUp = async () => {
    if (!currentFile) {
      toast.error(t("tools.nUp.noFileSelectedError"));
      return;
    }
    setIsProcessing(true); setIsComplete(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const [cols, rows] = layoutMap[pagesPerSheetKey] || [2, 2]; // Default to 2x2 if key invalid

    const formData = new FormData();
    formData.append("file", currentFile);
    formData.append("cols", String(cols));
    formData.append("rows", String(rows));
    // pageRange, pageOrder, pageOrientation NOT sent to backend

    const headers: HeadersInit = {};
    if (user && user.token) {
      headers['Authorization'] = `${user.tokenType} ${user.token}`; // e.g., "Bearer yourjwttoken"
    }

    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/n-up`, {
        method: "POST",
        body: formData,
        headers: headers,
      });
      if (!response.ok) { /* ... error handling ... */ throw new Error(`HTTP error! status: ${response.status}`); }
      const blob = await response.blob();
      if (blob.type !== "application/pdf") { /* ... error handling ... */ throw new Error("Invalid response type, expected PDF."); }

      const newUrl = URL.createObjectURL(blob);
      setDownloadUrl(newUrl);
      // setResultPages(Math.ceil(totalPages / (cols * rows))); // Estimate
      setIsComplete(true);
      toast.success(t("tools.nUp.processComplete"));
    } catch (error) {
      console.error("Error creating N-up PDF:", error);
      toast.error(`${t("tools.nUp.errorProcessing")} ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleResetAndUploadNew = () => {
    setCurrentFile(null); setSharedFile(null); setToolTarget(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null); setIsComplete(false);
    setPagesPerSheetKey("4"); setTotalPages(0); // setResultPages(0);
    router.push("/");
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type === "application/pdf") {
          setCurrentFile(selectedFile);
          setTotalPages(0);
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
                <CardTitle>{t("tools.titles.nUp")}</CardTitle>
                <Button variant="outline" size="sm" onClick={handleResetAndUploadNew}>
                    <RefreshCw className="h-3 w-3 mr-1.5" />{t("tools.changeFile")}
                </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-1">{t("tools.nUp.description")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-md"> {/* File Info */}
                <p className="text-sm font-medium truncate max-w-xs sm:max-w-md" title={currentFile?.name}>{currentFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                    {currentFile ? (currentFile.size / 1024 / 1024).toFixed(2) : "0.00"} MB
                    {totalPages > 0 ? ` • ${totalPages} ${t("tools.common.pages")}` : ""}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4"> {/* Column 1 */}
                    <h3 className="text-base font-medium">{t("tools.nUp.layoutOptionsTitle")}</h3>
                    <div className="space-y-2">
                        <Label htmlFor="pages-per-sheet">{t("tools.nUp.pagesPerSheetLabel")}</Label>
                        <Select value={pagesPerSheetKey} onValueChange={setPagesPerSheetKey}>
                            <SelectTrigger id="pages-per-sheet">
                                <SelectValue placeholder={t("tools.nUp.selectPagesPerSheetPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(layoutMap).map(([key, [c, r]]) => (
                                    <SelectItem key={key} value={key}>
                                        {c*r} {t("tools.nUp.pagesPerSheetOption", { count: c*r })} ({c}×{r})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 
            </div>

            <Button onClick={handleNUp} disabled={isProcessing || !currentFile} className="w-full sm:w-auto" size="lg">
                {isProcessing ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />{t("tools.nUp.processing")}</>
                ) : (
                    <><LayoutGrid className="mr-2 h-4 w-4" />{t("tools.nUp.createButton")}</>
                )}
            </Button>

            {isComplete && downloadUrl && ( /* Download section */
                <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-md mt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-semibold text-green-700 dark:text-green-300">{t("tools.nUp.processCompleteTitle")}</h3>
                            <p className="text-xs text-green-600 dark:text-green-400">{t("tools.nUp.processCompleteDesc")}</p>
                            {/* <p className="text-xs text-green-600 dark:text-green-400">
                                {t("tools.nUp.originalPages")}: {totalPages} → {t("tools.nUp.resultPages")}: {resultPages}
                            </p> */}
                        </div>
                        <Button asChild className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                        <a href={downloadUrl} download={`${currentFile?.name.replace(/\.pdf$/i, '') || 'document'}_nup.pdf`}>
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            <span>{t("tools.nUp.downloadButton")}</span>
                        </a>
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
      <Card> {/* How To Card */}
        <CardHeader><CardTitle>{t("tools.nUp.howToTitle")}</CardTitle></CardHeader>
        <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                <li>{t("tools.nUp.steps.step1")}</li>
                <li>{t("tools.nUp.steps.step2")}</li>
                <li>{t("tools.nUp.steps.step3")}</li>
                <li>{t("tools.nUp.steps.step4")}</li>
            </ol>
        </CardContent>
      </Card>
    </div>
  );
}