import { Config } from '@/config.ts';
import _ from 'lodash';
import { ensureDir } from '@std/fs';
import { formatFile } from '@/utils.ts';
import { join } from '@std/path';
import pluralize from 'pluralize';

export async function generateValidators(
  config: Config,
  tableName: string
): Promise<void> {
  const pluralName = pluralize(tableName.toLowerCase());

  // model resource directory should be something like lib/resources/users
  const resourceDir = `${config.resourcesDir}/${pluralName}`;
  await ensureDir(resourceDir);

  const singluarName = _.startCase(pluralize.singular(pluralName));

  const fileName = `validators.ts`;
  const filePath = join(resourceDir, fileName);

  const idSchema =
    config.defaultIdType === 'uuid' ? 'z.string().uuid()' : 'z.number()';

  const validatorContent = `
    import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
    import { ${pluralName}Table } from '@/${config.schemaDir}';
    import { z } from 'zod';

    export const delete${singluarName}Schema = z.object({
      id: ${idSchema},
    });

    export const insert${singluarName}Schema = createInsertSchema(${pluralName}Table).omit({
      id: true,
      created: true,
      updated: true,
    });

    export const select${singluarName}Schema = createSelectSchema(${pluralName}Table);

    export const update${singluarName}Schema = createInsertSchema(${pluralName}Table).omit({
      created: true,
      updated: true,
    });
  `;

  await Deno.writeTextFile(filePath, validatorContent);

  await formatFile(filePath);

  console.log(`Generated validator file: ${filePath}`);
}
