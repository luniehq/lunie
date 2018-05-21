import getJson from "scripts/getJson"

let url =
  "https://api.github.com/repos/tendermint/aib-data/contents/json/links.json"

const state = {
  data: {
    tm: {
      careers: ""
    },
    cosmos: {
      assets: {
        visualIdentity: ""
      },
      intro: {
        video: ""
      },
      github: {
        organization: ""
      },
      community: {
        telegram: ""
      },
      tm: {
        website: ""
      }
    }
  }
}

const mutations = {
  async initializeLinks(state) {
    state.data = await getJson(url)
  }
}

export default { state, mutations }
