function r (type, pageName) { return require(`components/${type}/Page${pageName}`) }

let common = r.bind(null, 'common')
let govern = r.bind(null, 'govern')
let monitor = r.bind(null, 'monitor')
let staking = r.bind(null, 'staking')
// let basecoin = r.bind(null, 'basecoin')

export default [
  // GOVERN
  { path: '/', name: 'proposals', component: govern('Proposals') },
  { path: '/proposals/new', component: govern('ProposalsNew') },
  { path: '/proposals/new/text', component: govern('ProposalsNewText') },
  { path: '/proposals/:proposal', name: 'proposal', component: govern('Proposal') },

  // STAKE
  { path: '/staking', name: 'candidates', component: staking('Candidates') },
  { path: '/staking/delegate', name: 'delegate', component: staking('Delegate') },
  { path: '/staking/nominate', name: 'nominate', component: staking('Nominate') },
  {
    path: '/staking/candidates/:candidate',
    name: 'candidate',
    component: staking('Candidate')
  },

  // MONITOR
  { path: '/block/:block', name: 'block', component: monitor('Block') },
  { path: '/blockchain', name: 'blockchain', component: monitor('Blockchain') },
  { path: '/validators', name: 'validators', component: monitor('Validators') },
  {
    path: '/validators/:validator',
    name: 'validator',
    component: monitor('Validator'),
    children: [
      {
        path: '',
        name: 'validator-index',
        component: monitor('ValidatorIndex')
      },
      {
        path: 'delegators',
        name: 'validator-delegators',
        component: monitor('ValidatorDelegators')
      },
      {
        path: 'power',
        name: 'validator-power',
        component: monitor('ValidatorPower')
      },
      {
        path: 'proposals',
        name: 'validator-proposals',
        component: monitor('ValidatorProposals')
      },
      {
        path: 'slashes',
        name: 'validator-slashes',
        component: monitor('ValidatorSlashes')
      },
      {
        path: 'votes',
        name: 'validator-votes',
        component: monitor('ValidatorVotes')
      }
    ]
  },
  { path: '/delegators', name: 'delegators', component: monitor('Delegators') },
  { path: '/delegators/:delegator', name: 'delegator', component: monitor('Delegator') },

  // USER
  { path: '/signin', name: 'signin', component: common('SignIn') },
  { path: '/profile', name: 'profile', component: common('Profile') },

  // sendtx
  // {
  //   path: '/balances',
  //   name: 'balances',
  //   component: r('Balances')
  // },
  // {
  //   path: '/send',
  //   name: 'send',
  //   component: r('Send')
  // },
  // {
  //   path: '/receive',
  //   name: 'receive',
  //   component: r('Receive')
  // },

  // 404
  { path: '/404', component: common('404') },
  { path: '*', component: common('404') }
]
