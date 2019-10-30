// HACK! Stupid Apollo doesn't support proper caching logic
// This appends the cache key of every request by the height so that every new block serves fresh data

const { RESTDataSource } = require('apollo-datasource-rest')

class PerBlockCacheDataSource extends RESTDataSource {
  constructor() {
    super()
    this.cacheKey = 0
  }

  cacheKeyFor(request) {
    return `${request.url}_${this.blockHeight}`
  }
}

module.exports = {
  PerBlockCacheDataSource
}
