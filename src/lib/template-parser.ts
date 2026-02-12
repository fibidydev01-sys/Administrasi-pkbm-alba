/**
 * Template Parser
 * Parse body_template with {{table}} and [Isi X] markers
 */

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

/**
 * Parse template body into sections
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

/**
 * Compose final body by replacing markers with values
 */
export function composeBody(
  bodyTemplate: string,
  values: Record<string, string>
): string {
  let result = bodyTemplate;

  // Remove table markers
  result = result.replace(/{{table_start}}\n?/g, "");
  result = result.replace(/{{table_end}}\n?/g, "");

  // Replace table rows (Label|[Isi X]) with (Label: Value)
  Object.entries(values).forEach(([fieldName, value]) => {
    // For table format: "Label|[Isi X]" → "Label: Value"
    const tableRowRegex = new RegExp(
      `^(.+?)\\|\\[Isi ${fieldName.replace(/_/g, " ")}\\]$`,
      "gm"
    );
    result = result.replace(tableRowRegex, (_, label) => {
      // Pad label to 25 chars for alignment
      const paddedLabel = label.padEnd(25);
      return `${paddedLabel}: ${value}`;
    });

    // For inline format: "[Isi X]" → "Value"
    const inlineMarkerRegex = new RegExp(
      `\\[Isi ${fieldName.replace(/_/g, " ")}\\]`,
      "g"
    );
    result = result.replace(inlineMarkerRegex, value);
  });

  return result;
}

/**
 * Get all field definitions from template
 */
export function getTemplateFields(bodyTemplate: string): Array<{
  fieldName: string;
  label: string;
  marker: string;
}> {
  const { fields } = parseTemplate(bodyTemplate);
  return Array.from(fields.entries()).map(([fieldName, info]) => ({
    fieldName,
    ...info,
  }));
}