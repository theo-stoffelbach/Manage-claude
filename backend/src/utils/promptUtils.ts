/**
 * Extracts variables from prompt content
 * Variables are defined as {{variableName}}
 * @param content - The prompt content
 * @returns Array of unique variable names
 */
export function extractVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const matches = content.matchAll(regex);
  const variables = Array.from(matches, (match) => match[1]);
  return [...new Set(variables)]; // Remove duplicates
}

/**
 * Fills variables in prompt content with provided values
 * @param content - The prompt content with variables
 * @param values - Object mapping variable names to their values
 * @returns The prompt content with variables replaced
 */
export function fillVariables(
  content: string,
  values: Record<string, string>
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match;
  });
}

/**
 * Checks if content contains any variables
 * @param content - The content to check
 * @returns True if content contains variables
 */
export function hasVariables(content: string): boolean {
  return /\{\{(\w+)\}\}/.test(content);
}

/**
 * Extracts fragment references from content
 * Fragments are defined as {{fragment:fragmentName}}
 * @param content - The prompt content
 * @returns Array of unique fragment names
 */
export function extractFragmentReferences(content: string): string[] {
  const regex = /\{\{fragment:(\w+)\}\}/g;
  const matches = content.matchAll(regex);
  const fragments = Array.from(matches, (match) => match[1]);
  return [...new Set(fragments)]; // Remove duplicates
}

/**
 * Replaces fragment references with their content
 * @param content - The prompt content
 * @param fragments - Object mapping fragment names to their content
 * @returns The content with fragments replaced
 */
export function replaceFragments(
  content: string,
  fragments: Record<string, string>
): string {
  return content.replace(/\{\{fragment:(\w+)\}\}/g, (match, key) => {
    return fragments[key] !== undefined ? fragments[key] : match;
  });
}
