"use client";

import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserManual } from "@/components/user-manual";
import { ApiDocumentation } from "@/components/api-documentation";

export default function DocsPage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("docs.title")}</h1>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="manual">{t("docs.userManual")}</TabsTrigger>
            <TabsTrigger value="api">{t("docs.apiDocs")}</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>{t("docs.userManual")}</CardTitle>
                <CardDescription>{t("docs.userManualDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManual />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>{t("docs.apiDocs")}</CardTitle>
                <CardDescription>{t("docs.apiDocsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ApiDocumentation />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
