export default [
  {
    path: '/',
    name: 'page-wallets',
    component: require('components/PageWallets')
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
    path: '/exchange',
    name: 'page-exchange',
    component: require('components/PageExchange')
  },
  {
    path: '*',
    redirect: '/'
  }
]
