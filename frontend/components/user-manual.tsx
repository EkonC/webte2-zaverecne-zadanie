"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export function UserManual() {
  const { t } = useTranslation("common");

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const SWAGGER_URL  = `${API_URL}/docs`;

  const handleExportAsPdf = async () => {
    const original = document.getElementById("user-manual-container");
    if (!original) return;

    original.querySelectorAll("[hidden]").forEach((el) => el.removeAttribute("hidden"));

    const clone = original.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("[data-export-ignore]").forEach((el) => el.remove());

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <style>
            body { font-family: "DejaVu Sans", "Helvetica", "Arial", sans-serif; }
            [data-export-ignore]{ display:none !important; }
          </style>
        </head>
        <body>${clone.innerHTML}</body>
      </html>
    `;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/utils/html-to-pdf`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: html,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "user-manual.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <div className="space-y-6" id="user-manual-container">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("guide.userGuide")}</h2>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleExportAsPdf} data-export-ignore>
          <FileDown className="h-4 w-4" />
          <span>{t("guide.exportAsPdf")}</span>
        </Button>
      </div>

      <div defaultValue="getting-started">
        <div className="space-y-4 mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("guide.gettingStarted")}</h3>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("guide.welcome")}</h3>
            <p>{t("guide.welcomeDesc")}</p>

            <h4 className="text-md font-medium mt-6">{t("guide.quickStart")}</h4>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>{t("guide.quickStartSteps.step1")}</li>
              <li>{t("guide.quickStartSteps.step2")}</li>
              <li>{t("guide.quickStartSteps.step3")}</li>
              <li>{t("guide.quickStartSteps.step4")}</li>
              <li>{t("guide.quickStartSteps.step5")}</li>
            </ol>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <h3 className="text-lg font-medium">{t("guide.tools")}</h3>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">{t("tools.merge.title")}</h3>
              <p className="mt-1">{t("tools.merge.description")}</p>
              <p className="mt-1">{t("tools.merge.howToTitle")}</p>
              <ul>
                <li>- {t("tools.merge.steps.step1")}</li>
                <li>- {t("tools.merge.steps.step2")}</li>
                <li>- {t("tools.merge.steps.step3")}</li>
                <li>- {t("tools.merge.steps.step4")}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium">{t("tools.split.title")}</h3>
              <p className="mt-1">{t("tools.split.description")}</p>
              <p className="mt-1">{t("tools.split.howToTitle")}</p>
              <ol>
                <li>- {t("tools.split.steps.step1")}</li>
                <li>- {t("tools.split.steps.step2")}</li>
                <li>- {t("tools.split.steps.step3")}</li>
                <li>- {t("tools.split.steps.step4")}</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium">{t("tools.deletePages.title")}</h3>
              <p className="mt-1">{t("tools.deletePages.description")}</p>
              <p className="mt-1">{t("tools.deletePages.howToTitle")}</p>
              <ol>
                <li>- {t("tools.deletePages.steps.step1")}</li>
                <li>- {t("tools.deletePages.steps.step2")}</li>
                <li>- {t("tools.deletePages.steps.step3")}</li>
                <li>- {t("tools.deletePages.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.compress.title")}</h3>
              <p className="mt-1">{t("tools.compress.description")}</p>
              <p className="mt-1">{t("tools.compress.howToTitle")}</p>
              <ol>
                <li>- {t("tools.compress.steps.step1")}</li>
                <li>- {t("tools.compress.steps.step2")}</li>
                <li>- {t("tools.compress.steps.step3")}</li>
                <li>- {t("tools.compress.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.exportJpg.title")}</h3>
              <p className="mt-1">{t("tools.exportJpg.description")}</p>
              <p className="mt-1">{t("tools.exportJpg.howToTitle")}</p>
              <ol>
                <li>- {t("tools.exportJpg.steps.step1")}</li>
                <li>- {t("tools.exportJpg.steps.step2")}</li>
                <li>- {t("tools.exportJpg.steps.step3")}</li>
                <li>- {t("tools.exportJpg.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.exportJpg.title")}</h3>
              <p className="mt-1">{t("tools.exportPng.description")}</p>
              <p className="mt-1">{t("tools.exportPng.howToTitle")}</p>
              <ol>
                <li>- {t("tools.exportPng.steps.step1")}</li>
                <li>- {t("tools.exportPng.steps.step2")}</li>
                <li>- {t("tools.exportPng.steps.step3")}</li>
                <li>- {t("tools.exportPng.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.extractImages.title")}</h3>
              <p className="mt-1">{t("tools.extractImages.description")}</p>
              <p className="mt-1">{t("tools.extractImages.howToTitle")}</p>
              <ol>
                <li>- {t("tools.extractImages.steps.step1")}</li>
                <li>- {t("tools.extractImages.steps.step2")}</li>
                <li>- {t("tools.extractImages.steps.step3")}</li>
                <li>- {t("tools.extractImages.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.nUp.title")}</h3>
              <p className="mt-1">{t("tools.nUp.description")}</p>
              <p className="mt-1">{t("tools.nUp.howToTitle")}</p>
              <ol>
                <li>- {t("tools.nUp.steps.step1")}</li>
                <li>- {t("tools.nUp.steps.step2")}</li>
                <li>- {t("tools.nUp.steps.step3")}</li>
                <li>- {t("tools.nUp.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.extractText.title")}</h3>
              <p className="mt-1">{t("tools.extractText.description")}</p>
              <p className="mt-1">{t("tools.extractText.howToTitle")}</p>
              <ol>
                <li>- {t("tools.extractText.steps.step1")}</li>
                <li>- {t("tools.extractText.steps.step2")}</li>
                <li>- {t("tools.extractText.steps.step3")}</li>
                <li>- {t("tools.extractText.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.addWatermark.title")}</h3>
              <p className="mt-1">{t("tools.addWatermark.description")}</p>
              <p className="mt-1">{t("tools.addWatermark.howToTitle")}</p>
              <ol>
                <li>- {t("tools.addWatermark.steps.step1")}</li>
                <li>- {t("tools.addWatermark.steps.step2")}</li>
                <li>- {t("tools.addWatermark.steps.step3")}</li>
                <li>- {t("tools.addWatermark.steps.step4")}</li>
              </ol>
            </div>
          </div>
        </div>


        <div className="space-y-4 mt-8">
          <h2 className="text-lg font-medium">
            {t("guide.apiUsageTitle")}
          </h2>

          <p className="text-sm">
            {t("guide.apiUsageDesc")}{" "}
            <a
              href={SWAGGER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {t("guide.apiSwaggerLink")}
            </a>.
          </p>

          <p className="text-sm">
            <strong>{t("guide.apiBaseUrl")}:</strong>{" "}
            <code className="bg-muted px-1 rounded">{API_URL}</code>
          </p>

          <p className="text-sm">{t("guide.apiExample")}</p>
          <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">{`curl -X POST -H "Authorization: Bearer <YOUR_TOKEN>" \\
            -F "files=@first.pdf" -F "files=@second.pdf" \\
            ${API_URL}/pdf/merge-pdf -o merged.pdf`}</pre>
        </div>
        
      </div>
    </div>
  );
}
