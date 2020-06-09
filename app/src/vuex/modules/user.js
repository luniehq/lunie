import config from "src/../config"
import firebase from "../../firebase"
import * as Sentry from "@sentry/browser"

const Auth = firebase.auth()

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
      Auth.signInWithEmailAndPassword(user.email, user.password)
        .then(() => {
          commit(`userSignedIn`, true)
          commit(`setUserInformation`, user)
          console.log("User is now signed in!")
        })
        .catch((error) => {
          console.error(error)
          Sentry.captureException(error)
        })
    },
    userSignedOut({ commit }) {
      Auth.signOut()
        .then(() => {
          commit(`userSignedIn`, false)
          console.log("User is now signed in!")
        })
        .catch((error) => {
          console.error(error)
          Sentry.captureException(error)
        })
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
