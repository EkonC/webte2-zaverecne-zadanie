"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download as DownloadIcon, RefreshCw, FileUp, Trash2, ArrowUp, ArrowDown, Combine } from "lucide-react";
import { useFile } from "../providers/file-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/pdf';

export function PdfMergeTool() {
  const { t } = useTranslation("common");
  const { sharedFile, setSharedFile, toolTarget, setToolTarget } = useFile();
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filesToMerge, setFilesToMerge] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (sharedFile && !filesToMerge.find(f => f.name === sharedFile.name && f.lastModified === sharedFile.lastModified)) {
      setFilesToMerge(prevFiles => [sharedFile, ...prevFiles.filter(pf => pf.name !== sharedFile.name)]);
      setSharedFile(null);
    }
  }, [sharedFile, setSharedFile, filesToMerge]);

  useEffect(() => {
    if (isComplete || downloadUrl) {
        setIsComplete(false);
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
    }
  }, [filesToMerge]);

  useEffect(() => {
    const currentUrl = downloadUrl;
    return () => { if (currentUrl) URL.revokeObjectURL(currentUrl); };
  }, [downloadUrl]);

  const handleAddFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).filter(
        (file) => file.type === "application/pdf" &&
                   !filesToMerge.find(existing => existing.name === file.name && existing.lastModified === file.lastModified)
      );
      if (newFiles.length < event.target.files.length) {
        toast.error(t("tools.merge.onlyPdfsOrDuplicates"));
      }
      setFilesToMerge(prev => [...prev, ...newFiles]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setFilesToMerge(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...filesToMerge];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFiles.length) return;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFilesToMerge(newFiles);
  };

  const handleMergePdfs = async () => {
    if (!user || !user.token) { // <--- Optional: Check if user is logged in before attempting
        toast.error(t("common:errors.unauthorized")); // Or your specific error message
        router.push("/login"); // Redirect to login if not authenticated
        return;
    }

    if (filesToMerge.length < 2) {
      toast.error(t("tools.merge.atLeastTwoFiles"));
      return;
    }
    setIsProcessing(true); setIsComplete(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const formData = new FormData();
    filesToMerge.forEach(file => formData.append("files", file));

    const headers: HeadersInit = {};
    if (user && user.token) {
      headers['Authorization'] = `${user.tokenType} ${user.token}`; // e.g., "Bearer yourjwttoken"
    }

    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/merge-pdf`, {
        method: "POST",
        headers: headers, // <--- Pass the headers here
        body: formData,
      });

      if (response.status === 401) { // Handle specific unauthorized error
        toast.error(t("common:errors.unauthorizedSessionExpired"));
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      if (blob.type !== "application/pdf") {
        throw new Error("Invalid response type, expected PDF.");
      }

      const newUrl = URL.createObjectURL(blob);
      setDownloadUrl(newUrl);
      setIsComplete(true);
      toast.success(t("tools.merge.mergeComplete"));
    } catch (error) {
      console.error("Error merging PDFs:", error);
      // Avoid showing "Unauthorized" if already handled by the 401 check
      if ((error as Error).message !== "Unauthorized") {
        toast.error(`${t("tools.merge.errorProcessing")} ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFilesToMerge([]);
    setSharedFile(null);
    setToolTarget(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setIsComplete(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>{t("tools.titles.merge")}</CardTitle>
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="h-3 w-3 mr-1.5" />{t("tools.changeFile")}
                </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-1">{t("tools.merge.description")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Label htmlFor="merge-file-upload" className="mb-1 block">{t("tools.merge.addPdfsLabel")}</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="merge-file-upload"
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handleAddFiles}
                        className="flex-1"
                    />
                    <Button variant="outline" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
                        <FileUp className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t("tools.merge.addMorePrompt")}</p>
            </div>

            {filesToMerge.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-base font-medium">{t("tools.merge.filesToMergeTitle")} ({filesToMerge.length})</h3>
                    <div className="border rounded-md">
                        {filesToMerge.map((file, index) => (
                            <div key={`${file.name}-${file.lastModified}-${index}`} className={`flex items-center p-3 gap-3 ${index > 0 ? 'border-t' : ''}`}>
                                <span className="text-sm font-semibold text-muted-foreground w-6 text-center">{index + 1}.</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleMoveFile(index, 'up')} disabled={index === 0} className="h-7 w-7">
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleMoveFile(index, 'down')} disabled={index === filesToMerge.length - 1} className="h-7 w-7">
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(index)} className="h-7 w-7 text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Button
                onClick={handleMergePdfs}
                disabled={isProcessing || filesToMerge.length < 2 || !user} // Disable if not logged in
                className="w-full sm:w-auto" size="lg"
            >
                {isProcessing ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />{t("tools.merge.processing")}</>
                ) : (
                    <><Combine className="mr-2 h-4 w-4" />{t("tools.merge.mergeButton", { count: filesToMerge.length })}</>
                )}
            </Button>

            {isComplete && downloadUrl && (
                <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-md mt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-semibold text-green-700 dark:text-green-300">{t("tools.merge.mergeCompleteTitle")}</h3>
                            <p className="text-xs text-green-600 dark:text-green-400">{t("tools.merge.mergeCompleteDesc")}</p>
                        </div>
                        <Button asChild className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                            <a href={downloadUrl} download="merged_document.pdf">
                                <DownloadIcon className="mr-2 h-4 w-4" />{t("tools.merge.downloadButton")}
                            </a>
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
      <Card> {/* How To Card */}
        <CardHeader><CardTitle>{t("tools.merge.howToTitle")}</CardTitle></CardHeader>
        <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                <li>{t("tools.merge.steps.step1")}</li>
                <li>{t("tools.merge.steps.step2")}</li>
                <li>{t("tools.merge.steps.step3")}</li>
                <li>{t("tools.merge.steps.step4")}</li>
            </ol>
        </CardContent>
      </Card>
    </div>
  );
}