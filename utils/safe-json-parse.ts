/**
 * Safely parse JSON with proper error handling
 * Returns null if parsing fails or input is invalid
 */
export function safeJsonParse<T = any>(value: any): T | null {
  // If value is already an object, return it
  if (value && typeof value === 'object') {
    return value as T;
  }
  
  // If not a string, return null
  if (!value || typeof value !== 'string') {
    return null;
  }

  // Check for common invalid values
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed === '') {
    return null;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    console.error('Failed to parse value:', value?.substring ? value.substring(0, 100) : value);
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