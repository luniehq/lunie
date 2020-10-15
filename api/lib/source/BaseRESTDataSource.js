const { RESTDataSource, HTTPCache } = require('apollo-datasource-rest')
const { InMemoryLRUCache } = require('apollo-server-caching')

module.exports.BaseRESTDataSource = class BaseRESTDataSource extends RESTDataSource {
  constructor() {
    super()
    // manually set cache to checking it
    this.cache = new InMemoryLRUCache()
    this.httpCache = new HTTPCache(this.cache, this.httpFetch)
  }

  async getRetry(url, intent = 0) {
    // check cache size, and flush it if it's bigger than something
    if ((await this.cache.getTotalSize()) > 100000) {
      await this.cache.flush()
    }
    // clearing memoizedResults
    this.memoizedResults.clear()
    try {
      return await this.get(url, null, { cacheOptions: { ttl: 1 } }) // normally setting cacheOptions should be enought, but...
    } catch (error) {
      // give up
      if (intent >= 3) {
        console.error(
          `Error for query ${url} in network ${this.networkId} (tried 3 times)`
        )
        throw error
      }

      // retry
      await new Promise((resolve) => setTimeout(() => resolve(), 1000))
      return this.getRetry(url, intent + 1)
    }
  }

  // querying data from the cosmos REST API
  // is overwritten in cosmos v2 to extract from a differnt result format
  // some endpoints /blocks and /txs have a different response format so they use this.get directly
  async query(url) {
    return this.getRetry(url)
  }
}
