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
    import { boolean, index, integer, pgTable, relations, text, timestamp } from "drizzle-orm/pg-core";

    export const ${names.camelCase}Table = pgTable(
      '${names.snakeCase}',
      {
        id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
        name: text('name'),
        isActive: boolean('is_active').defaultTo(true),
        created: timestamp('created', { precision: 6, withTimezone: true })
          .defaultNow()
          .notNull(),
        updated: timestamp('updated', { precision: 6, withTimezone: true })
          .defaultNow()
          .notNull()
          .$onUpdate(() => new Date()),
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

  // Check if the export already exists
  const exportLine = `export { ${names.camelCase}Table, ${names.camelCase}Relations } from './${names.kebabCase}';`;

  if (!indexContent.includes(exportLine)) {
    indexContent += `\n${exportLine}`;
    await Deno.writeTextFile(indexPath, indexContent);
    await formatFile(indexPath);
    console.log(`Updated schema index: ${indexPath}`);
  }
}
