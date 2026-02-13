/**
 * Template Parser - COMPLETE VERSION
 * Handles {{table}} markers and [Isi X] field replacements
 * 
 * MERGED:
 * - parseTemplate() for dynamic form rendering (from original)
 * - composeBody() with robust regex parsing (from fix)
 * - getTemplateFields() helper
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TableRow {
  label: string;
  marker: string;
  fieldName: string;
}

export interface TemplateSection {
  type: "paragraph" | "table";
  content?: string;
  rows?: TableRow[];
}

export interface ParsedTemplate {
  sections: TemplateSection[];
  fields: Map<string, { label: string; marker: string }>;
}

export interface TemplateField {
  fieldName: string;
  label: string;
  marker: string;
  isTableRow?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract field name from marker
 * "[Isi nama]" → "nama"
 * "[Isi tanggal]" → "tanggal"
 */
function extractFieldName(marker: string): string {
  const match = marker.match(/\[Isi ([^\]]+)\]/);
  if (!match) return "";
  return match[1].toLowerCase().replace(/\s+/g, "_");
}

// ============================================================================
// PARSE TEMPLATE (For Dynamic Form Rendering)
// ============================================================================

/**
 * Parse template body into sections
 * Used by TemplateDynamicForm to render form fields
 */
export function parseTemplate(bodyTemplate: string): ParsedTemplate {
  const sections: TemplateSection[] = [];
  const fields = new Map<string, { label: string; marker: string }>();

  const tableRegex = /{{table_start}}([\s\S]*?){{table_end}}/g;

  let lastIndex = 0;
  let match;

  while ((match = tableRegex.exec(bodyTemplate)) !== null) {
    // Text before table
    const textBefore = bodyTemplate.slice(lastIndex, match.index).trim();
    if (textBefore) {
      // Check for inline fields in paragraph
      const inlineFieldRegex = /\[Isi ([^\]]+)\]/g;
      let fieldMatch;
      while ((fieldMatch = inlineFieldRegex.exec(textBefore)) !== null) {
        const fieldName = fieldMatch[1].toLowerCase().replace(/\s+/g, "_");
        fields.set(fieldName, {
          label: fieldMatch[1],
          marker: fieldMatch[0],
        });
      }

      sections.push({
        type: "paragraph",
        content: textBefore,
      });
    }

    // Parse table rows
    const tableContent = match[1].trim();
    const rows: TableRow[] = tableContent.split("\n").map((line) => {
      const [label, marker] = line.split("|").map((s) => s.trim());
      const fieldName = extractFieldName(marker);

      fields.set(fieldName, {
        label: label,
        marker: marker,
      });

      return {
        label,
        marker,
        fieldName,
      };
    });

    sections.push({
      type: "table",
      rows,
    });

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  const textAfter = bodyTemplate.slice(lastIndex).trim();
  if (textAfter) {
    // Check for inline fields
    const inlineFieldRegex = /\[Isi ([^\]]+)\]/g;
    let fieldMatch;
    while ((fieldMatch = inlineFieldRegex.exec(textAfter)) !== null) {
      const fieldName = fieldMatch[1].toLowerCase().replace(/\s+/g, "_");
      fields.set(fieldName, {
        label: fieldMatch[1],
        marker: fieldMatch[0],
      });
    }

    sections.push({
      type: "paragraph",
      content: textAfter,
    });
  }

  return { sections, fields };
}

// ============================================================================
// COMPOSE BODY (For PDF/Preview Generation - FIXED VERSION!)
// ============================================================================

/**
 * Compose final body by replacing markers with values
 * 
 * FIXED: Uses regex-first approach for robust table row parsing
 * 
 * Process:
 * 1. Remove {{table_start}} and {{table_end}} markers
 * 2. Replace table rows: "Label|[Isi X]" → "Label            : Value"
 * 3. Replace inline markers: "[Isi X]" → "Value"
 */
export function composeBody(
  bodyTemplate: string,
  values: Record<string, string>
): string {
  let result = bodyTemplate;

  // Step 1: Remove table markers
  result = result.replace(/{{table_start}}\n?/g, "");
  result = result.replace(/{{table_end}}\n?/g, "");

  // Step 2: Replace table rows with formatted output
  // 🔥 FIX: Regex-first approach (parse from template, not from values)
  // Pattern: "Label|[Isi X]" on its own line
  // Output: "Label                    : Value" (padded to 25 chars)
  result = result.replace(
    /^(.+?)\|\[Isi ([^\]]+)\]$/gm,
    (match, label, fieldText) => {
      // Normalize field name: "Nama Kegiatan" → "nama_kegiatan"
      const fieldName = fieldText.toLowerCase().replace(/\s+/g, "_");
      const value = values[fieldName];

      if (value) {
        // Pad label to 25 characters for alignment
        const paddedLabel = label.trim().padEnd(25);
        return `${paddedLabel}: ${value}`;
      }

      // If no value, keep original marker (for debugging)
      return match;
    }
  );

  // Step 3: Replace inline markers
  // Pattern: "[Isi X]" anywhere in text
  // Output: Just the value (no label)
  result = result.replace(
    /\[Isi ([^\]]+)\]/g,
    (match, fieldText) => {
      // Normalize field name
      const fieldName = fieldText.toLowerCase().replace(/\s+/g, "_");
      const value = values[fieldName];

      // Return value or keep marker if not found
      return value || match;
    }
  );

  return result;
}

// ============================================================================
// GET TEMPLATE FIELDS (Helper for extracting all fields)
// ============================================================================

/**
 * Get all field definitions from template
 * Used by template-sample-data to generate preview data
 */
export function getTemplateFields(bodyTemplate: string): TemplateField[] {
  const { fields } = parseTemplate(bodyTemplate);
  return Array.from(fields.entries()).map(([fieldName, info]) => ({
    fieldName,
    label: info.label,
    marker: info.marker,
  }));
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Parse template to check if it uses table format
 */
export function hasTableFormat(bodyTemplate: string): boolean {
  return (
    bodyTemplate.includes("{{table_start}}") ||
    bodyTemplate.includes("{{table_end}}")
  );
}

/**
 * Validate template syntax
 * Returns array of issues found (empty if valid)
 */
export function validateTemplate(bodyTemplate: string): string[] {
  const issues: string[] = [];

  // Check balanced table markers
  const startCount = (bodyTemplate.match(/{{table_start}}/g) || []).length;
  const endCount = (bodyTemplate.match(/{{table_end}}/g) || []).length;

  if (startCount !== endCount) {
    issues.push(
      `Unbalanced table markers: ${startCount} start, ${endCount} end`
    );
  }

  // Check for invalid markers
  const invalidMarkers = bodyTemplate.match(
    /{{(?!table_start|table_end)[^}]+}}/g
  );
  if (invalidMarkers) {
    issues.push(`Invalid markers found: ${invalidMarkers.join(", ")}`);
  }

  return issues;
}