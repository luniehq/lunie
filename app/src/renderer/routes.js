function r (pageName) {
  return require(`components/Page${pageName}`)
}

export default [
  {
    path: '/',
    name: 'page-wallets',
    component: r('Wallets')
  },
  {
    path: '/transactions',
    name: 'page-transactions',
    component: r('Transactions')
  },
  {
    path: '/receive',
    name: 'page-receive',
    component: r('Receive')
  },
  {
    path: '/send',
    name: 'page-send',
    component: r('Send')
  },
  {
    path: '/exchange',
    name: 'page-exchange',
    component: r('Exchange')
  },
  {
    path: '/console',
    name: 'page-console',
    component: r('Console')
  },
  {
    path: '*',
    redirect: '/'
  }
]
