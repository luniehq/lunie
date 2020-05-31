var url = require('url')
const { RedisCache } = require('apollo-server-cache-redis')
const { RedisPubSub } = require('graphql-redis-subscriptions')
const Redis = require('ioredis')
const config = require('../config')

let redis_uri = url.parse(config.redis_url || '')
if (config.env === 'development') {
  redis_uri = {
    hostname: `localhost`,
    port: 6379
  }
}

const redisConfig = {
  host: redis_uri.hostname,
  port: redis_uri.port,
  password: redis_uri.auth && redis_uri.auth.split(':')[1]
}

function createCache() {
  return new RedisCache(redisConfig)
}

function createRedisPubSub() {
  return new RedisPubSub({
    publisher: new Redis(redisConfig),
    subscriber: new Redis(redisConfig)
  })
}

exports.createCache = createCache
exports.createRedisPubSub = createRedisPubSub
