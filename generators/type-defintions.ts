import { Config } from '@/config.ts';
import _ from 'lodash';
import { ensureDir } from '@std/fs';
import { formatFile } from '@/utils.ts';
import { join } from '@std/path';
import pluralize from 'pluralize';

export async function generateTypeDefinitions(
  config: Config,
  tableName: string
): Promise<void> {
  const pluralName = pluralize(tableName.toLowerCase());

  // model resource directory should be something like lib/resources/users
  const resourceDir = `${config.resourcesDir}/${pluralName}`;
  await ensureDir(resourceDir);

  const singluarName = _.startCase(pluralize.singular(pluralName));

  const fileName = `types.ts`;
  const filePath = join(resourceDir, fileName);

  const typeDefinitionContent = `
    import { ${pluralName}Table } from '@/${config.schemaDir}';
    import { z } from 'zod';

    export type ${singluarName}Type = typeof ${pluralName}Table.$inferSelect;
    export type ${singluarName}Input = typeof ${pluralName}Table.$inferInsert;
  `;

  await Deno.writeTextFile(filePath, typeDefinitionContent);

  await formatFile(filePath);

  console.log(`Generated typeDefinition file: ${filePath}`);
}
