import { readFileSync } from "fs";
import { resolve } from "path";

const MODEL_CONFIG_PATH = "../config/modelConfig.json";
const SEO_GUIDELINES_PATH = "../config/seoGuidelines.md";
const SYSTEM_PROMPT_PATH = "../config/systemPrompt.md";

export function getModelConfig(): Record<string, unknown> {
  return loadJson(MODEL_CONFIG_PATH);
}

export function getSeoGuidelines(): string {
  return loadFile(SEO_GUIDELINES_PATH);
}

export function getSystemPrompt(): string {
  return loadFile(SYSTEM_PROMPT_PATH);
}

function loadFile(filePath: string): string {
  try {
    return readFileSync(resolve(__dirname, filePath), "utf-8");
  } catch (ex) {
    console.error(`Error loading file "${filePath}":`, ex);
    return "";
  }
}

function loadJson(filePath: string): Record<string, unknown> {
  try {
    return JSON.parse(loadFile(filePath));
  } catch (ex) {
    console.error(`Error loading JSON "${filePath}":`, ex);
    return {};
  }
}
