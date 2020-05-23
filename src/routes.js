/**
 * In this module we took care of the definition of our routes, with parameters, children and component related to them
 * @module routes
 */

/**
 * Routes are all defined here
 */
export default (store) => {
  return [
    {
      path: `/networks`,
      name: `networks`,
      component: () => import(`./components/network/PageNetworks`),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: `/notifications`,
      name: `notifications`,
      components: {
        session: () => import(`./components/notifications/PageNotifications`),
      },
      // meta: {
      //   feature: "Notifications"
      // }
    },
    {
      path: `/login`,
      name: `login`,
      components: {
        session: () => import(`./components/common/TmSessionSignIn`),
      },
      meta: {
        feature: "Session",
      },
    },
    {
      path: `/select-network`,
      name: `select-network`,
      components: {
        session: () => import(`./components/common/TmSelectNetwork`),
      },
      meta: {
        feature: "Session",
      },
    },
    {
      path: `/select-network/recover`,
      name: `select-network-recover`,
      components: {
        session: () => import(`./components/common/TmSelectNetwork`),
      },
      meta: {
        feature: "Session",
      },
    },
    {
      path: `/select-network/create`,
      name: `select-network-create`,
      components: {
        session: () => import(`./components/common/TmSelectNetwork`),
      },
      meta: {
        feature: "Session",
      },
    },
    {
      path: `/create`,
      name: `create`,
      components: {
        session: () => import(`./components/common/TmSessionSignUp`),
      },
      meta: {
        feature: "Session",
      },
    },
    {
      path: `/create/password`,
      name: `create-password`,
      components: {
        session: () => import(`./components/common/TmSessionSignUpPassword`),
      },
      meta: {
        feature: "Session",
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
        feature: "Session",
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
        feature: "Session",
      },
    },
    {
      path: `/recover/name`,
      name: `recover-name`,
      components: {
        session: () => import(`./components/common/TmSessionImportName`),
      },
      meta: {
        feature: "Session",
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
        feature: "Session",
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
        feature: "Session",
      },
    },
    {
      path: `/ledger`,
      name: `ledger`,
      components: {
        session: () => import(`./components/common/TmSessionHardware`),
      },
      meta: {
        feature: "Session",
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
        feature: "Session",
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
      path: `/:networkId`,
      component: () => import(`./components/common/NetworkSetter`),
      redirect: `/:networkId/portfolio`,
      children: [
        {
          path: `proposals`,
          name: `Proposals`,
          meta: {
            feature: "Proposals",
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
            feature: "Proposals",
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
            feature: "Validators",
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
            feature: "Validators",
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
            feature: "Portfolio",
          },
        },
        {
          path: `transactions`,
          name: `transactions`,
          component: () => import(`./components/wallet/PageTransactions`),
          meta: {
            requiresAuth: true,
            feature: "Activity",
          },
        },
        {
          path: `blocks/:height`,
          name: `block`,
          component: () => import(`./components/network/PageBlock`),
          meta: {
            feature: "Explorer",
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
