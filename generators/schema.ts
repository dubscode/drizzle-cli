// lib/generators/schema.ts

import { Config } from '@/config.ts';
import { ensureDir } from '@std/fs';
import { join } from '@std/path';

export async function generateSchema(
  config: Config,
  tableName: string
): Promise<void> {
  const schemaDir = config.schemaDir;
  await ensureDir(schemaDir);

  const fileName = `${tableName.toLowerCase()}.ts`;
  const filePath = join(schemaDir, fileName);

  const schemaContent = `
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ${tableName} = sqliteTable('${tableName}', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
`;

  await Deno.writeTextFile(filePath, schemaContent);
  console.log(`Generated schema file: ${filePath}`);
}
