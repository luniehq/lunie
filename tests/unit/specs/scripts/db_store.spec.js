jest.mock(`scripts/url`, () => ({
  getGraphqlHost: jest.fn(() => "api"),
  __esModule: true
}))
jest.mock(`browser-id`, () => ({
  default: jest.fn(() => "browserid-uuid"),
  __esModule: true
}))
import { store_in_db } from "scripts/db_store.js"

const mockFetch = jest.fn(() =>
  Promise.resolve({
    json: () => ({ success: true, hash: "abcdsuperhash" })
  })
)

describe(`Statistics modules`, () => {
  describe("Send function", () => {
    it(`Should contain all data`, () => {
      global.fetch = mockFetch
      const customObject = {
        address: "test_address",
        network: "test_network"
      }
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          payload: {
            ...customObject,
            ...{
              category: "Category",
              action: "Action",
              label: "Label",
              value: "Value",
              browserid: "browserid-uuid"
            }
          }
        })
      }
      store_in_db(customObject, `Category`, `Action`, `Label`, `Value`)
      expect(fetch).toHaveBeenCalledWith(`api/stat/store`, options)
    })
  })
})
