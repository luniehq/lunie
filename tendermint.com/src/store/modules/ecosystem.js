import getJson from "scripts/getJson"
let url =
  "https://api.github.com/repos/tendermint/aib-data/contents/json/ecosystem.json"

const state = { data: {} }

const mutations = {
  async initEcosystem(state) {
    state.data = await getJson(url)
  }
}

export default { state, mutations }
