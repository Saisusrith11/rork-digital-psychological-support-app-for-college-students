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
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed === '' || trimmed === 'object') {
    return null;
  }

  // Check for malformed JSON that starts with unexpected characters
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[') && !trimmed.startsWith('"') && !trimmed.match(/^(true|false|\d)/))
  {
    console.warn('Invalid JSON format detected:', trimmed.substring(0, 20));
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

  // Handle circular references and other edge cases
  try {
    return JSON.stringify(value, (key, val) => {
      // Handle circular references
      if (typeof val === 'object' && val !== null) {
        if (val.constructor === Object || Array.isArray(val)) {
          return val;
        }
        // Convert other objects to plain objects
        return Object.assign({}, val);
      }
      return val;
    });
  } catch (error) {
    console.error('JSON stringify error:', error);
    return '';
  }
}