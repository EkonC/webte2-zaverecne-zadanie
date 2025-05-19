// FeatureGrid.tsx (Only the features array needs modification)
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
  Trash2,
  FileText,
  FileDown,
  ImageIcon,
  Stamp,

  LayoutGrid,
} from "lucide-react";

const features = [
  {
    key: "merge",
    icon: Merge,
    href: "/tools/merge?initAction=upload", 
  },
  {
    key: "split",
    icon: Scissors,
    href: "/tools/split?initAction=upload", 
  },
  {
    key: "delete",
    icon: Trash2,
    href: "/tools/delete-pages?initAction=upload", 
  },
  {
    key: "extractImages",
    icon: ImageIcon,
    href: "/tools/extract-images?initAction=upload", 
  },
  {
    key: "extractText",
    icon: FileText,
    href: "/tools/extract-text?initAction=upload", 
  },
  {
    key: "compress",
    icon: FileDown,
    href: "/tools/compress?initAction=upload", 
  },
  {
    key: "addWatermark",
    icon: Stamp,
    href: "/tools/add-watermark?initAction=upload", 
  },
  {
    key: "exportPng",
    icon: ImageIcon,
    href: "/tools/export-png?initAction=upload", 
  },
  {
    key: "exportJpg",
    icon: ImageIcon,
    href: "/tools/export-jpg?initAction=upload", 
  },
  {
    key: "nUp",
    icon: LayoutGrid,
    href: "/tools/n-up?initAction=upload", 
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