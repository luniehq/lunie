import { toMicroUnit } from "src/scripts/num"

export default () => {
  return {
    state: {},
    actions: {
      convertViewAmountToChainAmount(
        {
          rootState: {
            getters: { network, networks, stakingDenom }
          }
        },
        amount
      ) {
        return toMicroUnit(
          amount,
          stakingDenom,
          networks.find(({ id }) => id === network)
        )
      }
    }
  }
}
