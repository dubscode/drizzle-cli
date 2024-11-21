// config.ts
import { exists } from '@std/fs';

export interface Config {
  schemaDir: string;
  typesDir: string;
  validationsDir: string;
  apisDir: string;
}

const defaultConfig: Config = {
  schemaDir: 'lib/db/schema',
  typesDir: 'lib/types',
  validationsDir: 'lib/validations',
  apisDir: 'lib/apis',
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
  schemaDir: string;
  typesDir: string;
  validationsDir: string;
  apisDir: string;
}

export const config: Config = ${JSON.stringify(config, null, 2)};
`;
  await Deno.writeTextFile(configPath, configContent);
}
