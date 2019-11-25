/**
 * In this module we took care of the definition of our routes, with parameters, children and component related to them
 * @module routes
 */

/**
 * Routes are all defined here
 */
export default [
  {
    path: `/`,
    redirect: `/portfolio`
  },
  {
    path: `/proposals`,
    name: `Proposals`,
    meta: {
      feature: "Proposals"
    },
    component: () => import(`./components/governance/PageProposals`).default
  },
  // for depredecated routes
  {
    path: `/governance/proposals`,
    redirect: `/proposals`
  },
  {
    path: `/proposals/:proposalId`,
    name: `Proposal`,
    meta: {
      feature: "Proposals"
    },
    component: () => import(`./components/governance/PageProposal`).default,
    props: true
  },
  // for depredecated routes
  {
    path: `/governance/proposals/:proposalId`,
    redirect: `/proposals/:proposalId`
  },
  {
    path: `/validators`,
    name: `Validators`,
    meta: {
      feature: "Validators"
    },
    component: () => import(`./components/staking/PageValidators`).default
  },
  // for depredecated routes
  {
    path: `/staking/validators`,
    redirect: `/validators`
  },
  {
    path: `/validators/:validator`,
    name: `validator`,
    meta: {
      feature: "Validators"
    },
    component: () => import(`./components/staking/PageValidator`).default
  },
  {
    path: `/staking/validators/:validator`,
    redirect: `/validators/:validator`
  },
  {
    path: `/portfolio`,
    name: `portfolio`,
    component: () => import(`./components/wallet/PagePortfolio`).default,
    meta: {
      requiresAuth: true,
      feature: "Portfolio"
    }
  },
  {
    path: `/transactions`,
    name: `transactions`,
    component: () => import(`./components/wallet/PageTransactions`).default,
    meta: {
      requiresAuth: true,
      feature: "Activity"
    }
  },
  {
    path: `/networks`,
    name: `networks`,
    component: () => import(`./components/network/PageNetworks`).default,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: `/blocks/:height`,
    name: `block`,
    component: () => import(`./components/network/PageBlock`).default,
    meta: {
      feature: "Explorer"
    }
  },
  {
    path: `/welcome`,
    name: `welcome`,
    components: {
      session: () => import(`./components/common/TmSessionWelcome`).default
    },
    meta: {
      feature: "Session"
    }
  },
  {
    path: `/login`,
    name: `login`,
    components: {
      session: () => import(`./components/common/TmSessionSignIn`).default
    },
    meta: {
      feature: "Session"
    }
  },
  {
    path: `/create`,
    name: `create`,
    components: {
      session: () => import(`./components/common/TmSessionSignUp`).default
    },
    meta: {
      feature: "Session"
    }
  },
  {
    path: `/create/password`,
    name: `create-password`,
    components: {
      session: () => import(`./components/common/TmSessionSignUpPassword`).default
    },
    meta: {
      feature: "Session"
    },
    beforeEnter: (to, from, next) => {
      if (from.name === `create`) {
        next()
      } else {
        next({ path: `/create` })
      }
    }
  },
  {
    path: `/create/confirm`,
    name: `create-confirm`,
    components: {
      session: () => import(`./components/common/TmSessionSignUpSeed`).default
    },
    meta: {
      feature: "Session"
    },
    beforeEnter: (to, from, next) => {
      if (from.name === `create-password`) {
        next()
      } else {
        next({ path: `/create` })
      }
    }
  },
  {
    path: `/recover`,
    name: `recover`,
    components: {
      session: () => import(`./components/common/TmSessionImport`).default
    },
    meta: {
      feature: "Session"
    }
  },
  {
    path: `/recover/name`,
    name: `recover-name`,
    components: {
      session: () => import(`./components/common/TmSessionImportName`).default
    },
    meta: {
      feature: "Session"
    },
    beforeEnter: (to, from, next) => {
      if (from.name === `recover`) {
        next()
      } else {
        next({ path: `/recover` })
      }
    }
  },
  {
    path: `/recover/password`,
    name: `recover-password`,
    components: {
      session: () => import(`./components/common/TmSessionImportPassword`).default
    },
    meta: {
      feature: "Session"
    },
    beforeEnter: (to, from, next) => {
      if (from.name === `recover-name`) {
        next()
      } else {
        next({ path: `/recover` })
      }
    }
  },
  {
    path: `/explore`,
    name: `explore`,
    components: {
      session: () => import(`./components/common/TmSessionExplore`).default
    },
    meta: {
      feature: "Session"
    }
  },
  {
    path: `/ledger`,
    name: `ledger`,
    components: {
      session: () => import(`./components/common/TmSessionHardware`).default
    },
    meta: {
      feature: "Session"
    }
  },
  {
    path: `/extension`,
    name: `extension`,
    components: {
      session: () => import(`./components/common/TmSessionExtension`).default
    },
    meta: {
      feature: "Session"
    }
  },
  {
    path: `/existing`,
    name: `existing`,
    components: {
      session: () => import(`./components/common/TmSessionExisting`).default
    },
    meta: {
      feature: "Session"
    }
  },
  { path: `/404`, component: () => import(`./components/common/Page404`).default },
  {
    path: `/privacy`,
    component: () => import(`./components/common/PagePrivacy`).default
  },
  {
    path: `/terms`,
    component: () => import(`./components/common/PageTerms`).default
  },
  {
    path: `/security`,
    component: () => import(`./components/common/PageSecurity`).default
  },
  {
    path: `/about`,
    component: () => import(`./components/common/PageAbout`).default
  },
  {
    path: `/careers`,
    component: () => import(`./components/common/PageCareers`).default
  },
  {
    path: `/feature-not-available/:feature`,
    component: () => import(`./components/common/PageFeatureNotAvailable`).default,
    props: true
  },
  { path: `*`, component: () => import(`./components/common/Page404`).default }
]
