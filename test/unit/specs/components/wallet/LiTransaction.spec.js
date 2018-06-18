import { shallow } from "@vue/test-utils"
import LiTransaction from "renderer/components/wallet/LiTransaction"
import transactions from "../../store/json/txs.js"

describe("LiTransaction", () => {
  let wrapper
  let propsData = {
    devMode: true,
    transaction: transactions[0],
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
      transaction: transactions[1],
      address: "tb1d4u5zerywfjhxuc9nudvw"
    })
    expect(wrapper.find(".ni-li-tx").classes()).toContain("ni-li-tx-sent")
  })

  it("should show all coins of the transaction", () => {
    wrapper.setProps({
      transaction: transactions[2],
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
