/* global RSSParser */
import "rss-parser/dist/rss-parser.min.js"

const state = {
  posts: []
}

const mutations = {
  async initializeBlog(state) {
    const parser = new RSSParser()
    const RSS_URL = "https://medium.com/feed/cosmos-blockchain"
    const PROXY_URL = "https://cors.testnets.interblock.io/"
    const FULL_URL = PROXY_URL + RSS_URL

    let feed = await parser.parseURL(FULL_URL)
    state.posts = feed.items
  }
}

export default { state, mutations }
