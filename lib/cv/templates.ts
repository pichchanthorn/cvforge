import type { ComponentType } from "react";
import type { CvData, TemplateId } from "@/lib/cv/schema";
import { templateIds } from "@/lib/cv/schema";
import { AtsOneColumnPreview } from "@/components/cv/preview/ats-one-column";
import { ModernPreview } from "@/components/cv/preview/modern";
import { SidebarPreview } from "@/components/cv/preview/sidebar";
import { CreativePreview } from "@/components/cv/preview/creative";
import { PortraitPreview } from "@/components/cv/preview/portrait";
import { AtsOneColumnDocument } from "@/components/pdf/templates/ats-one-column";
import { ModernDocument } from "@/components/pdf/templates/modern";
import { SidebarDocument } from "@/components/pdf/templates/sidebar";
import { CreativeDocument } from "@/components/pdf/templates/creative";
import { PortraitDocument } from "@/components/pdf/templates/portrait";

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
  creative: {
    PreviewComponent: CreativePreview,
    PdfComponent: CreativeDocument,
    swatch: ["#7c5cff", "#ede9fe"],
  },
  portrait: {
    PreviewComponent: PortraitPreview,
    PdfComponent: PortraitDocument,
    swatch: ["#b45309", "#fef3c7"],
  },
};
