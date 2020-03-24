import NetworkItem from "network/NetworkItem"

describe(`NetworkItem`, () => {
  const networkitem = {
    id: "cosmoshub",
    powered: {
      name: "Provider",
      providerAddress: "cosmosvaloper1",
      picture: ""
    }
  }

  it(`returns true if the network in NetworkItem is the same than the network we are connected to`, () => {
    const self = {
      network: `cosmoshub`,
      networkitem
    }
    const currentNetworkCheck = NetworkItem.computed.isCurrentNetwork.call(self)
    expect(currentNetworkCheck).toBe(true)
  })
})
