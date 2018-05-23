import getJson from "scripts/getJson"
let url =
  "https://api.github.com/repos/tendermint/aib-data/contents/json/events.json"

const state = {
  all: []
}

const mutations = {
  async initializeEvents(state) {
    state.all = await getJson(url)
  }
}

export default { state, mutations }
