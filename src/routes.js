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
    component: require(`./components/governance/TabProposals`).default
  },
  {
    path: `/proposals/:proposalId`,
    name: `Proposal`,
    component: require(`./components/governance/PageProposal`).default,
    props: true
  },
  {
    path: `/validators`,
    name: `Validators`,
    component: require(`./components/staking/PageValidators`).default
  },
  {
    path: `/validators/:validator`,
    name: `validator`,
    component: require(`./components/staking/PageValidator`).default
  },
  {
    path: `/portfolio`,
    name: `portfolio`,
    component: require(`./components/wallet/PagePortfolio`).default,
    meta: { requiresAuth: true }
  },
  {
    path: `/transactions`,
    name: `transactions`,
    component: require(`./components/wallet/PageTransactions`).default,
    meta: { requiresAuth: true }
  },
  {
    path: `/blocks/:height`,
    name: `block`,
    component: require(`./components/network/PageBlock`).default
  },
  {
    path: `/welcome`,
    name: `welcome`,
    components: {
      session: require(`./components/common/TmSessionWelcome`).default
    }
  },
  {
    path: `/login`,
    name: `login`,
    components: {
      session: require(`./components/common/TmSessionSignIn`).default
    }
  },
  {
    path: `/create`,
    name: `create`,
    components: {
      session: require(`./components/common/TmSessionSignUp`).default
    }
  },
  {
    path: `/recover`,
    name: `recover`,
    components: {
      session: require(`./components/common/TmSessionImport`).default
    }
  },
  {
    path: `/explore`,
    name: `explore`,
    components: {
      session: require(`./components/common/TmSessionExplore`).default
    }
  },
  {
    path: `/ledger`,
    name: `ledger`,
    components: {
      session: require(`./components/common/TmSessionHardware`).default
    }
  },
  {
    path: `/extension`,
    name: `extension`,
    components: {
      session: require(`./components/common/TmSessionExtension`).default
    }
  },
  {
    path: `/existing`,
    name: `existing`,
    components: {
      session: require(`./components/common/TmSessionExisting`).default
    }
  },
  { path: `/404`, component: require(`./components/common/Page404`).default },
  {
    path: `/privacy`,
    component: require(`./components/common/PagePrivacy`).default
  },
  {
    path: `/terms`,
    component: require(`./components/common/PageTerms`).default
  },
  {
    path: `/security`,
    component: require(`./components/common/PageSecurity`).default
  },
  {
    path: `/about`,
    component: require(`./components/common/PageAbout`).default
  },
  {
    path: `/careers`,
    component: require(`./components/common/PageCareers`).default
  },
  { path: `*`, component: require(`./components/common/Page404`).default }
]
