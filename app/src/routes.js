/**
 * In this module we took care of the definition of our routes, with parameters, children and component related to them
 * @module routes
 */

/**
 * Routes are all defined here
 */
/* istanbul ignore file */
export default (store) => {
  return [
    {
      path: `/reveal/:address`,
      name: `reveal`,
      component: require("account/RevealSeedModal").default,
    },
    {
      path: `/delete/:address/:addressNetworkId`,
      name: `delete`,
      component: require("account/ForgetAccountModal").default,
    },
    {
      path: `/`,
      name: `manage-accounts-modal`,
      component: () => import(`./components/account/ManageAccountsModal`),
      meta: {
        networkSpecificRoute: true,
      },
    },
  ]
}

// handle direct sign in from the extension via deeplink
export async function extensionSignIn({ to, next }, store) {
  let network = store.getters.networks.find(
    ({ id }) => id === to.params.network
  )

  await store.dispatch(`signIn`, {
    sessionType: `extension`,
    address: to.params.address,
    networkId: to.params.network,
  })
  next(`/${network.slug}/portfolio`)
}
