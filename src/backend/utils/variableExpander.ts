import type { VariableSet } from "@/backend/types";

export interface ParsedVariable {
  name: string;
  values: string[];
}

export function parseInlineVariables(prompt: string): ParsedVariable[] {
  const regex = /\{(\w+):([^}]+)\}/g;
  const variables: ParsedVariable[] = [];
  let match;

  while ((match = regex.exec(prompt)) !== null) {
    const values = match[2]
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    if (values.length > 0) {
      variables.push({ name: match[1], values });
    }
  }
  return variables;
}

export function parseVariableReferences(prompt: string): string[] {
  const regex = /\{(\w+)\}/g;
  const refs: string[] = [];
  let match;

  while ((match = regex.exec(prompt)) !== null) {
    if (!prompt.includes(`{${match[1]}:`)) {
      refs.push(match[1]);
    }
  }
  return [...new Set(refs)];
}

function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>(
    (acc, arr) => acc.flatMap((combo) => arr.map((item) => [...combo, item])),
    [[]]
  );
}

export function expandVariables(
  prompt: string,
  inlineVars: ParsedVariable[],
  globalVars: VariableSet[]
): string[] {
  const allVars = new Map<string, string[]>();

  for (const set of globalVars) {
    for (const v of set.variables) {
      if (v.values.length > 0) {
        allVars.set(v.name, v.values);
      }
    }
  }

  for (const v of inlineVars) {
    allVars.set(v.name, v.values);
  }

  const cleanPrompt = prompt.replace(/\{(\w+):([^}]+)\}/g, (_, name) => `{${name}}`);

  const refs = parseVariableReferences(cleanPrompt);
  const usedVars = refs.filter((name) => allVars.has(name));

  if (usedVars.length === 0) {
    return [cleanPrompt];
  }

  const combinations = cartesianProduct(usedVars.map((name) => allVars.get(name)!));

  return combinations.map((combo) => {
    let result = cleanPrompt;
    usedVars.forEach((name, i) => {
      result = result.replace(new RegExp(`\\{${name}\\}`, "g"), combo[i]);
    });
    return result;
  });
}

export function countExpandedPrompts(prompt: string, globalVars: VariableSet[]): number {
  const inlineVars = parseInlineVariables(prompt);
  const allVars = new Map<string, string[]>();

  for (const set of globalVars) {
    for (const v of set.variables) {
      if (v.values.length > 0) {
        allVars.set(v.name, v.values);
      }
    }
  }

  for (const v of inlineVars) {
    allVars.set(v.name, v.values);
  }

  const cleanPrompt = prompt.replace(/\{(\w+):([^}]+)\}/g, (_, name) => `{${name}}`);
  const refs = parseVariableReferences(cleanPrompt);
  const usedVars = refs.filter((name) => allVars.has(name));

  if (usedVars.length === 0) return 1;

  return usedVars.reduce((total, name) => total * (allVars.get(name)?.length ?? 1), 1);
}

export function expandPromptWithVariables(prompt: string, globalVars: VariableSet[]): string[] {
  const inlineVars = parseInlineVariables(prompt);
  return expandVariables(prompt, inlineVars, globalVars);
}
