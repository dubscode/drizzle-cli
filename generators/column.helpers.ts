import { Config } from '@/config.ts';
import _ from 'lodash';
import { ensureDir } from '@std/fs';
import { formatFile } from '@/utils.ts';
import { join } from '@std/path';

export async function generateColumnHelpers(config: Config): Promise<void> {
  const schemaDir = config.schemaDir;
  await ensureDir(schemaDir);

  const fileName = `column.helpers.ts`;
  const filePath = join(schemaDir, fileName);

  const idType = config.defaultIdType === 'uuid' ? 'uuid' : 'integer';

  const idImport = idType === 'uuid' ? `uuid` : `integer`;

  const idSnippet =
    idType === 'uuid'
      ? `
    export const id = {
      id: uuid('id')
        .primaryKey()
        .notNull()
        .defaultRandom(),
    };
    `
      : `
    export const id = {
      id: integer('id')
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    };
    `;

  const fileContent = `
    import { timestamp, ${idImport} } from 'drizzle-orm/pg-core';

    ${idSnippet}

    export const timestamps = {
      created: timestamp('created', { precision: 6, withTimezone: true })
        .defaultNow()
        .notNull(),
      updated: timestamp('updated', { precision: 6, withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
    };
  `;

  await Deno.writeTextFile(filePath, fileContent);

  // run Deno's formatter on the newly created file
  await formatFile(filePath);

  console.log(`Generated column helpers file: ${filePath}`);
}
