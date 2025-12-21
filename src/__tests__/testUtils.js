/**
 * Test utilities for stripping location information from AST nodes
 */

/**
 * Recursively removes labelRange properties from AST nodes and their children
 * @param {any} obj - The object to strip locations from
 * @returns {any} - The object with labelRange properties removed
 */
export function stripLocations(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(stripLocations)
  }

  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    // Skip labelRange properties
    if (key === 'labelRange') {
      continue
    }

    // Recursively strip locations from nested objects
    result[key] = stripLocations(value)
  }

  return result
}
