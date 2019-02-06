/**
 * In this module we took care of the definition of our routes, with parameters, children and component related to them
 * @module routes
 */

/**
 * Routes are all defined here
 */
export default [
  {
    path: `/governance`,
    name: `Governance`,
    component: require(`./components/governance/PageGovernance`).default,
    redirect: `/governance/proposals`,
    children: [
      {
        path: `proposals`,
        name: `Proposals`,
        component: require(`./components/governance/TabProposals`).default
      },
      {
        path: `governance-parameters`,
        name: `Governance Parameters`,
        component: require(`./components/governance/TabParameters`).default
      }
    ]
  },
  {
    path: `/governance/:proposalId`,
    name: `Proposal`,
    component: require(`./components/governance/PageProposal`).default,
    props: true
  },
  {
    path: `/staking`,
    name: `Staking`,
    component: require(`./components/staking/PageStaking`).default,
    redirect: `/staking/my-delegations/`,
    children: [
      {
        path: `my-delegations`,
        name: `My Delegations`,
        component: require(`./components/staking/TabMyDelegations`).default
      },
      {
        path: `validators`,
        name: `Validators`,
        component: require(`./components/staking/TabValidators`).default
      },
      {
        path: `staking-parameters`,
        name: `Staking Parameters`,
        component: require(`./components/staking/TabParameters`).default
      }
    ]
  },
  {
    path: `/staking/validators/:validator`,
    name: `validator`,
    component: require(`./components/staking/PageValidator`).default
  },
  {
    path: `/preferences`,
    name: `preferences`,
    component: require(`./components/common/PagePreferences`).default
  },
  {
    path: `/`,
    name: `wallet`,
    component: require(`./components/wallet/PageWallet`).default
  },
  {
    path: `/wallet/send/:denom?`,
    name: `send`,
    props: true,
    component: require(`./components/wallet/SendModal`).default
  },
  {
    path: `/transactions`,
    name: `transactions`,
    component: require(`./components/wallet/PageTransactions`).default
  },
  {
    path: `/network`,
    name: `network`,
    component: require(`./components/network/PageNetwork`).default
  },
  {
    path: `/block/:height`,
    name: `block`,
    component: require(`./components/network/PageBlock`).default
  },
  { path: `/404`, component: require(`./components/common/Page404`).default },
  { path: `*`, component: require(`./components/common/Page404`).default }
]
