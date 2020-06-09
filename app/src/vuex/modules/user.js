// import App from "../../firebase/app"

export default () => {
  const state = {
    userSignedIn: false,
    user: {
      name: "",
    },
    externals: {
      config,
    },
  }

  const mutations = {
    userSignedIn(state, hasSignedIn) {
      state.signedIn = hasSignedIn
    },
    setUserInformation(state, user) {
      state.user = user
    },
  }

  const actions = {
    userSignedIn({ commit }, { user }) {
      commit(`userSignedIn`, true)
      commit(`setUserInformation`, user)
      console.log("User is now signed in!")
    },
    userSignedOut({ commit }) {
      commit(`userSignedIn`, false)
      console.log("User is now signed in!")
    },
    async signInUser() {
      console.log("Display magic link to authentication via firebase")
    },
    async signOutUser({ commit }) {
      commit(`setUserInformation`, {})
      console.log("Triggers Firebase sign out and removes the set user")
    },
  }

  return {
    state,
    mutations,
    actions,
  }
}
