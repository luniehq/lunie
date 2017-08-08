function r(type, pageName) {
  return require(`components/${type}/Page${pageName}`)
}

let staking = r.bind(null, 'staking')
let basecoin = r.bind(null, 'basecoin')

export default [
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
    path: '/staking/signin',
    name: 'signin',
    component: staking('SignIn')
  },
  {
    path: '/staking/candidates/:candidate',
    name: 'candidate',
    component: staking('Candidate')
  },
  {
    path: '/staking/welcome',
    name: 'welcome',
    component: staking('Welcome')
  },
  {
    path: '*',
    redirect: '/staking'
  }
]
