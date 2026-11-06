/**
 * Parse a single attribute value that may be a JSON array or a plain string.
 * Returns an array of string values.
 */
export function parseAttributeValue(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    if (value.trim().startsWith("[") && value.trim().endsWith("]")) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fall through
      }
    }
    if (value.includes(",")) {
      return value.split(",").map((v) => v.trim());
    }
    return [value];
  }
  return [];
}

/**
 * Format a variant's attributes record into a human-readable string.
 * Handles JSON array strings, plain strings, and comma-separated values.
 */
export function formatAttributes(attrs: Record<string, any> | null | undefined, separator: string = " / "): string {
  if (!attrs || Object.keys(attrs).length === 0) return "";
  return Object.values(attrs)
    .map((v) => {
      const parsed = parseAttributeValue(v);
      return parsed.join(" / ");
    })
    .join(separator);
}