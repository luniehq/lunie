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
      redirect: `/cosmos-hub/portfolio`,
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
      path: `/paywall`,
      name: `paywall`,
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
        session: () => import(`./components/common/TmSessionSignIn`),
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
        session: () => import(`./components/common/TmSessionSignUp`),
      },
      meta: {
        feature: "session",
      },
    },
    {
      path: `/create/password`,
      name: `create-password`,
      components: {
        session: () => import(`./components/common/TmSessionSignUpPassword`),
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
        session: () => import(`./components/common/TmSessionSignUpSeed`),
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
        session: () => import(`./components/common/TmSessionImport`),
      },
      meta: {
        feature: "session",
      },
    },
    {
      path: `/recover/name`,
      name: `recover-name`,
      components: {
        session: () => import(`./components/common/TmSessionImportName`),
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
        session: () => import(`./components/common/TmSessionImportPassword`),
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
        session: () => import(`./components/common/TmSessionExplore`),
      },
      meta: {
        feature: "session",
      },
    },
    {
      path: `/ledger`,
      name: `ledger`,
      components: {
        session: () => import(`./components/common/TmSessionHardware`),
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
        session: () => import(`./components/common/TmSessionExtension`),
      },
      meta: {
        feature: "session",
      },
    },
    { path: `/404`, component: () => import(`./components/common/Page404`) },
    {
      path: `/privacy`,
      component: () => import(`./components/common/PagePrivacy`),
    },
    {
      path: `/terms`,
      component: () => import(`./components/common/PageTerms`),
    },
    {
      path: `/security`,
      component: () => import(`./components/common/PageSecurity`),
    },
    {
      path: `/about`,
      component: () => import(`./components/common/PageAbout`),
    },
    {
      path: `/careers`,
      component: () => import(`./components/common/PageCareers`),
    },
    {
      path: `/feature-not-available/:feature`,
      component: () => import(`./components/common/PageFeatureNotAvailable`),
      props: true,
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
      path: `/email-authentication`,
      name: `email-authentication`,
      component: () => import(`./components/account/EmailAuthentication`),
    },
    {
      path: `/welcome`,
      name: `welcome`,
      component: () => import(`./components/common/CardSignInRequired`),
    },
    {
      path: `/:networkId`,
      component: () => import(`./components/common/NetworkSetter`),
      redirect: `/:networkId/portfolio`,
      children: [
        {
          path: `proposals`,
          name: `Proposals`,
          meta: {
            feature: "proposals",
          },
          component: () => import(`./components/governance/PageProposals`),
        },
        // for depredecated routes
        {
          path: `governance/proposals`,
          redirect: `/proposals`,
        },
        {
          path: `proposals/:proposalId`,
          name: `Proposal`,
          meta: {
            feature: "proposals",
          },
          component: () => import(`./components/governance/PageProposal`),
          props: true,
        },
        // for depredecated routes
        {
          path: `governance/proposals/:proposalId`,
          redirect: `/proposals/:proposalId`,
        },
        {
          path: `validators`,
          name: `Validators`,
          meta: {
            feature: "validators",
          },
          component: () => import(`./components/staking/PageValidators`),
        },
        // for depredecated routes
        {
          path: `staking/validators`,
          redirect: `/validators`,
        },
        {
          path: `validators/:validator`,
          name: `validator`,
          meta: {
            feature: "validators",
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
          component: () => import(`./components/wallet/PagePortfolio`),
          meta: {
            requiresAuth: true,
            feature: "portfolio",
          },
        },
        {
          path: `transactions`,
          name: `transactions`,
          component: () => import(`./components/wallet/PageTransactions`),
          meta: {
            requiresAuth: true,
            feature: "activity",
          },
        },
        {
          path: `blocks/:height`,
          name: `block`,
          component: () => import(`./components/network/PageBlock`),
          meta: {
            feature: "blocks",
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
