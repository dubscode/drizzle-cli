import { Config } from '@/config.ts';
import _ from 'lodash';
import { ensureDir } from '@std/fs';
import { formatFile } from '@/utils.ts';
import { join } from '@std/path';
import pluralize from 'pluralize';

export async function generateSchema(
  config: Config,
  tableName: string
): Promise<void> {
  const schemaDir = config.schemaDir;
  await ensureDir(schemaDir);
  const pluralName = pluralize(tableName.toLowerCase());
  const singluarName = pluralize.singular(pluralName);

  const fileName = `${_.kebabCase(pluralName)}.ts`;
  const filePath = join(schemaDir, fileName);

  const schemaContent = `
    import { boolean, index, integer, pgTable, relations, text, timestamp } from "drizzle-orm/pg-core";

    export const ${pluralName}Table = pgTable(
      '${pluralName}',
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
        nameIdx: index('${pluralName}_name_idx').using('btree', table.name),
      }),
    );

    export const ${singluarName}Relations = relations(${pluralName}Table, () => ({}));
  `;

  await Deno.writeTextFile(filePath, schemaContent);

  await formatFile(filePath);

  console.log(`Generated schema file: ${filePath}`);
}

export async function updateSchemaIndex(
  config: Config,
  tableName: string
): Promise<void> {
  const schemaDir = config.schemaDir;
  const indexPath = join(schemaDir, 'index.ts');
  const pluralName = pluralize(tableName.toLowerCase());
  const singluarName = pluralize.singular(pluralName);

  let indexContent: string;
  try {
    indexContent = await Deno.readTextFile(indexPath);
  } catch {
    // If index file doesn't exist, create it
    indexContent = '';
  }

  // Check if the export already exists
  const exportLine = `export { ${pluralName}Table, ${singluarName}Relations } from './${_.kebabCase(
    pluralName
  )}';`;

  if (!indexContent.includes(exportLine)) {
    indexContent += `\n${exportLine}`;
    await Deno.writeTextFile(indexPath, indexContent);
    await formatFile(indexPath);
    console.log(`Updated schema index: ${indexPath}`);
  }
}
