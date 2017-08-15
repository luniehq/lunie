function r (type, pageName) {
  return require(`components/${type}/Page${pageName}`)
}

let common = r.bind(null, 'common')
let govern = r.bind(null, 'govern')
let monitor = r.bind(null, 'monitor')
let staking = r.bind(null, 'staking')
// let basecoin = r.bind(null, 'basecoin')

export default [
  // MONITOR
  { path: '/block/:block', name: 'block', component: monitor('Block') },
  {
    path: '/blockchain',
    name: 'blockchain',
    component: monitor('Blockchain')
  },
  { path: '/validators', component: monitor('Validators') },
  {
    name: 'validator',
    path: '/validators/:validator',
    component: monitor('Validator')
  },
  { path: '/delegators', component: monitor('Delegators') },
  {
    name: 'delegator',
    path: '/delegators/:delegator',
    component: monitor('Delegator')
  },

  // GOVERN
  { path: '/', component: govern('Proposals') },
  { path: '/proposals/new', component: govern('ProposalsNew') },
  { path: '/proposals/new/text', component: govern('ProposalsNewText') },
  { path: '/proposals/:proposal', name: 'proposal', component: govern('Proposal') },

  // STAKE
  {
    path: '/staking',
    name: 'candidates',
    component: staking('Candidates')
  },
  {
    path: '/staking/delegate',
    name: 'delegate',
    component: staking('Delegate')
  },
  {
    path: '/staking/nominate',
    name: 'nominate',
    component: staking('Nominate')
  },
  {
    path: '/staking/profile',
    name: 'profile',
    component: staking('Profile')
  },
  {
    path: '/staking/candidates/:candidate',
    name: 'candidate',
    component: staking('Candidate')
  },
  {
    path: '/signin',
    name: 'signin',
    component: staking('SignIn')
  },

  // wildcards
  { path: '/404', component: common('404') },
  { path: '*', component: common('404') }
]
