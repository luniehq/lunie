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

  clearMemory() {    
    // The memoizedResults map used for caching requests is never
    // cleared automatically. The RESTDataSource assumes it will be
    // created a new for each request.
    // We maintain instances for parsing new block events on a network,
    // so we have a need to call this manually.
    this.memoizedResults.clear()
  }
}

module.exports = {
  PerBlockCacheDataSource
}
