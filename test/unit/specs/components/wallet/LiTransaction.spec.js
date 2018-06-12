import { shallow } from "@vue/test-utils"
import LiTransaction from "renderer/components/wallet/LiTransaction"

describe("LiTransaction", () => {
  let wrapper
  let propsData = {
    devMode: true,
    transactionValue: {
      tx: {
        inputs: [
          {
            coins: [
              {
                denom: "jbcoins",
                amount: 1234
              }
            ],
            // sender: "otherAddress"
            sender: "tb1da6xsetjg9jxgun9wdesexv05j"
          }
        ],
        outputs: [
          {
            coins: [
              {
                denom: "jbcoins",
                amount: 1234
              }
            ],
            // recipient: "myAddress"
            recipient: "tb1d4u5zerywfjhxuc9nudvw"
          }
        ]
      },
      time: null
    },
    // address: "myAddress"
    address: "tb1d4u5zerywfjhxuc9nudvw"
  }

  beforeEach(() => {
    wrapper = shallow(LiTransaction, { propsData })
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should show incoming transactions", () => {
    expect(wrapper.find(".ni-li-tx").classes()).toContain("ni-li-tx-received")
  })

  it("should show outgoing transactions", () => {
    wrapper.setProps({
      transactionValue: {
        tx: {
          inputs: [
            {
              coins: [
                {
                  denom: "jbcoins",
                  amount: 1234
                }
              ],
              // sender: "myAddress"
              sender: "tb1d4u5zerywfjhxuc9nudvw"
            }
          ],
          outputs: [
            {
              coins: [
                {
                  denom: "jbcoins",
                  amount: 1234
                }
              ],
              // recipient: "otherAddress"
              recipient: "tb1da6xsetjg9jxgun9wdesexv05j"
            }
          ]
        },
        time: Date.now()
      },
      // address: "myAddress"
      address: "tb1d4u5zerywfjhxuc9nudvw"
    })
    expect(wrapper.find(".ni-li-tx").classes()).toContain("ni-li-tx-sent")
  })

  it("should show all coins of the transaction", () => {
    wrapper.setProps({
      transactionValue: {
        tx: {
          inputs: [
            {
              coins: [
                {
                  denom: "jbcoins",
                  amount: 1234
                },
                {
                  denom: "fabocoins",
                  amount: 1
                },
                {
                  denom: "mattcoins",
                  amount: 42
                }
              ],
              // sender: "otherAddress"
              sender: "tb1da6xsetjg9jxgun9wdesexv05j"
            }
          ],
          outputs: [
            {
              coins: [
                {
                  denom: "jbcoins",
                  amount: 1234
                },
                {
                  denom: "fabocoins",
                  amount: 1
                },
                {
                  denom: "mattcoins",
                  amount: 42
                }
              ],
              // recipient: "myAddress"
              recipient: "tb1d4u5zerywfjhxuc9nudvw"
            }
          ]
        },
        time: Date.now()
      },
      // address: "myAddress"
      address: "tb1d4u5zerywfjhxuc9nudvw"
    })
    expect(wrapper.findAll(".tx-coin").length).toBe(3)
    expect(
      wrapper
        .findAll(".tx-coin")
        .at(2)
        .html()
        .toLowerCase()
    ).toContain("mattcoins")
    expect(
      wrapper
        .findAll(".tx-coin")
        .at(2)
        .html()
    ).toContain("42")
  })
})
