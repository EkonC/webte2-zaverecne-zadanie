"use client";

import type React from "react";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileUp } from "lucide-react";

export function PdfAddPagesTool() {
  const { t } = useTranslation("common");
  const [file, setFile] = useState<File | null>(null);
  const [secondFile, setSecondFile] = useState<File | null>(null);
  const [insertPosition, setInsertPosition] = useState<string>("end");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [sourceType, setSourceType] = useState<string>("blank");
  const [blankPagesCount, setBlankPagesCount] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Simulate getting page count from PDF
      setTotalPages(Math.floor(Math.random() * 20) + 5);
    }
  };

  const handleSecondFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setSecondFile(selectedFile);
    }
  };

  const handleAddPages = () => {
    if (!file) return;

    if (
      insertPosition === "afterPage" &&
      (pageNumber < 1 || pageNumber > totalPages)
    ) {
      return;
    }

    if (sourceType === "fromAnotherPdf" && !secondFile) {
      return;
    }

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">
              {t("tools.addPages.uploadPdfFile")}
            </Label>
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
                  {t("tools.addPages.addOptions")}
                </h3>

                <div className="space-y-2">
                  <Label>{t("tools.addPages.insertPosition")}</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t("tools.addPages.insertPositionDesc")}
                  </p>

                  <RadioGroup
                    defaultValue="end"
                    value={insertPosition}
                    onValueChange={setInsertPosition}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginning" id="beginning" />
                      <Label htmlFor="beginning">
                        {t("tools.addPages.beginning")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="end" id="end" />
                      <Label htmlFor="end">{t("tools.addPages.end")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="afterPage" id="afterPage" />
                      <Label htmlFor="afterPage">
                        {t("tools.addPages.afterPage")}
                      </Label>
                    </div>
                  </RadioGroup>

                  {insertPosition === "afterPage" && (
                    <div className="mt-2">
                      <Label htmlFor="page-number">
                        {t("tools.addPages.pageNumber")}
                      </Label>
                      <Input
                        id="page-number"
                        type="number"
                        min={1}
                        max={totalPages}
                        value={pageNumber}
                        onChange={(e) =>
                          setPageNumber(Number.parseInt(e.target.value))
                        }
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("tools.addPages.sourceOptions")}</Label>

                  <RadioGroup
                    defaultValue="blank"
                    value={sourceType}
                    onValueChange={setSourceType}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blank" id="blank" />
                      <Label htmlFor="blank">
                        {t("tools.addPages.blankPages")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="fromAnotherPdf"
                        id="fromAnotherPdf"
                      />
                      <Label htmlFor="fromAnotherPdf">
                        {t("tools.addPages.fromAnotherPdf")}
                      </Label>
                    </div>
                  </RadioGroup>

                  {sourceType === "blank" ? (
                    <div className="mt-2">
                      <Label htmlFor="blank-pages-count">
                        {t("tools.addPages.numberOfPages")}
                      </Label>
                      <Input
                        id="blank-pages-count"
                        type="number"
                        min={1}
                        value={blankPagesCount}
                        onChange={(e) =>
                          setBlankPagesCount(Number.parseInt(e.target.value))
                        }
                        className="mt-1"
                      />
                    </div>
                  ) : (
                    <div className="mt-2">
                      <Label htmlFor="second-pdf-upload">
                        {t("tools.addPages.uploadSecondPdf")}
                      </Label>
                      <Input
                        id="second-pdf-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleSecondFileChange}
                        className="mt-1"
                      />
                      {secondFile && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {secondFile.name} (
                          {(secondFile.size / 1024 / 1024).toFixed(2)}{" "}
                          {t("upload.mb")})
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleAddPages}
                  disabled={
                    isProcessing ||
                    (sourceType === "fromAnotherPdf" && !secondFile)
                  }
                  className="w-full"
                >
                  {isProcessing
                    ? t("tools.addPages.processing")
                    : t("tools.addPages.addButton")}
                </Button>
              </div>
            </>
          )}

          {isComplete && (
            <div className="p-4 bg-primary/10 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">
                    {t("tools.addPages.addComplete")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("tools.addPages.addCompleteDesc")}
                  </p>
                </div>

                <Button className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{t("tools.addPages.download")}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">
          {t("tools.addPages.howTo")}
        </h3>

        <ol className="space-y-3 list-decimal list-inside text-sm">
          <li>{t("tools.addPages.steps.step1")}</li>
          <li>{t("tools.addPages.steps.step2")}</li>
          <li>{t("tools.addPages.steps.step3")}</li>
          <li>{t("tools.addPages.steps.step4")}</li>
          <li>{t("tools.addPages.steps.step5")}</li>
          <li>{t("tools.addPages.steps.step6")}</li>
        </ol>
      </Card>
    </div>
  );
}
