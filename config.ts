import { exists } from '@std/fs';
import { join } from '@std/path';

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

// Get config path relative to current working directory
function getConfigPath(): string {
  return join(Deno.cwd(), 'drizzle-cli-config.ts');
}

export async function getConfig(): Promise<Config> {
  const configPath = getConfigPath();
  if (await exists(configPath)) {
    try {
      const fileContent = await Deno.readTextFile(configPath);
      // Parse the config file content manually instead of using dynamic import
      const configMatch = fileContent.match(
        /export const config = ({[\s\S]*?});/
      );
      if (configMatch) {
        try {
          const parsedConfig = JSON.parse(configMatch[1]);
          return parsedConfig as Config;
        } catch {
          console.warn('Failed to parse config file, using default config');
          return defaultConfig;
        }
      }
    } catch (error) {
      console.error('Error reading config file:', error);
      return defaultConfig;
    }
  }
  return defaultConfig;
}

export async function saveConfig(config: Config): Promise<void> {
  const configPath = getConfigPath();
  const configContent = `
// This file is auto-generated. Do not edit it directly.

export interface Config {
  dbDir: string;
  defaultIdType: 'integer' | 'uuid';
  resourcesDir: string;
  schemaDir: string;
}

export const config = ${JSON.stringify(config, null, 2)};
`;

  // Ensure the directory exists
  try {
    await Deno.mkdir(Deno.cwd(), { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }

  await Deno.writeTextFile(configPath, configContent);
}
