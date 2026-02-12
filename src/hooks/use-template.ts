"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LetterTemplate, LetterTemplateInsert, LetterTemplateUpdate } from "@/types/template";

export function useTemplate(templateId?: string) {
  const [template, setTemplate] = useState<LetterTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const loadTemplate = useCallback(async () => {
    if (!templateId) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("letter_templates")
        .select("*")
        .eq("id", templateId)
        .is("deleted_at", null)
        .single();

      if (fetchError) throw fetchError;
      setTemplate(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memuat template";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [templateId, supabase]);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    } else {
      setLoading(false);
    }
  }, [templateId, loadTemplate]);

  async function createTemplate(data: LetterTemplateInsert) {
    const response = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Gagal membuat template");
    }

    return await response.json();
  }

  async function updateTemplate(id: string, data: LetterTemplateUpdate) {
    const response = await fetch(`/api/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Gagal mengupdate template");
    }

    await loadTemplate();
    return await response.json();
  }

  async function deleteTemplate(id: string) {
    const response = await fetch(`/api/templates/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Gagal menghapus template");
    }
  }

  return {
    template,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refresh: loadTemplate,
  };
}

export function useTemplateList(layoutType?: string) {
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("letter_templates")
        .select("*")
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (layoutType) {
        query = query.eq("layout_type", layoutType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTemplates(data ?? []);
    } catch (err) {
      console.error("Error loading templates:", err);
    } finally {
      setLoading(false);
    }
  }, [layoutType, supabase]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    refresh: loadTemplates,
  };
}