import { extensionSignIn } from "src/routes.js"

describe("Routes", () => {
  it("should trigger sign in call and route the user to the homepage on extension deeplinking", async () => {
    const next = jest.fn()
    const apollo = {
      query: jest.fn(() => ({ data: { network: { slug: "cosmos-hub" } } }))
    }
    const store = { dispatch: jest.fn() }
    await extensionSignIn(
      {
        to: {
          params: {
            network: "cosmos-hub-mainnet",
            address: "cosmos1234"
          }
        },
        next
      },
      apollo,
      store
    )

    expect(store.dispatch).toHaveBeenCalledWith("signIn", {
      address: "cosmos1234",
      networkId: "cosmos-hub-mainnet",
      sessionType: `extension`
    })
    expect(next).toHaveBeenCalledWith(`/cosmos-hub/portfolio`)
  })
})
