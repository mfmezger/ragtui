import { z } from "zod";

export const IndexedSourceSchema = z
  .object({
    source_path: z.string(),
    source_absolute_path: z.string().nullable().optional(),
    format: z.string(),
    chunks: z.number().int().nonnegative(),
    chars: z.number().int().nonnegative(),
    estimated_tokens: z.number().int().nonnegative(),
    page_count: z.number().int().nonnegative(),
  })
  .passthrough();

export type IndexedSource = z.infer<typeof IndexedSourceSchema>;

export const SourcesReportSchema = z
  .object({
    store: z.string(),
    total_sources: z.number().int().nonnegative(),
    sources: z.array(IndexedSourceSchema),
  })
  .passthrough();

export type SourcesReport = z.infer<typeof SourcesReportSchema>;

export const DoctorReportSchema = z
  .object({
    ollama_url: z.string(),
    embed_model: z.string(),
    chat_model: z.string(),
    vision_model: z.string(),
    ollama_reachable: z.boolean(),
    ollama_error: z.string().nullable().optional(),
  })
  .passthrough();

export type DoctorReport = z.infer<typeof DoctorReportSchema>;

export const StatReportSchema = z
  .object({
    store: z.string(),
    stats: z
      .object({
        total_chunks: z.number().int().nonnegative(),
        unique_sources: z.number().int().nonnegative(),
        estimated_tokens: z.number().int().nonnegative(),
      })
      .passthrough(),
  })
  .passthrough();

export type StatReport = z.infer<typeof StatReportSchema>;

export const QueryHitSchema = z
  .object({
    source: z.string(),
    page: z.number().int(),
    chunk_index: z.number().int(),
    score: z.number().nullable().optional(),
    text: z.string(),
  })
  .passthrough();

export type QueryHit = z.infer<typeof QueryHitSchema>;

export const QueryReportSchema = z
  .object({
    question: z.string(),
    answer: z.string().nullable().optional(),
    mode: z.string(),
    hits: z.array(QueryHitSchema),
  })
  .passthrough();

export type QueryReport = z.infer<typeof QueryReportSchema>;
