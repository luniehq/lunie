import { extensionSignIn } from "src/routes.js"
import { setNetwork } from "src/scripts/setNetwork.js"

describe("Routes", () => {
  it("should trigger sign in call and route the user to the homepage on extension deeplinking", async () => {
    const next = jest.fn()
    const store = {
      dispatch: jest.fn(),
      getters: {
        networks: [
          {
            id: `cosmos-hub-mainnet`,
            slug: `cosmos-hub`,
          },
          {
            id: `keine-ahnungnet`,
            slug: `keineahnung`,
          },
          {
            id: `la-red-feliz`,
            slug: `redfeliz`,
          },
        ],
      },
    }
    await extensionSignIn(
      {
        to: {
          params: {
            network: "cosmos-hub-mainnet",
            address: "cosmos1234",
          },
        },
        next,
      },
      store
    )

    expect(store.dispatch).toHaveBeenCalledWith("signIn", {
      address: "cosmos1234",
      networkId: "cosmos-hub-mainnet",
      sessionType: `extension`,
    })
    expect(next).toHaveBeenCalledWith(`/cosmos-hub/portfolio`)
  })

  it("should switch networks if the route slug indicates a different network", async () => {
    // would have been better to instantiate the router and test with actual routing but that caused issues
    const next = jest.fn()
    const to = {
      params: {
        networkId: "terra",
      },
      path: "/terra/blocks/12345",
    }
    const store = {
      dispatch: jest.fn(() => {
        store.state.connection.networkSlug = "terra"
      }),
      state: {
        connection: {
          networkSlug: "cosmos-hub",
        },
        session: {
          allSessionAddresses: [
            {
              networkId: "cosmos-hub-mainnet",
            },
          ],
        },
      },
      getters: {
        networks: [
          {
            id: `terra-testnet`,
            slug: `terra`,
          },
        ],
      },
    }

    await setNetwork({ to, next }, store)

    expect(store.dispatch).toHaveBeenCalledWith("setNetwork", {
      id: `terra-testnet`,
      slug: `terra`,
    })
    expect(next).toHaveBeenCalledWith(`/terra/blocks/12345`)
  })

  it("should switch to validators if there is no session for the target network", async () => {
    // would have been better to instantiate the router and test with actual routing but that caused issues
    const next = jest.fn()
    const to = {
      params: {
        networkId: "terra",
      },
      path: "/terra",
    }
    const store = {
      dispatch: jest.fn(() => {
        store.state.connection.networkSlug = "terra"
      }),
      state: {
        connection: {
          networkSlug: "cosmos-hub",
        },
        session: {
          allSessionAddresses: [
            {
              networkId: "cosmos-hub-mainnet",
            },
          ],
        },
      },
      getters: {
        networks: [
          {
            id: `terra-testnet`,
            slug: `terra`,
          },
        ],
      },
    }

    await setNetwork({ to, next }, store)

    expect(store.dispatch).toHaveBeenCalledWith("setNetwork", {
      id: `terra-testnet`,
      slug: `terra`,
    })
    expect(next).toHaveBeenCalledWith(`/terra/validators`)
  })
})
