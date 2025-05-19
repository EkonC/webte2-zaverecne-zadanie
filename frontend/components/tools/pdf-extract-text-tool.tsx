"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Download as DownloadIcon, RefreshCw, Copy, FileText } from "lucide-react";
import { useFile } from "../providers/file-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";
import { FileUp } from "lucide-react"; // Import FileUp icon
const FASTAPI_BASE_URL =  process.env.NEXT_PUBLIC_API_URL + '/pdf';

export function PdfExtractTextTool() {
  const { t } = useTranslation("common");
  const { sharedFile, setSharedFile, toolTarget, setToolTarget } = useFile();
  const router = useRouter();
  const { user } = useAuth();

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState<string>("");
  // textFormat is UI only as backend doesn't explicitly support it.
  // const [textFormat, setTextFormat] = useState<string>("plainText");
  const [preserveLayout, setPreserveLayout] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    if (sharedFile) {
      setCurrentFile(sharedFile);
      setIsComplete(false); setExtractedText("");
      setPageRange(""); setPreserveLayout(false);
      setTotalPages(Math.floor(Math.random() * 20) + 5); // Simulate
    }
  }, [sharedFile, router, t]);

  useEffect(() => {
    if (isComplete) { // Reset only if params change after completion
        setIsComplete(false);
        setExtractedText("");
    }
  }, [currentFile, pageRange, preserveLayout]);


  const handleExtractText = async () => {
    if (!currentFile) {
      toast.error(t("tools.extractText.noFileSelectedError"));
      return;
    }
    setIsProcessing(true); setIsComplete(false); setExtractedText("");

    const formData = new FormData();
    formData.append("file", currentFile);
    if (pageRange.trim()) formData.append("page_range", pageRange.trim());
    formData.append("preserve_layout", String(preserveLayout));
    // "text_format" is not sent as backend doesn't support it.

    const headers: HeadersInit = {};
    if (user && user.token) {
      headers['Authorization'] = `${user.tokenType} ${user.token}`; // e.g., "Bearer yourjwttoken"
    }

    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/extract-text`, {
        method: "POST",
        body: formData,
        headers: headers,
      });

      if (!response.ok) { /* ... error handling ... */ throw new Error(`HTTP error! status: ${response.status}`); }
      
      const data = await response.json();
      setExtractedText(data.text || "");
      setIsComplete(true);
      toast.success(t("tools.extractText.extractComplete"));

    } catch (error) {
      console.error("Error extracting text:", error);
      toast.error(`${t("tools.extractText.errorProcessing")} ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText)
      .then(() => toast.success(t("tools.extractText.copiedToClipboard")))
      .catch(err => toast.error(t("tools.extractText.copyFailed")));
  };

  const handleDownloadText = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentFile?.name.replace(/\.pdf$/i, '') || 'document'}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleResetAndUploadNew = () => {
    setCurrentFile(null); setSharedFile(null); setToolTarget(null);
    setIsComplete(false); setExtractedText("");
    setPageRange(""); setPreserveLayout(false); setTotalPages(0);
    router.push("/");
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type === "application/pdf") {
          setCurrentFile(selectedFile);
          setTotalPages(Math.floor(Math.random() * 20) + 5);
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
                <CardTitle>{t("tools.titles.extractText")}</CardTitle>
                <Button variant="outline" size="sm" onClick={handleResetAndUploadNew}>
                    <RefreshCw className="h-3 w-3 mr-1.5" />{t("tools.changeFile")}
                </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-1">{t("tools.extractText.description")}</p>
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
                    <h3 className="text-base font-medium">{t("tools.extractText.optionsTitle")}</h3>
                    <div className="space-y-2">
                        <Label htmlFor="page-range-extract-text">{t("tools.extractText.pageRangeLabel")}</Label>
                        <Input id="page-range-extract-text" placeholder="e.g., 1-3, 5 or blank for all" value={pageRange} onChange={(e) => setPageRange(e.target.value)} />
                        <p className="text-xs text-muted-foreground">{t("tools.extractText.pageRangeDesc")}</p>
                    </div>
                </div>
                <div className="space-y-4 pt-8"> {/* Column 2 - align with options title */}
                    <div className="flex items-start space-x-2">
                        <Checkbox id="preserve-layout-text" checked={preserveLayout} onCheckedChange={(c) => setPreserveLayout(c as boolean)} />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="preserve-layout-text">{t("tools.extractText.preserveLayoutLabel")}</Label>
                            <p className="text-xs text-muted-foreground">{t("tools.extractText.preserveLayoutDesc")}</p>
                        </div>
                    </div>
                     {/* Text Format (UI Only for now) */}
                    {/*
                    <div className="space-y-2 opacity-70 group">
                        <Label>{t("tools.extractText.textFormatLabel")} <span className="text-xs text-amber-600 dark:text-amber-400 group-hover:opacity-100 opacity-0 transition-opacity">({t("tools.common.uiOnlyFeature")})</span></Label>
                        <RadioGroup value={textFormat} onValueChange={setTextFormat} className="mt-1">
                            {["plainText", "richText", "html"].map(format => (
                                <div key={format} className="flex items-center space-x-2">
                                    <RadioGroupItem value={format} id={`tf-${format}`} />
                                    <Label htmlFor={`tf-${format}`} className="font-normal">{t(`tools.extractText.formats.${format}`)}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                    */}
                </div>
            </div>

            <Button onClick={handleExtractText} disabled={isProcessing || !currentFile} className="w-full sm:w-auto" size="lg">
                {isProcessing ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />{t("tools.extractText.processing")}</>
                ) : (
                    <><FileText className="mr-2 h-4 w-4" />{t("tools.extractText.extractButton")}</>
                )}
            </Button>

            {isComplete && (
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-base font-medium">{t("tools.extractText.extractedContentTitle")}</h3>
                    <Textarea
                        value={extractedText}
                        readOnly
                        className="min-h-[200px] max-h-[400px] font-mono text-sm bg-muted/50"
                        placeholder={t("tools.extractText.noTextExtracted")}
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleDownloadText} disabled={!extractedText}>
                            <DownloadIcon className="mr-2 h-4 w-4" />{t("tools.extractText.downloadButton")}
                        </Button>
                        <Button variant="outline" onClick={handleCopyToClipboard} disabled={!extractedText}>
                            <Copy className="mr-2 h-4 w-4" />{t("tools.extractText.copyButton")}
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
      <Card> {/* How To Card */}
        <CardHeader><CardTitle>{t("tools.extractText.howToTitle")}</CardTitle></CardHeader>
        <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                <li>{t("tools.extractText.steps.step1")}</li>
                <li>{t("tools.extractText.steps.step2")}</li>
                <li>{t("tools.extractText.steps.step3")}</li>
                <li>{t("tools.extractText.steps.step4")}</li>
            </ol>
        </CardContent>
      </Card>
    </div>
  );
}