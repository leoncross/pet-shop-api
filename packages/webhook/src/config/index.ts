import Config from '@pet-shop-api/config'

export default new Config({
  stripeApiKey: { default: 'key', local: 'key', production: 'key' },
  stripeSigningSecret: { default: 'secret', local: 'secret', production: 'secret' },
})
