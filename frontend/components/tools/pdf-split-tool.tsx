"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download as DownloadIcon, RefreshCw, Archive, Scissors } from "lucide-react"; // Using Archive for ZIP
import { useFile } from "../providers/file-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";
import { FileUp } from "lucide-react";

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/pdf';

export function PdfSplitTool() {
  const { t } = useTranslation(["common", "tools"]);
  const { sharedFile, setSharedFile, toolTarget, setToolTarget } = useFile();
  const router = useRouter();
  const { user } = useAuth();

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [splitMethod, setSplitMethod] = useState<string>("range"); // "range", "interval", "extract"
  const [pageRange, setPageRange] = useState<string>(""); // For "range" method
  const [interval, setIntervalValue] = useState<string>("1"); // For "interval" method, string for input
  const [extractOption, setExtractOption] = useState<string>("all"); // For "extract" method: "all", "even", "odd"

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    if (sharedFile) {
      setCurrentFile(sharedFile);
      // Reset state for the new shared file
      setIsComplete(false);
      if (downloadUrl) { // Accesses current state of downloadUrl before setting others
          URL.revokeObjectURL(downloadUrl); // Revoke any existing URL
          setDownloadUrl(null);             // Clear it from state
      }
      // Reset options
      setSplitMethod("range");
      setPageRange("");
      setIntervalValue("1");
      setExtractOption("all");
      // Simulate total pages for shared file too, for consistency if it's used for display
      setTotalPages(0); // Or some other logic to get/simulate page count
    }
  }, [sharedFile, router, t]); 

  useEffect(() => {
    if (isComplete || downloadUrl) { // Reset if params change after completion
      setIsComplete(false);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  }, [currentFile, splitMethod, pageRange, interval, extractOption]);

  useEffect(() => {
    const currentUrl = downloadUrl;
    return () => { if (currentUrl) URL.revokeObjectURL(currentUrl); };
  }, [downloadUrl]);

  const handleSplitPdf = async () => {
    if (!currentFile) {
      toast.error(t("tools:split.noFileSelectedError"));
      return;
    }
    setIsProcessing(true); setIsComplete(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const formData = new FormData();
    formData.append("file", currentFile);
    formData.append("split_method", splitMethod);

    switch (splitMethod) {
      case "range":
        if (!pageRange.trim()) {
          toast.error(t("tools:split.pageRangeRequired"));
          setIsProcessing(false); return;
        }
        formData.append("page_range", pageRange.trim());
        break;
      case "interval":
        const numInterval = parseInt(interval, 10);
        if (isNaN(numInterval) || numInterval < 1) {
          toast.error(t("tools:split.invalidInterval"));
          setIsProcessing(false); return;
        }
        formData.append("interval", String(numInterval));
        break;
      case "extract":
        formData.append("extract_option", extractOption);
        break;
      default:
        toast.error(t("tools:split.invalidSplitMethod"));
        setIsProcessing(false); return;
    }

    const headers: HeadersInit = {};
    if (user && user.token) {
      headers['Authorization'] = `${user.tokenType} ${user.token}`; // e.g., "Bearer yourjwttoken"
    }

    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/split-pdf`, {
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
      toast.success(t("tools:split.splitComplete"));
    } catch (error) {
      console.error("Error splitting PDF:", error);
      toast.error(`${t("tools:split.errorProcessing")} ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleResetAndUploadNew = () => {
    setCurrentFile(null); setSharedFile(null); setToolTarget(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null); setIsComplete(false);
    setSplitMethod("range"); setPageRange(""); setIntervalValue("1"); setExtractOption("all");
    setTotalPages(0);
    router.push("/");
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type === "application/pdf") {
          setCurrentFile(selectedFile);
          setTotalPages(2); // Simulate total pages
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
                <CardTitle>{t("tools:titles.split")}</CardTitle>
                <Button variant="outline" size="sm" onClick={handleResetAndUploadNew}>
                    <RefreshCw className="h-3 w-3 mr-1.5" />{t("tools:changeFile")}
                </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-1">{t("tools:descriptions.split")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-md"> {/* File Info */}
                <p className="text-sm font-medium truncate max-w-xs sm:max-w-md" title={currentFile?.name}>{currentFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                    {currentFile ? (currentFile.size / 1024 / 1024).toFixed(2) : "0.00"} MB
                    {totalPages > 0 ? ` • ${totalPages} ${t("tools:common.pages")}` : ""}
                </p>
            </div>

            <div>
                <h3 className="text-base font-medium mb-2">{t("tools:split.splitOptionsTitle")}</h3>
                <Tabs value={splitMethod} onValueChange={setSplitMethod}>
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="range">{t("tools:split.methods.range")}</TabsTrigger>
                    <TabsTrigger value="interval">{t("tools:split.methods.interval")}</TabsTrigger>
                    <TabsTrigger value="extract">{t("tools:split.methods.extract")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="range" className="space-y-3 pt-2">
                    <Label htmlFor="page-range-split">{t("tools:split.pageRangeLabel")}</Label>
                    <Input id="page-range-split" placeholder="e.g., 1-3,5,7-9" value={pageRange} onChange={(e) => setPageRange(e.target.value)} />
                    <p className="text-xs text-muted-foreground">{t("tools:split.pageRangeDesc")}</p>
                  </TabsContent>

                  <TabsContent value="interval" className="space-y-3 pt-2">
                    <Label htmlFor="interval-split">{t("tools:split.intervalLabel")}</Label>
                    <Input id="interval-split" type="number" min="1" value={interval} onChange={(e) => setIntervalValue(e.target.value)} />
                    <p className="text-xs text-muted-foreground">{t("tools:split.intervalDesc")}</p>
                  </TabsContent>

                  <TabsContent value="extract" className="space-y-3 pt-2">
                    <Label>{t("tools:split.extractOptionsLabel")}</Label>
                    <RadioGroup value={extractOption} onValueChange={setExtractOption} className="space-y-1">
                        {(["all", "even", "odd"] as const).map(opt => (
                            <div key={opt} className="flex items-center space-x-2">
                                <RadioGroupItem value={opt} id={`extract-${opt}`} />
                                <Label htmlFor={`extract-${opt}`} className="font-normal">{t(`tools:split.extractOptions.${opt}`)}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                     <p className="text-xs text-muted-foreground">{t("tools:split.extractDesc")}</p>
                  </TabsContent>
                </Tabs>
            </div>

            <Button onClick={handleSplitPdf} disabled={isProcessing || !currentFile} className="w-full sm:w-auto" size="lg">
                {isProcessing ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />{t("tools:split.processing")}</>
                ) : (
                    <><Scissors className="mr-2 h-4 w-4" />{t("tools:split.splitButton")}</>
                )}
            </Button>

            {isComplete && downloadUrl && ( /* Download section */
                 <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-md mt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-semibold text-green-700 dark:text-green-300">{t("tools:split.splitCompleteTitle")}</h3>
                            <p className="text-xs text-green-600 dark:text-green-400">{t("tools:split.splitCompleteDesc")}</p>
                        </div>
                        <Button asChild className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                        <a href={downloadUrl} download={`${currentFile?.name.replace(/\.pdf$/i, '') || 'document'}_split.zip`}>
                            <Archive className="mr-2 h-4 w-4" />
                            <span>{t("tools:split.downloadZipButton")}</span>
                        </a>
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
      <Card> {/* How To Card */}
        <CardHeader><CardTitle>{t("tools:split.howToTitle")}</CardTitle></CardHeader>
        <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                <li>{t("tools:split.steps.step1")}</li>
                <li>{t("tools:split.steps.step2")}</li>
                <li>{t("tools:split.steps.step3")}</li>
                <li>{t("tools:split.steps.step4")}</li>
            </ol>
        </CardContent>
      </Card>
    </div>
  );
}