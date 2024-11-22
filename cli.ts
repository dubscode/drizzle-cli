import { Config, getConfig, saveConfig } from '@/config.ts';
import { Confirm, Input, Select } from '@cliffy/prompt';
import { generateSchema, updateSchemaIndex } from '@/generators/schema.ts';

// cli.ts
import { Command } from '@cliffy/command';
import { ensureDir } from '@std/fs';
import { generateApis } from '@/generators/apis.ts';
import { generateColumnHelpers } from '@/generators/column.helpers.ts';
import { generateTypeDefinitions } from '@/generators/type-defintions.ts';
import { generateValidators } from '@/generators/validators.ts';

const cli = new Command()
  .name('drizzle-cli')
  .version('0.4.0')
  .description('A CLI tool for scaffolding Drizzle ORM files');

cli
  .command('generate')
  .description('Generate files for a new table/model')
  .action(async () => {
    const config = await getConfig();
    const tableName = await Input.prompt('Enter the table name:');
    await generateSchema(config, tableName);
    await updateSchemaIndex(config, tableName);
    await generateValidators(config, tableName);
    await generateTypeDefinitions(config, tableName);
    await generateApis(config, tableName);
    console.log('Schema generation complete.');
  });

cli
  .command('config')
  .description('View or update the CLI configuration')
  .action(async () => {
    const config = await getConfig();
    console.log('Current configuration:', config);
    const update = await Confirm.prompt(
      'Do you want to update the configuration?'
    );
    if (update) {
      const newConfig: Config = {
        dbDir: await Input.prompt({
          message: 'Enter the directory for your db client:',
          default: config.dbDir,
        }),
        defaultIdType: (await Select.prompt<'integer' | 'uuid'>({
          message: 'What data type should be used for IDs?',
          options: ['integer', 'uuid'],
          default: config.defaultIdType,
        })) as 'integer' | 'uuid',
        resourcesDir: await Input.prompt({
          message: 'Enter the resources directory:',
          default: config.resourcesDir,
        }),
        schemaDir: await Input.prompt({
          message: 'Enter the schema directory:',
          default: config.schemaDir,
        }),
      };

      await saveConfig(newConfig);
      console.log('Configuration updated successfully.');
    }
  });

cli
  .command('init')
  .description('Initialize or update the project configuration')
  .action(async () => {
    const existingConfig = await getConfig();
    const config: Config = {
      dbDir: await Input.prompt({
        message: 'Enter the directory for your db client:',
        default: existingConfig.dbDir,
      }),
      defaultIdType: (await Select.prompt<'integer' | 'uuid'>({
        message: 'What data type should be used for IDs?',
        options: ['integer', 'uuid'],
        default: existingConfig.defaultIdType,
      })) as 'integer' | 'uuid',
      resourcesDir: await Input.prompt({
        message: 'Enter the resources directory:',
        default: existingConfig.resourcesDir,
      }),
      schemaDir: await Input.prompt({
        message: 'Enter the schema directory:',
        default: existingConfig.schemaDir,
      }),
    };

    await saveConfig(config);
    console.log('Configuration file created/updated successfully.');

    const createDirs = await Confirm.prompt({
      message: 'Do you want to create the specified directories?',
      default: true,
    });
    if (createDirs) {
      await ensureDir(config.schemaDir);
      await ensureDir(config.dbDir);
      await ensureDir(config.resourcesDir);
      await generateColumnHelpers(config);
      console.log('Directories and column helpers created successfully.');
    }
  });

if (import.meta.main) {
  await cli.parse(Deno.args);
}
