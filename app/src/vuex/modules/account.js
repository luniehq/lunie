import getFirebase from "../../firebase.js"
import * as Sentry from "@sentry/browser"
import gql from "graphql-tag"

export default ({ apollo }) => {
  const state = {
    userSignedIn: false,
    user: null,
    signInError: null,
  }

  const mutations = {
    userSignedIn(state, hasSignedIn) {
      state.userSignedIn = hasSignedIn
    },
    setUserInformation(state, user) {
      state.user = user
    },
    setSignInError(state, error) {
      state.signInError = error
    },
  }

  const actions = {
    async listenToAuthChanges({ dispatch, commit }) {
      const Auth = (await getFirebase()).auth()
      // start listening for idToken changes too
      await dispatch(`listenToIdTokenChanges`)
      await new Promise((resolve) =>
        Auth.onAuthStateChanged(async (user) => {
          if (user) {
            commit(`userSignedIn`, true)
            commit(`setUserInformation`, user)

            const idToken = await user.getIdToken(/* forceRefresh */ true)
            localStorage.setItem(`auth_token`, idToken)
            // make sure new authorization token get added to header
            apollo.cache.reset()
          } else {
            localStorage.removeItem(`auth_token`)
            commit(`userSignedIn`, false)
            commit(`setUserInformation`, null)
          }
          resolve()
        })
      )
    },
    async listenToIdTokenChanges({ commit }) {
      const Auth = (await getFirebase()).auth()
      await new Promise((resolve) =>
        Auth.onIdTokenChanged(async (user) => {
          commit(`setUserInformation`, user)
          // user is already signed in since we are handling that with onAuthStateChanged
          if (user) {
            // retrieving refreshed idToken
            const idToken = await user.getIdToken(/* forceRefresh */ true)

            // really important part, store idToken in localstorage so Apollo gets the newest
            localStorage.setItem(`auth_token`, idToken)
            // make sure new authorization token get added to header
            apollo.cache.reset()
          }
          resolve()
        })
      )
    },
    async signInUser({ commit }) {
      const Auth = (await getFirebase()).auth()
      if (Auth.isSignInWithEmailLink(window.location.href)) {
        const user = JSON.parse(localStorage.getItem(`user`))
        try {
          await Auth.signInWithEmailLink(user.email, window.location.href)
          const idToken = await Auth.currentUser.getIdToken(
            /* forceRefresh */ true
          )
          apollo.mutate({
            mutation: gql`
              mutation {
                registerUser(idToken:"${idToken}")
              }
            `,
          })
        } catch (error) {
          console.error(error)
          commit(`setSignInError`, error)
          Sentry.captureException(error)
        }
      }
    },
    async sendUserMagicLink({ commit }, { user }) {
      const Auth = (await getFirebase()).auth()
      const actionCodeSettings = {
        url: `${window.location.protocol}//${window.location.host}/email-authentication`,
        handleCodeInApp: true,
      }
      try {
        await Auth.sendSignInLinkToEmail(user.email, actionCodeSettings)
        localStorage.setItem("user", JSON.stringify(user))
      } catch (error) {
        commit(`setSignInError`, error)
        Sentry.captureException(error)
      }
    },
    async signOutUser({ commit }) {
      const Auth = (await getFirebase()).auth()
      try {
        await Auth.signOut()
        localStorage.removeItem(`auth_token`)
        // get rid of cached token in header
        apollo.cache.reset()
      } catch (error) {
        commit(`setSignInError`, error)
        Sentry.captureException(error)
      }
    },
  }

  return {
    state,
    mutations,
    actions,
  }
}
