import NetworkItem from "network/NetworkItem"

describe(`NetworkItem`, () => {
  const networkItem = {
    id: "cosmoshub",
    powered: {
      name: "Provider",
      providerAddress: "cosmosvaloper1",
      picture: "",
    },
  }

  it(`returns true if the network in NetworkItem is the same as the network we are connected to`, () => {
    const self = {
      network: `cosmoshub`,
      networkItem,
    }
    const currentNetworkCheck = NetworkItem.computed.isCurrentNetwork.call(self)
    expect(currentNetworkCheck).toBe(true)
  })
})
