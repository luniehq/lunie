function r(type, pageName) {
  return require(`./components/${type}/Page${pageName}`).default
}

let common = r.bind(null, `common`)
let governance = r.bind(null, `governance`)
let staking = r.bind(null, `staking`)
let wallet = r.bind(null, `wallet`)

export default [
  {
    path: `/governance`,
    name: `Governance`,
    component: governance(`Governance`),
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
  // STAKE
  {
    path: `/staking`,
    name: `Staking`,
    component: staking(`Staking`),
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
    component: staking(`Validator`)
  },

  {
    path: `/preferences`,
    name: `preferences`,
    component: common(`Preferences`)
  },

  {
    path: `/`,
    name: `wallet`,
    component: wallet(`Wallet`)
  },
  {
    path: `/wallet/send/:denom?`,
    name: `send`,
    props: true,
    component: wallet(`Send`)
  },
  {
    path: `/transactions`,
    name: `transactions`,
    component: wallet(`Transactions`)
  },

  { path: `/404`, component: common(`404`) },
  { path: `*`, component: common(`404`) }
]
