import Config from '../index'

describe('Config', () => {
  it('get function retrieves the correct value for the given environment', () => {
    process.env['NODE_ENV'] = 'local'

    const config = new Config({
      apiKey: { default: 'default-api-key', local: 'local-api-key', production: 'prod-api-key' },
      dbTableName: { default: 'default-db', local: 'local-db', production: 'prod-db' },
    })

    expect(config.get('apiKey')).toBe('local-api-key')
    expect(config.get('dbTableName')).toBe('local-db')
  })

  it('get function retrieves the default value if the environment-specific value is not found', () => {
    process.env['NODE_ENV'] = 'unknown'

    const config = new Config({
      apiKey: { default: 'default-api-key', local: 'local-api-key', production: 'prod-api-key' },
      dbTableName: { default: 'default-db', local: 'local-db', production: 'prod-db' },
    })

    expect(config.get('apiKey')).toBe('default-api-key')
    expect(config.get('dbTableName')).toBe('default-db')
  })

  it('get function throws an error if neither the environment-specific value nor the default value is found', () => {
    process.env['NODE_ENV'] = 'unknown'

    const config = new Config({
      apiKey: { local: 'local-api-key', production: 1 },
    })

    expect(() => config.get('apiKey')).toThrow(`Configuration value not found for key: apiKey`)
  })

  it('get function throws an error if the config has not been initialized', () => {
    const config = new Config({})

    // @ts-ignore -- this is to test the error case where the config has not been initialized
    expect(() => config.get('apiKey')).toThrow('Configuration value not found for key: apiKey')
  })

  it('get function throws an error if the key does not exist', () => {
    process.env['NODE_ENV'] = 'local'

    const config = new Config({
      apiKey: { default: 'default-api-key', local: 'local-api-key', production: 'prod-api-key' },
      dbTableName: { default: 'default-db', local: 'local-db', production: 'prod-db' },
    })

    // @ts-ignore -- this is to test the error case where the key does not exist
    expect(() => config.get('nonExistingKey')).toThrow('Configuration value not found for key: nonExistingKey')
  })
})
