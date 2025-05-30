import {
  Merge, // You might need to import 'Combine' or 'GitMerge' from lucide-react if 'Merge' isn't available
  Scissors,
  Trash2,
  ImageIcon,
  FileText,
  FileDown, // (Compress)
  Stamp,    // (Add Watermark)
  LayoutGrid, // (N-up / Multiple Pages Sheet)
  // Lucide icons for DropdownMenu actions
  Eye,
  Download as DownloadIcon, // Renamed to avoid conflict if 'Download' is a component name
  Combine,  // For Merge
  Baseline, // For Extract Text
  FileImage, // For Extract Images
  FileMinus2, // For Remove Pages
  RotateCw, // For Rotate Pages
  Edit3,    // For Edit Text
  Layers,
  LucideIcon,
  Delete,   // For Add Watermark
} from "lucide-react";

// Define the type for a feature
export interface ToolFeature {
  key: string;
  icon: LucideIcon;
  href: string;
  titleKey: string; // Key for i18n title
  descriptionKey?: string; // Optional: Key for i18n description
}

export const toolFeatures: ToolFeature[] = [
  {
    key: "merge",
    icon: Merge, // Using 'Combine' as per your DropdownMenuItem
    href: "/tools/merge",
    titleKey: "tools.titles.merge",
    descriptionKey: "tools.merge.description",
  },
  {
    key: "split",
    icon: Scissors,
    href: "/tools/split",
    titleKey: "tools.titles.split",
    descriptionKey: "tools.split.description",
  },
  {
    key: "deletePages", // Changed key to be more specific than just "delete" (which might mean delete file)
    icon: Delete, // Using 'FileMinus2' as per your DropdownMenuItem
    href: "/tools/delete-pages",
    titleKey: "tools.titles.deletePages",
    descriptionKey: "tools.deletePages.description",
  },
  {
    key: "extractImages",
    icon: ImageIcon, // Using 'FileImage' as per your DropdownMenuItem
    href: "/tools/extract-images",
    titleKey: "tools.titles.extractImages",
    descriptionKey: "tools.extractImages.description",
  },
  {
    key: "extractText",
    icon: FileText, // Using 'Baseline' as per your DropdownMenuItem
    href: "/tools/extract-text",
    titleKey: "tools.titles.extractText",
    descriptionKey: "tools.extractText.description",
  },
  {
    key: "compress",
    icon: FileDown,
    href: "/tools/compress",
    titleKey: "tools.titles.compress",
    descriptionKey: "tools.compress.description",
  },
  {
    key: "addWatermark",
    icon: Stamp, // Using 'Layers' as per your DropdownMenuItem for consistency
    href: "/tools/add-watermark",
    titleKey: "tools.titles.addWatermark",
    descriptionKey: "tools.addWatermark.description",
  },
  {
    key: "exportPng",
    icon: ImageIcon,
    href: "/tools/export-png",
    titleKey: "tools.titles.exportPng",
    descriptionKey: "tools.exportPng.description",
  },
  {
    key: "exportJpg",
    icon: ImageIcon,
    href: "/tools/export-jpg",
    titleKey: "tools.titles.exportJpg",
    descriptionKey: "tools.exportJpg.description",
  },
  {
    key: "nUp",
    icon: LayoutGrid,
    href: "/tools/n-up",
    titleKey: "tools.titles.nUp",
    descriptionKey: "tools.nUp.description",
  },
];

// Helper to find a feature by key
export const getToolFeatureByKey = (key: string): ToolFeature | undefined => {
  return toolFeatures.find(feature => feature.key === key);
};