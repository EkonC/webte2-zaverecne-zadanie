"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Scissors,
  Merge,
  FileEdit,
  ListTree,
  Trash2,
  FilePlus,
  FileText,
  ImageIcon,
} from "lucide-react";

const features = [
  {
    key: "merge",
    icon: Merge,
    href: "/tools/merge",
  },
  {
    key: "split",
    icon: Scissors,
    href: "/tools/split",
  },
  {
    key: "edit",
    icon: FileEdit,
    href: "/tools/edit",
  },
  {
    key: "delete",
    icon: Trash2,
    href: "/tools/delete",
  },
  {
    key: "addPages",
    icon: FilePlus,
    href: "/tools/add-pages",
  },
  {
    key: "extractImages",
    icon: ImageIcon,
    href: "/tools/extract-images",
  },
  {
    key: "extractText",
    icon: FileText,
    href: "/tools/extract-text",
  },
  {
    key: "toc",
    icon: ListTree,
    href: "/tools/create-toc",
  },
  {
    key: "convert",
    icon: ImageIcon,
    href: "/tools/convert",
  },
];

export function FeatureGrid() {
  const { t } = useTranslation("common");

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <Card key={feature.key} className="flex flex-col">
          <CardHeader>
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-2">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{t(`tools.${feature.key}.title`)}</CardTitle>
            <CardDescription>
              {t(`tools.${feature.key}.description`)}
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto pt-2">
            <Button asChild className="w-full">
              <Link href={feature.href}>{t("tools.useTool")}</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
