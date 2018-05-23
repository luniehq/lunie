import getJson from "scripts/getJson"

let url =
  "https://api.github.com/repos/tendermint/aib-data/contents/json/people.json"

const state = { all: [] }

const mutations = {
  async initializePeople(state) {
    state.all = await getJson(url)
  }
}

export default { state, mutations }
