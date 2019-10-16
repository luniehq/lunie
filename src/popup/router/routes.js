import store from '../../store'

export default [
  {
    path: `/`,
    name: `accounts`,
    component: require('../../components/SessionAccounts').default,
    alias: '/accounts',
    beforeEnter: (to, from, next) => {
      if (!store.state.accounts.length) {
        next({ path: '/welcome', replace: true })
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
    path: `/create/password`,
    name: `create-password`,
    component: require('common/TmSessionSignUpPassword').default
  },
  {
    path: `/create/confirm`,
    name: `create-confirm`,
    component: require('common/TmSessionSignUpSeed').default
  },
  {
    path: `/create/success`,
    name: `create-success`,
    component: require('common/TmSessionSignUpSuccess').default
  },
  {
    path: `/recover`,
    name: `recover`,
    component: require('common/TmSessionImport').default
  },
  {
    path: `/recover/name`,
    name: `recover-name`,
    component: require('common/TmSessionImportName').default
  },
  {
    path: `/recover/password`,
    name: `recover-password`,
    component: require('common/TmSessionImportPassword').default
  },
  {
    path: `/recover/success`,
    name: `recover-success`,
    component: require('common/TmSessionImportSuccess').default
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
