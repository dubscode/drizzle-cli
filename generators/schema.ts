import { formatFile, standardizeName } from '@/utils.ts';

import { Config } from '@/config.ts';
import { ensureDir } from '@std/fs';
import { join } from '@std/path';

export async function generateSchema(
  config: Config,
  tableName: string
): Promise<void> {
  const names = standardizeName(tableName);

  const schemaDir = config.schemaDir;
  await ensureDir(schemaDir);

  const fileName = `${names.kebabCase}.ts`;
  const filePath = join(schemaDir, fileName);

  const schemaContent = `
    import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";

    import { relations } from "drizzle-orm";
    import { id, timestamps } from "./column.helpers";

    export const ${names.camelCase}Table = pgTable(
      '${names.snakeCase}',
      {
        ...id,
        name: text('name'),
        isActive: boolean('is_active').default(true),
        ...timestamps,
      },
      (table) => ({
        nameIdx: index('${names.snakeCase}_name_idx').using('btree', table.name),
      }),
    );

    export const ${names.camelCase}Relations = relations(${names.camelCase}Table, () => ({}));
  `;

  await Deno.writeTextFile(filePath, schemaContent);

  await formatFile(filePath);

  console.log(`Generated schema file: ${filePath}`);
}

export async function updateSchemaIndex(
  config: Config,
  tableName: string
): Promise<void> {
  const names = standardizeName(tableName);
  const schemaDir = config.schemaDir;
  const indexPath = join(schemaDir, 'index.ts');

  let indexContent: string;
  try {
    indexContent = await Deno.readTextFile(indexPath);
  } catch {
    // If index file doesn't exist, create it
    indexContent = '';
  }

  // Create a regular expression to search for existing exports
  const exportRegex = new RegExp(
    `export\\s+\\{\\s*${names.camelCase}Relations,\\s*${names.camelCase}Table\\s*\\}\\s+from\\s+['"]\\./${names.kebabCase}['"];?`
  );

  if (!exportRegex.test(indexContent)) {
    indexContent += `\nexport { ${names.camelCase}Relations, ${names.camelCase}Table } from './${names.kebabCase}';`;
    await Deno.writeTextFile(indexPath, indexContent);
    await formatFile(indexPath);
    console.log(`Updated schema index: ${indexPath}`);
  }
}
