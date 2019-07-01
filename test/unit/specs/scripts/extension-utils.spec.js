import {
  processLunieExtensionMessages,
  getWallets,
  sign
} from "scripts/extension-utils.js"

describe(`Extension Utils`, () => {
  describe("processLunieExtensionMessages", () => {
    let store, handler

    beforeEach(() => {
      store = {
        commit: jest.fn(),
        dispatch: jest.fn()
      }
      handler = processLunieExtensionMessages(store)
    })

    it("should signal that the extension is enabled", () => {
      handler({
        source: global,
        data: {
          type: "FROM_LUNIE_EXTENSION",
          message: {
            type: "INIT_EXTENSION"
          }
        }
      })

      expect(store.dispatch).toHaveBeenCalledWith("setExtensionEnabled")
      expect(store.dispatch).toHaveBeenCalledWith("getAddressesFromExtension")
    })

    it("should ignore messages not from the extension", () => {
      handler({
        source: global,
        data: {
          type: "NOT_FROM_LUNIE_EXTENSION",
          message: {
            type: "INIT_EXTENSION"
          }
        }
      })

      expect(store.dispatch).not.toHaveBeenCalledWith("setExtensionEnabled")
    })

    it("should react to query wallet responsesn", () => {
      handler({
        source: global,
        data: {
          type: "FROM_LUNIE_EXTENSION",
          message: {
            type: "GET_WALLETS_RESPONSE",
            payload: [
              {
                address: "cosmos1234",
                name: "TEST_ADDRESS"
              }
            ]
          }
        }
      })

      expect(store.commit).toHaveBeenCalledWith("setWallets", [
        {
          address: "cosmos1234",
          name: "TEST_ADDRESS"
        }
      ])
    })
  })

  describe("messages", () => {
    beforeEach(() => {
      jest.spyOn(global, "postMessage")
      global.postMessage.mockClear()
    })
    afterAll(() => {
      global.postMessage.mockReset()
    })

    it("should request wallets", () => {
      getWallets()
      expect(global.postMessage.mock.calls).toEqual([
        [
          {
            payload: { type: "GET_WALLETS" },
            skipResponse: false,
            type: "FROM_LUNIE_IO"
          },
          "*"
        ]
      ])
    })

    describe("sign", () => {
      beforeEach(() => {
        jest
          .spyOn(global, "addEventListener")
          .mockImplementation((type, callback) => {
            callback({
              signature: "abcd",
              publicKey: "1234"
            })
          })
        global.postMessage.mockClear()
      })

      afterAll(() => {
        global.addEventListener.mockReset()
      })

      it("should request a signature", () => {
        sign("abc", "cosmos1234")
        expect(global.postMessage.mock.calls).toEqual([
          [
            {
              payload: {
                payload: {
                  senderAddress: "cosmos1234",
                  signMessage: "abc"
                },
                type: "LUNIE_SIGN_REQUEST"
              },
              skipResponse: false,
              type: "FROM_LUNIE_IO"
            },
            "*"
          ]
        ])
      })

      it("should react to signature approval", () => {
        global.addEventListener.mockImplementation((type, callback) => {
          callback({
            rejected: true
          })
        })
        expect(sign("abc")).rejects.toThrow(
          "User rejected action in extension."
        )
      })

      it("should react to signature disapproval", async () => {
        const result = await sign("abc")
        expect(result).toEqual({
          signature: expect.any(Buffer),
          publicKey: expect.any(Buffer)
        })
      })
    })
  })
})
