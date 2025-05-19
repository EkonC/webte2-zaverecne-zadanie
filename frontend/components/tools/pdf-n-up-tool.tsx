"use client";

import type React from "react";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileUp, LayoutGrid } from "lucide-react";

export function PdfNUpTool() {
  const { t } = useTranslation("common");
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState<string>("");
  const [pagesPerSheet, setPagesPerSheet] = useState<string>("2");
  const [pageOrder, setPageOrder] = useState<string>("horizontal");
  const [pageOrientation, setPageOrientation] = useState<string>("auto");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [resultPages, setResultPages] = useState<number>(0);

  // map "pages per sheet" → [cols, rows]
  const layoutMap: Record<string, [number, number]> = {
    "2":  [2, 1],
    "4":  [2, 2],
    "6":  [3, 2],
    "8":  [4, 2],
    "9":  [3, 3],
    "16": [4, 4],
  };

  // derive cols/rows so you can post them
  const [cols, rows] = layoutMap[pagesPerSheet] || [2, 2];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Simulate getting page count from PDF
      setTotalPages(Math.floor(Math.random() * 20) + 5);
    }
  };

  async function handleProcess() {
    if (!file) return;
    setIsProcessing(true);

    const form = new FormData();
    form.append("file", file);
    form.append("cols", String(cols));
    form.append("rows", String(rows));

    const res = await fetch("/api/pdf/n-up", {
      method: "POST",
      body: form,
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    // trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "nup.pdf";
    a.click();

    setIsProcessing(false);
    setIsComplete(true);
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">{t("tools.nUp.uploadPdfFile")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button variant="outline" size="icon" className="shrink-0">
                <FileUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {file && (
            <>
              <div className="p-4 bg-muted rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} {t("upload.mb")} •{" "}
                      {totalPages} {t("tools.split.pages")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">
                  {t("tools.nUp.layoutOptions")}
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="page-range">
                      {t("tools.nUp.pageRange")}
                    </Label>
                    <Input
                      id="page-range"
                      placeholder="e.g., 1-10"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("tools.nUp.pageRangeDesc")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pages-per-sheet">
                      {t("tools.nUp.pagesPerSheet")}
                    </Label>
                    <Select
                      value={pagesPerSheet}
                      onValueChange={setPagesPerSheet}
                    >
                      <SelectTrigger id="pages-per-sheet">
                        <SelectValue
                          placeholder={t("tools.nUp.selectPagesPerSheet")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">
                          2 {t("tools.nUp.pagesPerSheet")} (2×1)
                        </SelectItem>
                        <SelectItem value="4">
                          4 {t("tools.nUp.pagesPerSheet")} (2×2)
                        </SelectItem>
                        <SelectItem value="6">
                          6 {t("tools.nUp.pagesPerSheet")} (3×2)
                        </SelectItem>
                        <SelectItem value="8">
                          8 {t("tools.nUp.pagesPerSheet")} (4×2)
                        </SelectItem>
                        <SelectItem value="9">
                          9 {t("tools.nUp.pagesPerSheet")} (3×3)
                        </SelectItem>
                        <SelectItem value="16">
                          16 {t("tools.nUp.pagesPerSheet")} (4×4)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("tools.nUp.pageOrder")}</Label>
                    <RadioGroup
                      defaultValue="horizontal"
                      value={pageOrder}
                      onValueChange={setPageOrder}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center border rounded-md p-3 cursor-pointer hover:bg-muted">
                          <RadioGroupItem
                            value="horizontal"
                            id="horizontal"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="horizontal"
                            className="cursor-pointer"
                          >
                            <div className="grid grid-cols-2 gap-1 mb-2">
                              <div className="border rounded-sm p-1 text-xs text-center">
                                1
                              </div>
                              <div className="border rounded-sm p-1 text-xs text-center">
                                2
                              </div>
                              <div className="border rounded-sm p-1 text-xs text-center">
                                3
                              </div>
                              <div className="border rounded-sm p-1 text-xs text-center">
                                4
                              </div>
                            </div>
                            {t("tools.nUp.horizontalFirst")}
                          </Label>
                        </div>
                        <div className="flex flex-col items-center border rounded-md p-3 cursor-pointer hover:bg-muted">
                          <RadioGroupItem
                            value="vertical"
                            id="vertical"
                            className="sr-only"
                          />
                          <Label htmlFor="vertical" className="cursor-pointer">
                            <div className="grid grid-cols-2 gap-1 mb-2">
                              <div className="border rounded-sm p-1 text-xs text-center">
                                1
                              </div>
                              <div className="border rounded-sm p-1 text-xs text-center">
                                3
                              </div>
                              <div className="border rounded-sm p-1 text-xs text-center">
                                2
                              </div>
                              <div className="border rounded-sm p-1 text-xs text-center">
                                4
                              </div>
                            </div>
                            {t("tools.nUp.verticalFirst")}
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("tools.nUp.pageOrientation")}</Label>
                    <RadioGroup
                      defaultValue="auto"
                      value={pageOrientation}
                      onValueChange={setPageOrientation}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="auto" id="auto" />
                        <Label htmlFor="auto">{t("tools.nUp.auto")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="portrait" id="portrait" />
                        <Label htmlFor="portrait">
                          {t("tools.nUp.portrait")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="landscape" id="landscape" />
                        <Label htmlFor="landscape">
                          {t("tools.nUp.landscape")}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    t("tools.nUp.processing")
                  ) : (
                    <>
                      <LayoutGrid className="mr-2 h-4 w-4" />
                      {t("tools.nUp.createButton")}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {isComplete && (
            <div className="p-4 bg-primary/10 rounded-md">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">
                    {t("tools.nUp.processComplete")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("tools.nUp.processCompleteDesc")}
                  </p>
                  <p className="text-sm mt-2">
                    {t("tools.nUp.originalPages")}:{" "}
                    <strong>{totalPages}</strong> → {t("tools.nUp.resultPages")}
                    : <strong>{resultPages}</strong>
                  </p>
                </div>

                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  {t("tools.nUp.download")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{t("tools.nUp.howTo")}</h3>

        <ol className="space-y-3 list-decimal list-inside text-sm">
          <li>{t("tools.nUp.steps.step1")}</li>
          <li>{t("tools.nUp.steps.step2")}</li>
          <li>{t("tools.nUp.steps.step3")}</li>
          <li>{t("tools.nUp.steps.step4")}</li>
          <li>{t("tools.nUp.steps.step5")}</li>
        </ol>

        <div className="mt-6 text-sm text-muted-foreground">
          <p className="font-medium">{t("tools.nUp.note")}</p>
          <p className="mt-1">{t("tools.nUp.noteDesc")}</p>
        </div>
      </Card>
    </div>
  );
}
