function r (pageName) { return require(`components/Page${pageName}`) }

export default [
  {
    path: '/',
    name: 'validators',
    component: r('Validators')
  },
  {
    path: '/validators/:validator',
    name: 'validator',
    component: r('Validator')
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: r('Welcome')
  },
  {
    path: '/signin',
    name: 'signin',
    component: r('SignIn')
  },
  {
    path: '/profile',
    name: 'profile',
    component: r('Profile')
  },
  {
    path: '*',
    redirect: '/'
  }
]
