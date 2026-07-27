import type { ComponentType } from "react";
import type { CvData, TemplateId } from "@/lib/cv/schema";
import { templateIds } from "@/lib/cv/schema";
import { AtsOneColumnPreview } from "@/components/cv/preview/ats-one-column";
import { ModernPreview } from "@/components/cv/preview/modern";
import { SidebarPreview } from "@/components/cv/preview/sidebar";
import { AtsOneColumnDocument } from "@/components/pdf/templates/ats-one-column";
import { ModernDocument } from "@/components/pdf/templates/modern";
import { SidebarDocument } from "@/components/pdf/templates/sidebar";

export { templateIds };
export type { TemplateId };

type CvComponent = ComponentType<{ data: CvData }>;

export const templateRegistry: Record<
  TemplateId,
  { PreviewComponent: CvComponent; PdfComponent: CvComponent; swatch: [string, string] }
> = {
  "ats-one-column": {
    PreviewComponent: AtsOneColumnPreview,
    PdfComponent: AtsOneColumnDocument,
    swatch: ["#f5f5f5", "#171717"],
  },
  modern: {
    PreviewComponent: ModernPreview,
    PdfComponent: ModernDocument,
    swatch: ["#4338ca", "#e0e7ff"],
  },
  sidebar: {
    PreviewComponent: SidebarPreview,
    PdfComponent: SidebarDocument,
    swatch: ["#115e59", "#99f6e4"],
  },
};
