/**
 * In this module we took care of the definition of our routes, with parameters, children and component related to them
 * @module routes
 */

/**
 * Routes are all defined here
 */
/* istanbul ignore file */
export default (store) => {
  return [
    {
      path: `/`,
      beforeEnter: async (to, from, next) => {
        const userSignedIn = await store.dispatch("checkSession")
        if (userSignedIn) {
          next("/notifications")
        } else {
          next("/cosmos-hub/portfolio")
        }
      },
    },
    {
      path: `/networks`,
      name: `networks`,
      component: () => import(`./components/network/PageNetworks`),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: `/notification-wall`,
      name: `notification-wall`,
      components: {
        session: () => import(`./components/account/Paywall`),
      },
    },
    {
      path: `/notifications`,
      name: `notifications`,
      components: {
        session: () => import(`./components/notifications/PageNotifications`),
      },
      meta: {
        feature: "notifications",
      },
    },
    {
      path: `/login`,
      name: `login`,
      components: {
        session: () => import(`./components/session/TmSessionSignIn`),
      },
      meta: {
        feature: "session",
      },
    },
    {
      path: `/select-network`,
      name: `select-network`,
      components: {
        session: () => import(`./components/common/TmSelectNetwork`),
      },
      meta: {
        feature: "session",
      },
    },
    {
      path: `/select-network/recover`,
      name: `select-network-recover`,
      components: {
        session: () => import(`./components/common/TmSelectNetwork`),
      },
      meta: {
        feature: "session",
      },
    },
    {
      path: `/select-network/create`,
      name: `select-network-create`,
      components: {
        session: () => import(`./components/common/TmSelectNetwork`),
      },
      meta: {
        feature: "session",
      },
    },
    {
      path: `/create`,
      name: `create`,
      components: {
        session: () => import(`./components/session/TmSessionSignUp`),
      },
      meta: {
        feature: "session",
      },
    },
    {
      path: `/create/password`,
      name: `create-password`,
      components: {
        session: () => import(`./components/session/TmSessionSignUpPassword`),
      },
      meta: {
        feature: "session",
      },
      beforeEnter: (to, from, next) => {
        if (from.name === `create`) {
          next()
        } else {
          next({ path: `/create` })
        }
      },
    },
    {
      path: `/create/confirm`,
      name: `create-confirm`,
      components: {
        session: () => import(`./components/session/TmSessionSignUpSeed`),
      },
      meta: {
        feature: "session",
      },
      beforeEnter: (to, from, next) => {
        if (from.name === `create-password`) {
          next()
        } else {
          next({ path: `/create` })
        }
      },
    },
    {
      path: `/recover`,
      name: `recover`,
      components: {
        session: () => import(`./components/session/TmSessionImport`),
      },
      meta: {
        feature: "session",
      },
    },
    {
      path: `/recover/name`,
      name: `recover-name`,
      components: {
        session: () => import(`./components/session/TmSessionImportName`),
      },
      meta: {
        feature: "session",
      },
      beforeEnter: (to, from, next) => {
        if (from.name === `recover`) {
          next()
        } else {
          next({ path: `/recover` })
        }
      },
    },
    {
      path: `/recover/password`,
      name: `recover-password`,
      components: {
        session: () => import(`./components/session/TmSessionImportPassword`),
      },
      meta: {
        feature: "session",
      },
      beforeEnter: (to, from, next) => {
        if (from.name === `recover-name`) {
          next()
        } else {
          next({ path: `/recover` })
        }
      },
    },
    {
      path: `/explore`,
      name: `explore`,
      components: {
        session: () => import(`./components/session/TmSessionExplore`),
      },
      meta: {
        feature: "session",
      },
    },
    {
      path: `/ledger`,
      name: `ledger`,
      components: {
        session: () => import(`./components/session/TmSessionHardware`),
      },
      meta: {
        feature: "session",
      },
    },
    {
      path: `/extension/:address/:network`,
      name: `extension-signin`,
      beforeEnter: function (to, from, next) {
        /* istanbul ignore next */
        return extensionSignIn({ to, from, next }, store)
      },
    },
    {
      path: `/extension`,
      name: `extension`,
      components: {
        session: () => import(`./components/session/TmSessionExtension`),
      },
      meta: {
        feature: "session",
      },
    },
    { path: `/404`, component: () => import(`./components/common/Page404`) },
    {
      path: `/privacy`,
      beforeEnter() {
        location.href = `https://lunie.io/privacy`
      },
    },
    {
      path: `/terms`,
      beforeEnter() {
        location.href = `https://lunie.io/terms`
      },
    },
    {
      path: `/security`,
      beforeEnter() {
        location.href = `https://lunie.io/security`
      },
    },
    {
      path: `/about`,
      beforeEnter() {
        location.href = `https://lunie.io/about`
      },
    },
    {
      path: `/careers`,
      beforeEnter() {
        location.href = `https://angel.co/company/lunie`
      },
    },
    {
      path: `/feature-not-available/:feature`,
      component: () => import(`./components/common/PageFeatureNotAvailable`),
      props: true,
      meta: {
        networkSpecificRoute: true,
      },
    },
    {
      path: `/feature-not-present/:feature`,
      component: () => import(`./components/common/FeatureNotPresent`),
    },
    {
      path: `/sign-up-email`,
      name: `sign-in-modal`,
      component: require("account/SignInModal").default,
    },
    {
      path: `/magic-link`,
      name: `magic-link-sent`,
      component: require("account/MagicLinkSentModal").default,
    },
    {
      path: `/reveal/:address`,
      name: `reveal`,
      component: require("account/RevealSeedModal").default,
    },
    {
      path: `/delete/:address/:addressNetworkId`,
      name: `delete`,
      component: require("account/ForgetAccountModal").default,
    },
    {
      path: `/email-authentication`,
      name: `email-authentication`,
      component: () => import(`./components/account/EmailAuthentication`),
    },
    {
      path: `/welcome`,
      name: `welcome`,
      component: () => import(`./components/common/CardSignInRequired`),
      meta: {
        networkSpecificRoute: true,
      },
    },
    {
      path: `/manage-accounts`,
      name: `manage-accounts-modal`,
      component: () => import(`./components/account/ManageAccountsModal`),
      meta: {
        networkSpecificRoute: true,
      },
    },
    {
      path: `/:networkId`,
      component: () => import(`./components/common/NetworkSetter`),
      redirect: `/:networkId/portfolio`,
      children: [
        {
          path: `proposals`,
          name: `proposals`,
          meta: {
            feature: "proposals",
            networkSpecificRoute: true,
          },
          component: () => import(`./components/governance/PageProposals`),
        },
        // for deprecated routes
        {
          path: `governance/proposals`,
          redirect: `/proposals`,
        },
        {
          path: `proposals/:proposalId`,
          name: `proposal`,
          meta: {
            feature: "proposals",
            networkSpecificRoute: true,
          },
          component: () => import(`./components/governance/PageProposal`),
        },
        // for deprecated routes
        {
          path: `governance/proposals/:proposalId`,
          redirect: `/proposals/:proposalId`,
        },
        {
          path: `validators`,
          name: `validators`,
          meta: {
            feature: "validators",
            networkSpecificRoute: true,
          },
          component: () => import(`./components/staking/PageValidators`),
        },
        // for deprecated routes
        {
          path: `staking/validators`,
          redirect: `/validators`,
        },
        {
          path: `validators/:validator`,
          name: `validator`,
          meta: {
            feature: "validators",
            networkSpecificRoute: true,
          },
          component: () => import(`./components/staking/PageValidator`),
        },
        {
          path: `staking/validators/:validator`,
          redirect: `/validators/:validator`,
        },
        {
          path: `portfolio`,
          name: `portfolio`,
          component: () => import(`./components/common/PagePortfolio`),
          meta: {
            requiresAuth: true,
            feature: "portfolio",
            networkSpecificRoute: true,
          },
        },
        {
          path: `transactions`,
          name: `transactions`,
          component: () => import(`./components/transactions/PageTransactions`),
          meta: {
            requiresAuth: true,
            feature: "activity",
            networkSpecificRoute: true,
          },
        },
        {
          path: `blocks/:height`,
          name: `block`,
          component: () => import(`./components/network/PageBlock`),
          meta: {
            feature: "blocks",
            networkSpecificRoute: true,
          },
        },
        { path: `*`, component: () => import(`./components/common/Page404`) },
      ],
    },
  ]
}

// handle direct sign in from the extension via deeplink
export async function extensionSignIn({ to, next }, store) {
  let network = store.getters.networks.find(
    ({ id }) => id === to.params.network
  )

  await store.dispatch(`signIn`, {
    sessionType: `extension`,
    address: to.params.address,
    networkId: to.params.network,
  })
  next(`/${network.slug}/portfolio`)
}
