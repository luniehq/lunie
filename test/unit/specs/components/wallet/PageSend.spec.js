import setup from "../../../helpers/vuex-setup"
import Vuelidate from "vuelidate"
import PageSend from "renderer/components/wallet/PageSend"

describe("PageSend", () => {
  let wrapper, store, node
  const name = "default"
  const password = "1234567890"
  const address = "tb1mjt6dcdru8lgdz64h2fu0lrzvd5zv8sfcvkv2l"

  const coins = [
    {
      denom: "mycoin",
      amount: 1000
    },
    {
      denom: "fermion",
      amount: 2300
    }
  ]

  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  beforeEach(async () => {
    let test = mount(PageSend, {
      propsData: {
        denom: "fermion"
      }
    })
    wrapper = test.wrapper
    store = test.store
    node = test.node
    store.commit("setAccounts", [
      {
        address,
        name,
        password
      }
    ])
    await store.dispatch("signIn", {
      account: name,
      password
    })
    store.commit("setWalletBalances", coins)
    store.commit("setNonce", 1)
  })

  it("has the expected html structure", async () => {
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should populate the select options with denoms", () => {
    wrapper.update()
    expect(
      wrapper
        .findAll("option")
        .at(0)
        .text()
    ).toBe("Select token...")
    expect(
      wrapper
        .findAll("option")
        .at(1)
        .text()
    ).toBe(coins[0].denom.toUpperCase())
    expect(
      wrapper
        .findAll("option")
        .at(2)
        .text()
    ).toBe(coins[1].denom.toUpperCase())
  })

  it("should populate the select options with networks", () => {
    wrapper.update()

    expect(
      wrapper
        .findAll("option")
        .at(3)
        .text()
    ).toBe("Select zone...")
    expect(
      wrapper
        .findAll("option")
        .at(4)
        .text()
    ).toBe("basecoind-demo1")
  })

  it("should work without providing a default denom", () => {
    let { wrapper } = mount(PageSend)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should show address required error", async () => {
    let { wrapper } = mount(PageSend)
    wrapper.setData({
      fields: {
        denom: "mycoin",
        address: "",
        amount: 2,
        zoneId: "cosmos-hub-1"
      }
    })
    wrapper.vm.onSubmit()
    wrapper.update()
    expect(wrapper.vm.$v.$error).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
  it("should show bech32 error when address length is too short", async () => {
    let { wrapper } = mount(PageSend)
    wrapper.setData({
      fields: {
        denom: "mycoin",
        address: "asdf",
        amount: 2,
        zoneId: "cosmos-hub-1"
      }
    })
    wrapper.vm.onSubmit()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should show bech32 error when address length is too long", async () => {
    let { wrapper } = mount(PageSend)
    wrapper.setData({
      fields: {
        denom: "mycoin",
        address: "asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf",
        amount: 2,
        zoneId: "cosmos-hub-1"
      }
    })
    wrapper.vm.onSubmit()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
  it("should show bech32 error when alphanumeric is wrong", async () => {
    let { wrapper } = mount(PageSend)
    wrapper.setData({
      fields: {
        denom: "mycoin",
        address: "!@#$!@#$!@#$!@#$!@#$!@#$!@#$!@#$!@#$!@#$",
        amount: 2,
        zoneId: "cosmos-hub-1"
      }
    })
    wrapper.vm.onSubmit()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should trigger confirmation modal if form is corect", async () => {
    let { wrapper, store } = mount(PageSend, {
      propsData: {
        denom: "mycoin"
      }
    })
    store.commit("setWalletBalances", coins)
    wrapper.setData({
      fields: {
        denom: "mycoin",
        address,
        amount: 2,
        zoneId: "cosmos-hub-1"
      }
    })
    wrapper.vm.onSubmit()
    wrapper.update()
    expect(wrapper.vm.confirmationPending).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should close confirmation modal on cancel", async () => {
    wrapper.vm.onCancel()
    expect(wrapper.vm.confirmationPending).toBe(false)
  })

  it("should show notification for successful send", async () => {
    wrapper.setData({
      fields: {
        denom: "mycoin",
        address,
        amount: 2,
        zoneId: "cosmos-hub-1"
      }
    })
    await wrapper.vm.onApproved()
    // walletSend is async so we need to wait until it is resolved
    expect(store.commit).toHaveBeenCalledWith("notify", expect.any(Object))
  })

  it("should show notification for unsuccessful send", async () => {
    wrapper.setData({
      fields: {
        denom: "notmycoin",
        address,
        amount: 2,
        zoneId: "cosmos-hub-1"
      }
    })
    node.sign = () => Promise.reject()
    await wrapper.vm.onApproved()
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0].title).toBe("Error Sending")
    expect(store.state.notifications[0]).toMatchSnapshot()
  })

  it("validates bech32 addresses", () => {
    expect(
      wrapper.vm.bech32Validate(
        "cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9"
      )
    ).toBe(true)
    expect(
      wrapper.vm.bech32Validate(
        "cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqprm5ctpesxxn9"
      )
    ).toBe(false)
  })
})
