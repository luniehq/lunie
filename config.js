require('dotenv').config()

const env = process.env.NODE_ENV || 'development'

module.exports = {
  env: env,
  port: process.env.PORT || '4000',
  apollo_engine_api_key: process.env.ENGINE_API_KEY || '',
  enable_cache: process.env.ENABLE_CACHE || false,
  redis_url: process.env.REDIS_URL || '',
  hasura_admin_key: process.env.HASURA_ADMIN_KEY || '',
  hasura_url: env == 'development' ? "https://staging-db.lunie.io/v1/graphql" : 'https://production-db.lunie.io/v1/graphql',
}
