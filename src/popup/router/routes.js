import store from '../../store'

export default [
  {
    path: `/`,
    name: `accounts`,
    component: require('../../components/SessionAccounts').default,
    beforeEnter: (to, from, next) => {
      if (!store.state.accounts.length) {
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
    path: '/success',
    name: 'success',
    component: require('../../components/SessionSuccess').default
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
  },
  {
    path: `/approve`,
    name: `approve`,
    component: require('../../components/SessionApprove').default,
    beforeEnter: (to, from, next) => {
      if (!store.state.signRequest) {
        next({ path: '/accounts' })
      } else {
        next()
      }
    }
  }
]
