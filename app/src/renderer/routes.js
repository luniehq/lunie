function r (pageName) { return require(`components/Page${pageName}`) }

export default [
  {
    path: '/',
    name: 'candidates',
    component: r('Candidates')
  },
  {
    path: '/invite',
    name: 'invite',
    component: r('Invite')
  },
  {
    path: '/nominate',
    name: 'nominate',
    component: r('Nominate')
  },
  {
    path: '/profile',
    name: 'profile',
    component: r('Profile')
  },
  {
    path: '/signin',
    name: 'signin',
    component: r('SignIn')
  },
  {
    path: '/candidates/:candidate',
    name: 'candidate',
    component: r('Candidate')
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: r('Welcome')
  },
  {
    path: '*',
    redirect: '/'
  }
]
