export default [
  {
    path: `/`,
    name: `accounts`,
    component: require('common/SessionAccounts').default
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: require('common/TmSessionWelcome').default
  },
  {
    path: '/existing',
    name: 'existing',
    component: require('common/TmSessionExisting').default
  },
  {
    path: `/create`,
    name: `create`,
    component: require('common/TmSessionSignUp').default
  },
  {
    path: `/recover`,
    name: `recover`,
    component: require('common/TmSessionImport').default
  }
]
