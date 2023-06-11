type EnvironmentValues<T> = {
  dev?: T;
  production?: T;
  local?: T;
  default?: T;
};

type Configs = {
  apiKey: EnvironmentValues<string>;
  dbTableName: EnvironmentValues<string>;
};

const config: Configs = {
  apiKey: { default: 'asdfasdfasd' },
  dbTableName: { default: 'pet-shop' },
};

export const get = <K extends keyof Configs>(
  key: K
): Configs[K] extends EnvironmentValues<infer T> ? T : never => {
  const environment = process.env['NODE_ENV'] || 'local';
  const value = config[key];

  if (value === undefined) {
    throw new Error(`Configuration value not found for key: ${key}`);
  }

  const environmentValue = value[
    environment as keyof typeof value
  ] as Configs[K] extends EnvironmentValues<infer T> ? T : never;
  const defaultValue = value.default as Configs[K] extends EnvironmentValues<
    infer T
  >
    ? T
    : never;

  if (!environmentValue && !defaultValue) {
    throw new Error(`Configuration value not found for key: ${key}`);
  }

  return environmentValue || defaultValue;
};
