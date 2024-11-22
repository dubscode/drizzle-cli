import { formatFile, standardizeName } from '@/utils.ts';

import { Config } from '@/config.ts';
import { ensureDir } from '@std/fs';
import { join } from '@std/path';

export async function generateTypeDefinitions(
  config: Config,
  tableName: string
): Promise<void> {
  const names = standardizeName(tableName);

  // model resource directory should be something like lib/resources/users
  const resourceDir = `${config.resourcesDir}/${names.kebabCase}`;
  await ensureDir(resourceDir);

  const fileName = `types.ts`;
  const filePath = join(resourceDir, fileName);

  const typeDefinitionContent = `
    import { ${names.camelCase}Table } from '@/${config.schemaDir}';

    export type ${names.singularPascalCase}Type = typeof ${names.camelCase}Table.$inferSelect;
    export type ${names.singularPascalCase}Input = typeof ${names.camelCase}Table.$inferInsert;
  `;

  await Deno.writeTextFile(filePath, typeDefinitionContent);

  await formatFile(filePath);

  console.log(`Generated typeDefinition file: ${filePath}`);
}
