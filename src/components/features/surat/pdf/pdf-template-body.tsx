import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { parseTemplate } from "@/lib/template-parser";
import type { TemplateSection } from "@/lib/template-parser";

const styles = StyleSheet.create({
  paragraph: {
    fontSize: 12,
    textAlign: "justify",
    marginBottom: 8,
    lineHeight: 1.5,
  },
  table: {
    display: "table" as any,
    width: "auto",
    marginVertical: 8,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 20,
  },
  tableColLabel: {
    width: "35%",
    paddingRight: 8,
  },
  tableColSeparator: {
    width: "3%",
  },
  tableColValue: {
    width: "62%",
  },
  tableCellText: {
    fontSize: 12,
  },
});

interface PDFTemplateBodyProps {
  bodyTemplate: string; // This is template.isi_surat from DB
  values: Record<string, string>;
}

/**
 * Render template body for PDF with proper table layout
 */
export default function PDFTemplateBody({
  bodyTemplate,
  values,
}: PDFTemplateBodyProps) {
  const { sections } = parseTemplate(bodyTemplate);

  function renderSection(section: TemplateSection, index: number) {
    if (section.type === "paragraph") {
      // Replace inline markers with values
      let content = section.content || "";
      Object.entries(values).forEach(([fieldName, value]) => {
        const marker = `[Isi ${fieldName.replace(/_/g, " ")}]`;
        content = content.replace(new RegExp(marker, "g"), value);
      });

      return (
        <Text key={index} style={styles.paragraph}>
          {content}
        </Text>
      );
    }

    if (section.type === "table" && section.rows) {
      return (
        <View key={index} style={styles.table}>
          {section.rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              <View style={styles.tableColLabel}>
                <Text style={styles.tableCellText}>{row.label}</Text>
              </View>
              <View style={styles.tableColSeparator}>
                <Text style={styles.tableCellText}>:</Text>
              </View>
              <View style={styles.tableColValue}>
                <Text style={styles.tableCellText}>
                  {values[row.fieldName] || ""}
                </Text>
              </View>
            </View>
          ))}
        </View>
      );
    }

    return null;
  }

  return <>{sections.map((section, i) => renderSection(section, i))}</>;
}