/**
 * Template Body Renderer
 * Renders surat body based on template layout
 */

import { LAYOUT_CONFIG } from "@/types/template";
import type { LayoutType } from "@/types/template";

/**
 * Compose full surat body with pembuka & penutup from layout
 */
export function composeSuratBody(
  isiSurat: string,
  layoutType?: LayoutType
): {
  pembuka: string;
  isi: string;
  penutup: string;
} {
  const layout = layoutType ? LAYOUT_CONFIG[layoutType] : LAYOUT_CONFIG.umum;

  return {
    pembuka: layout.pembuka,
    isi: isiSurat,
    penutup: layout.penutup,
  };
}

/**
 * Get layout config for rendering
 */
export function getLayoutForSurat(templateId?: string, layoutType?: LayoutType) {
  // If template has layout_type, use it
  if (layoutType) {
    return LAYOUT_CONFIG[layoutType];
  }

  // Default to umum
  return LAYOUT_CONFIG.umum;
}