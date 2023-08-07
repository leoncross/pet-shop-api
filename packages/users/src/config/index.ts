import Config from '@pet-shop-api/config'

export default new Config({
  apiKey: { default: 'default-api-key', local: 'local-api-key', production: 'prod-api-key' },
  dbTableName: { default: 'default-db', local: 'local-db', production: 'prod-db' },
})
