const { RESTDataSource } = require('apollo-datasource-rest')
const crypto = require('crypto')

class GraphQLDataSource extends RESTDataSource {
  constructor(api_url) {
    super()
    this.cacheKey = 0
    this.baseURL = removeLastRoute(api_url)
    this.endpoint = api_url
  }

  willSendRequest(request) {
    request.headers.set('Content-Type', 'application/json')
  }

  async query(query) {
    const data = await this.post(this.endpoint, {
      query: `query {
        ${query}
      }`
    })
    if (data.errors) {
      throw new Error(data.errors.map(({ message }) => message).join('\n'))
    }
    return data.data
  }

  // TODO test if needed
  cacheKeyFor(request) {
    const requestHash = hash(request.body.toString())
    return `${request.url}_${requestHash}`
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

function hash(string) {
  const hash = crypto.createHash('sha256')
  hash.update(string)
  return hash.digest('hex')
}

// removes the last part of the url
// i.e. www.cool.de/x/y > www.cool.de/x
function removeLastRoute(url) {
  let gqlUrl = new URL(url)
  gqlUrl.pathname = `/subgraphs/name/livepeer` // DEPRECATED
  return gqlUrl.href
}

module.exports = {
  GraphQLDataSource
}
