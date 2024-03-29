import { validateWorkflowAction } from "@utils/customValidation";
import { z } from "zod";

export const cssSelectorDataSchema = z.string().min(1);

export const fillContentDataSchema = z.string().min(1);

export const waitTimeDataSchema = z.string()

export const workflowSchema = z.object({
  type: z.enum(["scrape", "button-press", "input-fill", "wait"] as const),
  data: z.object({
    css_selectors: z.union([cssSelectorDataSchema, cssSelectorDataSchema.array()]).optional(),
    fill_content: z.union([fillContentDataSchema, fillContentDataSchema.array()]).optional(),
    time: z.union([waitTimeDataSchema, z.number().array()]).optional(),
  }),
  as: z.enum(["text", "json", "csv"] as const)
}).refine((val) => { return validateWorkflowAction({ action: val as WorkflowData }); });

export const loopSchema = z.object({
  start: z.number().min(1),
  end: z.number().min(1),
  iterations: z.number().min(2),
  created: z.boolean()
});

export const scrapeParamsSchema = z.object({
  url: z.string().url(),
  url_as: z.enum(["text", "json", "csv"] as const),
  browser: z.string().toLowerCase(),
  exec_type: z.enum(["sequential", "looping"] as const),
  swallow_errors: z.boolean(),
});

export const scrapeSchema =  z.object({
  workflow: workflowSchema.array().min(1),
  loop: loopSchema,
  scrape_params: scrapeParamsSchema
});

export const scraperSchema = z.object({
  scrapes: scrapeSchema.array(),
  meta: z.object({
    user_email : z.string().email(),
    expected_runtime_seconds : z.number().min(0),
  })
});