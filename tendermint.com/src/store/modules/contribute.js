import axios from "axios"

// example GitHub API call for tendermint/tendermint issues
// let url = 'https://api.github.com/repos/tendermint/tendermint/issues?state=open&labels=help+wanted&per_page=100'
//
let url =
  'https://api.github.com/search/issues?q=is%3Aopen+is%3Aissue+user%3Atendermint+label%3A"help+wanted"'

const state = {
  issues: []
}

const mutations = {
  async initializeContribute(state) {
    let items = (await axios.get(url)).data.items
    state.issues = items
  }
}

export default { state, mutations }
