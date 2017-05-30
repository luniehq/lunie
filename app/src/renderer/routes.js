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
    path: '/settings',
    name: 'settings',
    component: r('Settings')
  },
  {
    path: '*',
    redirect: '/'
  }
]
