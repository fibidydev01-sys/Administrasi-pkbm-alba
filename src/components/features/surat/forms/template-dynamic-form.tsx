"use client";

import { parseTemplate } from "@/lib/template-parser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TemplateDynamicFormProps {
  bodyTemplate: string;
  values: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
  className?: string;
}

/**
 * Render dynamic form based on template structure
 * Displays labels and input fields for markers
 */
export default function TemplateDynamicForm({
  bodyTemplate,
  values,
  onChange,
  className,
}: TemplateDynamicFormProps) {
  const { sections } = parseTemplate(bodyTemplate);

  return (
    <div className={cn("space-y-4", className)}>
      {sections.map((section, sectionIndex) => {
        if (section.type === "paragraph") {
          // Split paragraph by inline markers
          const content = section.content || "";
          const parts: Array<{ type: "text" | "field"; content: string; fieldName?: string }> = [];

          const markerRegex = /\[Isi ([^\]]+)\]/g;
          let lastIndex = 0;
          let match;

          while ((match = markerRegex.exec(content)) !== null) {
            // Text before marker
            if (match.index > lastIndex) {
              parts.push({
                type: "text",
                content: content.slice(lastIndex, match.index),
              });
            }

            // Marker (field)
            const fieldName = match[1].toLowerCase().replace(/\s+/g, "_");
            parts.push({
              type: "field",
              content: match[1],
              fieldName,
            });

            lastIndex = match.index + match[0].length;
          }

          // Remaining text
          if (lastIndex < content.length) {
            parts.push({
              type: "text",
              content: content.slice(lastIndex),
            });
          }

          return (
            <div key={sectionIndex} className="text-sm leading-relaxed">
              {parts.map((part, partIndex) => {
                if (part.type === "text") {
                  return (
                    <span key={partIndex} className="whitespace-pre-wrap">
                      {part.content}
                    </span>
                  );
                }

                return (
                  <Input
                    key={partIndex}
                    value={values[part.fieldName!] || ""}
                    onChange={(e) => onChange(part.fieldName!, e.target.value)}
                    placeholder={part.content}
                    className="inline-block mx-1 w-[200px] h-7 px-2 text-sm align-middle"
                  />
                );
              })}
            </div>
          );
        }

        if (section.type === "table" && section.rows) {
          return (
            <div key={sectionIndex} className="space-y-2">
              {section.rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-2">
                  <Label className="w-[200px] text-sm font-normal">
                    {row.label}
                  </Label>
                  <span className="text-sm">:</span>
                  <Input
                    value={values[row.fieldName] || ""}
                    onChange={(e) => onChange(row.fieldName, e.target.value)}
                    placeholder={row.label}
                    className="flex-1 h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}