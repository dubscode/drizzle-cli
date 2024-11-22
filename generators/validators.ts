import { formatFile, standardizeName } from '@/utils.ts';

import { Config } from '@/config.ts';
import { ensureDir } from '@std/fs';
import { join } from '@std/path';

export async function generateValidators(
  config: Config,
  tableName: string
): Promise<void> {
  const names = standardizeName(tableName);

  // model resource directory should be something like lib/resources/users
  const resourceDir = `${config.resourcesDir}/${names.kebabCase}`;
  await ensureDir(resourceDir);

  const fileName = `validators.ts`;
  const filePath = join(resourceDir, fileName);

  const idSchema =
    config.defaultIdType === 'uuid' ? 'z.string().uuid()' : 'z.number()';

  const validatorContent = `
    import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
    import { ${names.camelCase}Table } from '@/${config.schemaDir}';
    import { z } from 'zod';

    export const delete${names.singularPascalCase}Schema = z.object({
      id: ${idSchema},
    });

    export const insert${names.singularPascalCase}Schema = createInsertSchema(${names.camelCase}Table).omit({
      id: true,
      created: true,
      updated: true,
    });

    export const select${names.singularPascalCase}Schema = createSelectSchema(${names.camelCase}Table);

    export const update${names.singularPascalCase}Schema = createInsertSchema(${names.camelCase}Table).omit({
      created: true,
      updated: true,
    });
  `;

  await Deno.writeTextFile(filePath, validatorContent);

  await formatFile(filePath);

  console.log(`Generated validator file: ${filePath}`);
}
