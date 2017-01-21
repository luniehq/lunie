export default [
  {
    path: '/',
    name: 'page-balances',
    component: require('components/PageBalances')
  },
  {
    path: '/transactions',
    name: 'page-transactions',
    component: require('components/PageTransactions')
  },
  {
    path: '/receive',
    name: 'page-receive',
    component: require('components/PageReceive')
  },
  {
    path: '/send',
    name: 'page-send',
    component: require('components/PageSend')
  },
  {
    path: '*',
    redirect: '/'
  }
]
