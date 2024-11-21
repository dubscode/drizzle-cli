import { Config, getConfig, saveConfig } from '@/config.ts';
import { Confirm, Input } from '@cliffy/prompt';

// cli.ts
import { Command } from '@cliffy/command';
import { ensureDir } from '@std/fs';
import { generateSchema } from '@/generators/schema.ts';

const cli = new Command()
  .name('drizzle-cli')
  .version('0.1.0')
  .description('A CLI tool for scaffolding Drizzle ORM files');

cli
  .command('generate')
  .description('Generate files for a new table/model')
  .action(async () => {
    const config = await getConfig();
    const tableName = await Input.prompt('Enter the table name:');
    await generateSchema(config, tableName);
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
        schemaDir: await Input.prompt({
          message: 'Enter the schema directory:',
          default: config.schemaDir,
        }),
        typesDir: await Input.prompt({
          message: 'Enter the types directory:',
          default: config.typesDir,
        }),
        validationsDir: await Input.prompt({
          message: 'Enter the validations directory:',
          default: config.validationsDir,
        }),
        apisDir: await Input.prompt({
          message: 'Enter the APIs directory:',
          default: config.apisDir,
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
      schemaDir: await Input.prompt({
        message: 'Enter the schema directory:',
        default: existingConfig.schemaDir,
      }),
      typesDir: await Input.prompt({
        message: 'Enter the types directory:',
        default: existingConfig.typesDir,
      }),
      validationsDir: await Input.prompt({
        message: 'Enter the validations directory:',
        default: existingConfig.validationsDir,
      }),
      apisDir: await Input.prompt({
        message: 'Enter the APIs directory:',
        default: existingConfig.apisDir,
      }),
    };

    await saveConfig(config);
    console.log('Configuration file created/updated successfully.');

    const createDirs = await Confirm.prompt(
      'Do you want to create the specified directories?'
    );
    if (createDirs) {
      await ensureDir(config.schemaDir);
      await ensureDir(config.typesDir);
      await ensureDir(config.validationsDir);
      await ensureDir(config.apisDir);
      console.log('Directories created successfully.');
    }
  });

if (import.meta.main) {
  await cli.parse(Deno.args);
}
