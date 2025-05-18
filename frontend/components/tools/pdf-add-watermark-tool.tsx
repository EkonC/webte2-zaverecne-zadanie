"use client";

import type React from "react";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

import { Download, FileUp, Type, ImageIcon } from "lucide-react";
import { ColorPicker } from "../color-picker";

export function PdfAddWatermarkTool() {
  const { t } = useTranslation("common");
  const [file, setFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<string>("text");
  const [watermarkText, setWatermarkText] = useState<string>("");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [position, setPosition] = useState<string>("center");
  const [opacity, setOpacity] = useState<number>(30);
  const [rotation, setRotation] = useState<number>(45);
  const [fontSize, setFontSize] = useState<number>(48);
  const [color, setColor] = useState<string>("#888888");
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

  const handleWatermarkImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setWatermarkImage(e.target.files[0]);
    }
  };

  const handleAddWatermark = () => {
    if (!file) return;
    if (watermarkType === "text" && !watermarkText) return;
    if (watermarkType === "image" && !watermarkImage) return;

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
              {t("tools.addWatermark.uploadPdfFile")}
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
                  {t("tools.addWatermark.watermarkOptions")}
                </h3>

                <Tabs
                  defaultValue="text"
                  onValueChange={(value) => setWatermarkType(value)}
                >
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger
                      value="text"
                      className="flex items-center gap-1"
                    >
                      <Type className="h-4 w-4" />
                      <span>{t("tools.addWatermark.textWatermark")}</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="flex items-center gap-1"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span>{t("tools.addWatermark.imageWatermark")}</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="watermark-text">
                        {t("tools.addWatermark.watermarkText")}
                      </Label>
                      <Input
                        id="watermark-text"
                        placeholder={t(
                          "tools.addWatermark.watermarkTextPlaceholder"
                        )}
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>{t("tools.addWatermark.fontSize")}</Label>
                        <span className="text-sm">{fontSize}px</span>
                      </div>
                      <Slider
                        value={[fontSize]}
                        min={12}
                        max={120}
                        step={4}
                        onValueChange={(value) => setFontSize(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t("tools.addWatermark.textColor")}</Label>
                      <ColorPicker color={color} onChange={setColor} />
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="watermark-image">
                        {t("tools.addWatermark.uploadWatermarkImage")}
                      </Label>
                      <Input
                        id="watermark-image"
                        type="file"
                        accept="image/*"
                        onChange={handleWatermarkImageChange}
                      />
                      {watermarkImage && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {watermarkImage.name} (
                          {(watermarkImage.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>{t("tools.addWatermark.position")}</Label>
                    <RadioGroup
                      defaultValue="center"
                      value={position}
                      onValueChange={setPosition}
                    >
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center justify-center p-2 border rounded-md">
                          <RadioGroupItem
                            value="topLeft"
                            id="topLeft"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="topLeft"
                            className="cursor-pointer text-xs"
                          >
                            {t("tools.addWatermark.topLeft")}
                          </Label>
                        </div>
                        <div className="flex items-center justify-center p-2 border rounded-md">
                          <RadioGroupItem
                            value="topCenter"
                            id="topCenter"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="topCenter"
                            className="cursor-pointer text-xs"
                          >
                            {t("tools.addWatermark.topCenter")}
                          </Label>
                        </div>
                        <div className="flex items-center justify-center p-2 border rounded-md">
                          <RadioGroupItem
                            value="topRight"
                            id="topRight"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="topRight"
                            className="cursor-pointer text-xs"
                          >
                            {t("tools.addWatermark.topRight")}
                          </Label>
                        </div>
                        <div className="flex items-center justify-center p-2 border rounded-md">
                          <RadioGroupItem
                            value="middleLeft"
                            id="middleLeft"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="middleLeft"
                            className="cursor-pointer text-xs"
                          >
                            {t("tools.addWatermark.middleLeft")}
                          </Label>
                        </div>
                        <div className="flex items-center justify-center p-2 border rounded-md">
                          <RadioGroupItem
                            value="center"
                            id="center"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="center"
                            className="cursor-pointer text-xs"
                          >
                            {t("tools.addWatermark.center")}
                          </Label>
                        </div>
                        <div className="flex items-center justify-center p-2 border rounded-md">
                          <RadioGroupItem
                            value="middleRight"
                            id="middleRight"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="middleRight"
                            className="cursor-pointer text-xs"
                          >
                            {t("tools.addWatermark.middleRight")}
                          </Label>
                        </div>
                        <div className="flex items-center justify-center p-2 border rounded-md">
                          <RadioGroupItem
                            value="bottomLeft"
                            id="bottomLeft"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="bottomLeft"
                            className="cursor-pointer text-xs"
                          >
                            {t("tools.addWatermark.bottomLeft")}
                          </Label>
                        </div>
                        <div className="flex items-center justify-center p-2 border rounded-md">
                          <RadioGroupItem
                            value="bottomCenter"
                            id="bottomCenter"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="bottomCenter"
                            className="cursor-pointer text-xs"
                          >
                            {t("tools.addWatermark.bottomCenter")}
                          </Label>
                        </div>
                        <div className="flex items-center justify-center p-2 border rounded-md">
                          <RadioGroupItem
                            value="bottomRight"
                            id="bottomRight"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="bottomRight"
                            className="cursor-pointer text-xs"
                          >
                            {t("tools.addWatermark.bottomRight")}
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{t("tools.addWatermark.opacity")}</Label>
                      <span className="text-sm">{opacity}%</span>
                    </div>
                    <Slider
                      value={[opacity]}
                      min={10}
                      max={100}
                      step={5}
                      onValueChange={(value) => setOpacity(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{t("tools.addWatermark.rotation")}</Label>
                      <span className="text-sm">{rotation}°</span>
                    </div>
                    <Slider
                      value={[rotation]}
                      min={0}
                      max={360}
                      step={15}
                      onValueChange={(value) => setRotation(value[0])}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddWatermark}
                  disabled={
                    isProcessing ||
                    (watermarkType === "text" && !watermarkText) ||
                    (watermarkType === "image" && !watermarkImage)
                  }
                  className="w-full"
                >
                  {isProcessing
                    ? t("tools.addWatermark.processing")
                    : t("tools.addWatermark.addWatermarkButton")}
                </Button>
              </div>
            </>
          )}

          {isComplete && (
            <div className="p-4 bg-primary/10 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">
                    {t("tools.addWatermark.watermarkComplete")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("tools.addWatermark.watermarkCompleteDesc")}
                  </p>
                </div>

                <Button className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{t("tools.addWatermark.download")}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">
          {t("tools.addWatermark.howTo")}
        </h3>

        <ol className="space-y-3 list-decimal list-inside text-sm">
          <li>{t("tools.addWatermark.steps.step1")}</li>
          <li>{t("tools.addWatermark.steps.step2")}</li>
          <li>{t("tools.addWatermark.steps.step3")}</li>
          <li>{t("tools.addWatermark.steps.step4")}</li>
          <li>{t("tools.addWatermark.steps.step5")}</li>
        </ol>

        <div className="mt-6 text-sm text-muted-foreground">
          <p className="font-medium">{t("tools.addWatermark.tips.title")}</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>{t("tools.addWatermark.tips.tip1")}</li>
            <li>{t("tools.addWatermark.tips.tip2")}</li>
            <li>{t("tools.addWatermark.tips.tip3")}</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
