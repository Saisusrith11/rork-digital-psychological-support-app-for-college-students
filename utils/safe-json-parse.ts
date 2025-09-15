/**
 * Safely parse JSON with proper error handling
 * Returns null if parsing fails or input is invalid
 */
export function safeJsonParse<T = any>(value: string | null | undefined): T | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  // Check for common invalid values
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return null;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    console.error('Failed to parse value:', value);
    return null;
  }
}

/**
 * Safely stringify JSON with proper error handling
 * Returns empty string if stringification fails
 */
export function safeJsonStringify(value: any): string {
  if (value === undefined || value === null) {
    return '';
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('JSON stringify error:', error);
    return '';
  }
}