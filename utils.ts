import _ from 'lodash';
import pluralize from 'pluralize';

export async function formatFile(filePath: string): Promise<void> {
  const denoFmt = new Deno.Command('deno', {
    args: ['fmt', filePath],
  });
  await denoFmt.output();
}

/**
 * Standardizes a table/model name for consistent naming across different inputs
 * @param input - The original input name (can be camelCase, snake_case, with spaces, etc.)
 * @returns An object with standardized naming conventions
 */
export function standardizeName(input: string) {
  // Remove any special characters and replace with spaces
  const cleanedInput = input.replace(/[^a-zA-Z0-9 ]/g, ' ');

  // Convert to lowercase and trim
  const normalizedInput = cleanedInput.toLowerCase().trim();

  // Convert to singular form
  const singularName = pluralize.singular(normalizedInput);

  // Pluralize for table names
  const pluralName = pluralize(singularName);

  return {
    // Camel case (e.g., featureFlag)
    camelCase: _.camelCase(pluralName),

    // Kebab case (e.g., feature-flags)
    kebabCase: _.kebabCase(pluralName),

    // Snake case (e.g., feature_flags)
    snakeCase: _.snakeCase(pluralName),

    // Pascal case for type names (e.g., FeatureFlags)
    pascalCase: _.startCase(_.camelCase(pluralName)).replace(/ /g, ''),

    // Singular version of the above (for single item references)
    singularPascalCase: _.startCase(_.camelCase(singularName)).replace(
      / /g,
      ''
    ),

    // Original singular form
    singular: singularName,

    // Original plural form
    plural: pluralName,
  };
}
