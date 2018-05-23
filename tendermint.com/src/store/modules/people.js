let url =
  "https://raw.githubusercontent.com/tendermint/aib-data/master/json/people.json"

fetch(url)
  .then(response => response.json())
  .then(json => (state.all = json))

const state = { all: "" }
export default { state }
