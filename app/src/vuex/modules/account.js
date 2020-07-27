import * as Sentry from "@sentry/browser"
import gql from "graphql-tag"
import { Plugins } from "@capacitor/core"
const { App: CapacitorApp } = Plugins
import getFirebase from "../../firebase.js"
import config from "../../../config"

export default ({ apollo }) => {
  const state = {
    userSignedIn: false,
    user: null,
    signInEmailError: null,
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
    setSignInEmailError(state, error) {
      state.signInEmailError = error
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
    async signInUser({ commit }, url) {
      commit(`setSignInError`, undefined)
      const Auth = (await getFirebase()).auth()
      try {
        if (Auth.isSignInWithEmailLink(url)) {
          const user = JSON.parse(localStorage.getItem(`user`))
          if (!user)
            throw new Error("Sign in flow broken. User E-Mail is unknown.")
          await Auth.signInWithEmailLink(user.email, url)

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
        }
      } catch (error) {
        console.error(error)
        Sentry.captureException(error)
        commit(`setSignInError`, error)
      }
    },
    async sendUserMagicLink({ commit }, { user }) {
      commit(`setSignInEmailError`, undefined)
      const Auth = (await getFirebase()).auth()
      const actionCodeSettings = {
        url: config.mobileApp
          ? `https://app.lunie.io/email-authentication`
          : `${window.location.protocol}//${window.location.host}/email-authentication`,
        handleCodeInApp: true,
        android: {
          packageName: `org.lunie.lunie`,
          installApp: true,
          minimumVersion: `1.0.221`, // the first version with deep linking enabled
        },
        iOS: {
          bundleId: `1475911030.org.lunie.lunie`,
        },
      }
      try {
        await Auth.sendSignInLinkToEmail(user.email, actionCodeSettings)
        localStorage.setItem("user", JSON.stringify(user))
      } catch (error) {
        commit(`setSignInEmailError`, error)
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

export async function getLaunchUrl(router) {
  const urlOpen = await CapacitorApp.getLaunchUrl()
  if (!urlOpen || !urlOpen.url) return
  handleDeeplink(urlOpen.url, router)
}

export function handleDeeplink(url, router) {
  console.log("Received deeplink " + url)

  // Example url: https://app.lunie.io?link=www.google.com
  const regexp = /^https:\/\/[\w\d-\.]+(\/([\w\d-\/]+))?(\?(.+))?/
  const matches = regexp.exec(url)
  const path = matches[2]
  const query = matches[4]

  const queryObject = query
    .split("&")
    .map((keyValue) => keyValue.split("="))
    .reduce((query, [key, value]) => {
      query[key] = value
      return query
    }, {})

  // if we receive a deeplink for firebase authentication we follow that link
  if (queryObject.link) {
    window.open(unescape(queryObject.link), "_blank")
    return
  }

  try {
    // change the route to the route we got from the deeplink
    router.push({
      path: "/" + path,
      query: queryObject,
    })
  } catch (error) {
    console.error(error)
  }
}
