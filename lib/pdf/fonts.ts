import { Font } from "@react-pdf/renderer";

let registered = false;

/**
 * Registers a single font family used for all PDF text (Latin + Khmer).
 * Noto Sans Khmer is a variable font — react-pdf/fontkit renders it at a
 * single (regular) weight regardless of the requested font-weight, so
 * visual hierarchy in the templates leans on size/color rather than bold.
 */
export function registerPdfFonts() {
  if (registered) return;
  registered = true;
  Font.register({
    family: "NotoSansKhmer",
    src: "/fonts/NotoSansKhmer.ttf",
  });
}
