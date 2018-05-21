let url =
  "https://raw.githubusercontent.com/tendermint/aib-data/master/json/links.json"

window
  .fetch(url)
  .then(response => response.json())
  .then(json => (state.data = json))

const state = {
  data: {
    tm: {
      blog: "",
      docs: {
        index: ""
      },
      github: {
        organization: ""
      }
    },
    cosmos: {
      reddit: "",
      community: {
        matrix: ""
      }
    }
  }
}

export default { state }
