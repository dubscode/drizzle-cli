import { exists } from '@std/fs';

export interface Config {
  dbDir: string;
  defaultIdType: 'integer' | 'uuid';
  resourcesDir: string;
  schemaDir: string;
}

const defaultConfig: Config = {
  dbDir: 'lib/db',
  defaultIdType: 'integer',
  resourcesDir: 'lib/resources',
  schemaDir: 'lib/db/schema',
};

export async function getConfig(): Promise<Config> {
  const configPath = './drizzle-cli-config.ts';
  if (await exists(configPath)) {
    const { config } = await import(configPath);
    return config;
  }
  return defaultConfig;
}

export async function saveConfig(config: Config): Promise<void> {
  const configPath = './drizzle-cli-config.ts';
  const configContent = `
// This file is auto-generated. Do not edit it directly.

export interface Config {
  dbDir: string;
  defaultIdType: 'integer' | 'uuid';
  resourcesDir: string;
  schemaDir: string;
}

export const config: Config = ${JSON.stringify(config, null, 2)};
`;
  await Deno.writeTextFile(configPath, configContent);
}
