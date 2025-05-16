"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown } from "lucide-react";

export function UserManual() {
  const { t } = useTranslation("common");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("docs.userGuide")}</h2>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <FileDown className="h-4 w-4" />
          <span>{t("docs.exportAsPdf")}</span>
        </Button>
      </div>

      <Tabs defaultValue="getting-started">
        <TabsList>
          <TabsTrigger value="getting-started">
            {t("docs.gettingStarted")}
          </TabsTrigger>
          <TabsTrigger value="tools">{t("docs.tools")}</TabsTrigger>
          <TabsTrigger value="faq">{t("docs.faq")}</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-4 mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("docs.welcome")}</h3>
            <p>{t("docs.welcomeDesc")}</p>

            <h4 className="text-md font-medium mt-6">{t("docs.quickStart")}</h4>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>{t("docs.quickStartSteps.step1")}</li>
              <li>{t("docs.quickStartSteps.step2")}</li>
              <li>{t("docs.quickStartSteps.step3")}</li>
              <li>{t("docs.quickStartSteps.step4")}</li>
              <li>{t("docs.quickStartSteps.step5")}</li>
            </ol>

            <h4 className="text-md font-medium mt-6">
              {t("docs.accountManagement")}
            </h4>
            <p>{t("docs.accountManagementDesc")}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t("docs.accountFeatures.feature1")}</li>
              <li>{t("docs.accountFeatures.feature2")}</li>
              <li>{t("docs.accountFeatures.feature3")}</li>
              <li>{t("docs.accountFeatures.feature4")}</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4 mt-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">{t("tools.merge.title")}</h3>
              <p className="mt-1">{t("tools.merge.description")}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">{t("tools.split.title")}</h3>
              <p className="mt-1">{t("tools.split.description")}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">{t("tools.edit.title")}</h3>
              <p className="mt-1">{t("tools.edit.description")}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">{t("tools.delete.title")}</h3>
              <p className="mt-1">{t("tools.delete.description")}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">{t("tools.toc.title")}</h3>
              <p className="mt-1">{t("tools.toc.description")}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">
                {t("tools.convert.title")}
              </h3>
              <p className="mt-1">{t("tools.convert.description")}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium">
                {t("docs.faqQuestions.q1")}
              </h3>
              <p className="text-sm mt-1">{t("docs.faqQuestions.a1")}</p>
            </div>

            <div>
              <h3 className="text-md font-medium">
                {t("docs.faqQuestions.q2")}
              </h3>
              <p className="text-sm mt-1">{t("docs.faqQuestions.a2")}</p>
            </div>

            <div>
              <h3 className="text-md font-medium">
                {t("docs.faqQuestions.q3")}
              </h3>
              <p className="text-sm mt-1">{t("docs.faqQuestions.a3")}</p>
            </div>

            <div>
              <h3 className="text-md font-medium">
                {t("docs.faqQuestions.q4")}
              </h3>
              <p className="text-sm mt-1">{t("docs.faqQuestions.a4")}</p>
            </div>

            <div>
              <h3 className="text-md font-medium">
                {t("docs.faqQuestions.q5")}
              </h3>
              <p className="text-sm mt-1">{t("docs.faqQuestions.a5")}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
