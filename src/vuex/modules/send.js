// import { uatoms } from "scripts/num"

export default ({ node }) => {
  const state = {
    node
  }

  const mutations = {}

  const actions = {
    postSubmitSend(/*{ state, commit }, { txProps, txMeta }*/) {
      // const { toAddress } = txProps
      // const { gasEstimate, gasPrice } = txMeta
      // const fees = gasEstimate * gasPrice
      // // session.address undefined
      // // if we send to ourselves, we don't loose tokens
      // let liquidityChangeAmount = 0
      // // TODO Obtain session address
      // // toAddress === state.session.address ? 0 : txProps.amount
      // console.log(`about to updateWalletBalance`)
      // commit("updateWalletBalance", {
      //   amount: this.balance - uatoms(liquidityChangeAmount + fees),
      //   denom: state.bonDenom
      // })
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
