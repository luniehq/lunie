import store from '../../store'

export default [
  {
    path: `/`,
    name: `accounts`,
    component: require('../../components/SessionAccounts').default,
    beforeEnter: (to, from, next) => {
      if (!store.state.accounts) {
        next({ path: '/welcome' })
      } else {
        next()
      }
    }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: require('../../components/SessionWelcome').default
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
