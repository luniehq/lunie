import config from "src/../config"
import firebase from "../../firebase"
import * as Sentry from "@sentry/browser"

const Auth = firebase.auth()

export default () => {
  const state = {
    userSignedIn: false,
    user: {
      email: "",
    },
    signInError: null,
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
    setSignInError(state, error) {
      state.signInError = error
    },
  }

  const actions = {
    signInUser({ commit }, { user }) {
      commit(`userSignedIn`, true)
      commit(`setUserInformation`, user)
      console.log("User is now signed in!")
    },
    sendUserMagicLink({ commit }, { user }) {
      const actionCodeSettings = {
        url: `http://localhost:9080/email-authentication`,
        handleCodeInApp: true,
      }
      Auth.sendSignInLinkToEmail(user.email, actionCodeSettings)
        .then(() => {
          commit(`setUserInformation`, user)
          localStorage.setItem("user", user)
          console.log("Magic link sent to your email!")
        })
        .catch((error) => {
          console.error(error)
          commit(`setSignInError`, error)
          Sentry.captureException(error)
        })
    },
    signOutUser({ commit }) {
      Auth.signOut()
        .then(() => {
          commit(`userSignedIn`, false)
          commit(`setUserInformation`, {})
          console.log("User is now signed out!")
        })
        .catch((error) => {
          console.error(error)
          commit(`setSignInError`, error)
          Sentry.captureException(error)
        })
    },
  }

  return {
    state,
    mutations,
    actions,
  }
}
