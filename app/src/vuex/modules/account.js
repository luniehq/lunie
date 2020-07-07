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
    async listenToAuthChanges({ commit }) {
      const Auth = (await getFirebase()).auth()
      await Auth.onAuthStateChanged(async (user) => {
        if (user) {
          commit(`userSignedIn`, true)
          commit(`setUserInformation`, user)

          await actions.updateProfilePicture()

          const idToken = await user.getIdToken(/* forceRefresh */ true)
          localStorage.setItem(`auth_token`, idToken)
          // make sure new authorization token get added to header
          apollo.cache.reset()

          console.log("User is now signed in!")
        } else {
          commit(`userSignedIn`, false)
          commit(`setUserInformation`, null)
          console.log("User is now signed out!")
        }
      })
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
        console.log("Magic link sent to your email!")
      } catch (error) {
        console.log(error)
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
        console.error(error)
        commit(`setSignInError`, error)
        Sentry.captureException(error)
      }
    },
    // TODO: it should only run on sign up
    async updateProfilePicture() {
      const Auth = (await getFirebase()).auth()
      try {
        const user = Auth.currentUser
        await user.updateProfile({
          photoURL: `${config.digitalOceanURL}/users/${user.email}.png`,
        })
        console.log(`Succesfully updated user's avatar`)
      } catch (error) {
        console.error(error)
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
