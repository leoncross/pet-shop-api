export type EnvironmentValues<T> = {
  dev?: T
  production?: T
  local?: T
  default?: T
}
export default class Config<K> {
  private readonly config: K

  constructor(configs: K) {
    this.config = configs
  }

  get<T extends keyof K>(key: T): K[T] extends EnvironmentValues<infer U> ? U : never {
    if (!this.config) {
      throw new Error('Config not initialized')
    }
    const environment = process.env['NODE_ENV'] || 'local'
    const value = this.config[key]

    if (value === undefined) {
      throw new Error(`Configuration value not found for key: ${String(key)}`)
    }

    const environmentValue = (value as EnvironmentValues<any>)[
      environment as keyof EnvironmentValues<any>
    ] as K[T] extends EnvironmentValues<infer U> ? U : never

    const defaultValue = (value as EnvironmentValues<any>).default as K[T] extends EnvironmentValues<infer U>
      ? U
      : never

    if (!environmentValue && !defaultValue) {
      throw new Error(`Configuration value not found for key: ${String(key)}`)
    }

    return environmentValue || defaultValue
  }
}
