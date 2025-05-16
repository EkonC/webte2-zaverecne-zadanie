"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Eye,
  Download,
  Trash2,
  FileText,
  Loader2,
  Combine, // Merge PDF
  Baseline, // Extract text
  FileImage, // Extract images
  FileMinus2, // Remove pages
  RotateCw, // Rotate pages
  Edit3, // Edit text
  Layers, // Add watermark (or Droplets)
  ImageIcon, // Export to PNG/JPG
  LayoutGrid, // Multiple pages per sheet
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Configure PDF.js worker.
// OPTION 1: If you copied 'pdf.worker.min.js' to your 'public' folder:
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
// OPTION 2: Use a CDN (ensure version matches your react-pdf's pdfjs-dist dependency)
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


export interface PdfFile {
  id: string;
  name: string;
  url: string;
}

interface PdfCardProps {
  file: PdfFile;
  isSelected: boolean;
  onSelectChange: (isSelected: boolean) => void;
  onView: (file: PdfFile) => void;
  onDownload: (file: PdfFile) => void;
  onDelete: (file: PdfFile) => void;
  // Add handlers for new actions as needed
  onMerge?: (file: PdfFile) => void;
  onExtractText?: (file: PdfFile) => void;
  onExtractImages?: (file: PdfFile) => void;
  // ... and so on for other actions
}

export function PdfCard({
  file,
  isSelected,
  onSelectChange,
  onView,
  onDownload,
  onDelete,
  // Placeholder handlers for new actions
  onMerge = (f) => alert(`Merge action for ${f.name}`),
  onExtractText = (f) => alert(`Extract text action for ${f.name}`),
  onExtractImages = (f) => alert(`Extract images action for ${f.name}`),
  // ... add more props if you implement specific handlers
}: PdfCardProps) {
  const { t } = useTranslation("common");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPreviewError(null);
  }

  function onDocumentLoadError(error: Error): void {
    console.error(`Failed to load PDF preview for ${file.name}:`, error.message);
    setPreviewError(t("pdfCard.previewErrorText", "Preview unavailable"));
  }

  // Placeholder functions for new actions - implement their logic as needed
  const handleAction = (actionName: string, specificFile: PdfFile) => {
    alert(`${actionName} clicked for ${specificFile.name}. Implement actual logic.`);
    // Example: if (actionName === t("pdfCard.action.merge")) onMerge?.(specificFile);
  };


  return (
    <Card className="flex flex-col overflow-hidden group transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between p-3 space-y-0 border-b">
        <div className="flex items-center space-x-2 overflow-hidden">
          <Checkbox
            id={`select-${file.id}`}
            checked={isSelected}
            onCheckedChange={(checked) => onSelectChange(Boolean(checked))}
            aria-label={t("pdfCard.selectFile", { fileName: file.name })}
          />
          <CardTitle
            className="text-sm font-medium leading-none truncate cursor-default"
            title={file.name}
          >
            {file.name}
          </CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">{t("pdfCard.actions")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(file)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>{t("pdfCard.view")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(file)}>
              <Download className="mr-2 h-4 w-4" />
              <span>{t("pdfCard.download")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction(t("pdfCard.action.merge"), file)}>
              <Combine className="mr-2 h-4 w-4" />
              <span>{t("pdfCard.action.merge")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(t("pdfCard.action.extractText"), file)}>
              <Baseline className="mr-2 h-4 w-4" />
              <span>{t("pdfCard.action.extractText")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(t("pdfCard.action.extractImages"), file)}>
              <FileImage className="mr-2 h-4 w-4" />
              <span>{t("pdfCard.action.extractImages")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(t("pdfCard.action.removePages"), file)}>
              <FileMinus2 className="mr-2 h-4 w-4" />
              <span>{t("pdfCard.action.removePages")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(t("pdfCard.action.rotatePages"), file)}>
              <RotateCw className="mr-2 h-4 w-4" />
              <span>{t("pdfCard.action.rotatePages")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(t("pdfCard.action.editText"), file)}>
              <Edit3 className="mr-2 h-4 w-4" />
              <span>{t("pdfCard.action.editText")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(t("pdfCard.action.addWatermark"), file)}>
              <Layers className="mr-2 h-4 w-4" />
              <span>{t("pdfCard.action.addWatermark")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction(t("pdfCard.action.exportToPng"), file)}>
              <ImageIcon className="mr-2 h-4 w-4" />
              <span>{t("pdfCard.action.exportToPng")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(t("pdfCard.action.exportToJpg"), file)}>
              <ImageIcon className="mr-2 h-4 w-4" /> {/* Can use the same icon or a different one if available */}
              <span>{t("pdfCard.action.exportToJpg")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(t("pdfCard.action.multiplePagesSheet"), file)}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>{t("pdfCard.action.multiplePagesSheet")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(file)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50 dark:text-red-500 dark:focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{t("pdfCard.delete")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent
        className="p-0 flex-grow flex items-center justify-center bg-slate-50 dark:bg-slate-800 cursor-pointer min-h-[200px] max-h-[280px]"
        onClick={() => onView(file)}
        title={t("pdfCard.viewFile", { fileName: file.name })}
      >
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          {previewError ? (
            <div className="flex flex-col items-center justify-center text-slate-500 p-4 text-center">
              <FileText className="w-10 h-10 mb-2" />
              <p className="text-xs">{previewError}</p>
            </div>
          ) : (
            <Document
              file={file.url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-xs">{t("pdfCard.loadingPreview")}</p>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center text-red-500 p-4 text-center">
                   <FileText className="w-10 h-10 mb-2" />
                   <p className="text-xs">{t("pdfCard.previewErrorText")}</p>
                </div>
              }
              className="flex justify-center items-center w-full h-full"
            >
              <Page
                pageNumber={1}
                width={180}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                canvasBackground="transparent"
                className="[&>canvas]:max-w-full [&>canvas]:max-h-full [&>canvas]:object-contain"
              />
            </Document>
          )}
        </div>
      </CardContent>
    </Card>
  );
}