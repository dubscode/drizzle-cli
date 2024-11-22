import { formatFile, standardizeName } from '@/utils.ts';

import { Config } from '@/config.ts';
import { ensureDir } from '@std/fs';
import { join } from '@std/path';

export async function generateApis(
  config: Config,
  tableName: string
): Promise<void> {
  const names = standardizeName(tableName);

  // model resource directory should be something like lib/resources/users
  const resourceDir = `${config.resourcesDir}/${names.kebabCase}`;
  await ensureDir(resourceDir);

  const fileName = `apis.ts`;
  const filePath = join(resourceDir, fileName);

  const idType = config.defaultIdType === 'uuid' ? 'string' : 'number';

  const apisContent = `
    import _ from 'lodash';
    import { db } from '@/${config.dbDir}';
    import { eq } from 'drizzle-orm';
    import { update${names.singularPascalCase}Schema } from '@/${config.resourcesDir}/${names.kebabCase}/validators';
    import { ${names.singularPascalCase}Input } from '@/${config.resourcesDir}/${names.kebabCase}/types';
    import { ${names.camelCase}Table } from '@/${config.schemaDir}';

    export async function create${names.singularPascalCase}(input: ${names.singularPascalCase}Input) {
      const data = update${names.singularPascalCase}Schema.parse(input);

      const insertData = _.omitBy(data, _.isNil);
      
      const [newRecord] = await db
        .insert(${names.camelCase}Table)
        .values(insertData)
        .returning();

      return newRecord;
    }

    export async function findById(id: ${idType}) {
      return await db.query.${names.camelCase}Table.findFirst({ where: eq(${names.camelCase}Table.id, id) });
    }

    export async function list${names.pascalCase}() {
      return await db.query.${names.camelCase}Table.findMany();
    }

    export async function removeById(id: ${idType}) {
      const [deletedRecord] = await db
        .delete(${names.camelCase}Table)
        .where(eq(${names.camelCase}Table.id, id))
        .returning();

      return deletedRecord;
    }

    export async function update${names.singularPascalCase}(input: ${names.singularPascalCase}Input) {
      const { id, ...data } = update${names.singularPascalCase}Schema.parse(input);

      if (!id) {
        throw new Error('ID is required to update a record')
      }

      const updateData = _.omitBy(data, _.isNil);
      
      const [updatedRecord] = await db
        .update(${names.camelCase}Table)
        .set(updateData)
        .where(eq(${names.camelCase}Table.id, id))
        .returning();

      return updatedRecord;
    }
  `;

  await Deno.writeTextFile(filePath, apisContent);

  await formatFile(filePath);

  console.log(`Generated apis file: ${filePath}`);
}
