import setup from "../../../helpers/vuex-setup"
import Vuelidate from "vuelidate"
import PageSend from "renderer/components/wallet/PageSend"

describe("PageSend", () => {
  let wrapper, store, node

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
        address: "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B",
        name: "default",
        password: "1234567890"
      }
    ])
    await store.dispatch("signIn", {
      account: 'default',
      password: '1234567890'
    })
    store.commit("setWalletBalances", [
      {
        denom: "mycoin",
        amount: 1000
      },
      {
        denom: "fermion",
        amount: 2300
      }
    ])
    store.commit("setNonce", 1)
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should populate the select options with denoms", () => {
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
    ).toBe("MYCOIN")
    expect(
      wrapper
        .findAll("option")
        .at(2)
        .text()
    ).toBe("FERMION")
  })

  it("should populate the select options with networks", () => {
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

  it("should show notification for successful send", async () => {
    wrapper.setData({
      fields: {
        denom: "mycoin",
        address: "CE456B8BA9AFD1CBDF4ED14558E8C30691E549EA",
        amount: 2,
        zoneId: "cosmos-hub-1"
      }
    })
    await wrapper.vm.onSubmit()
    // walletSend is async so we need to wait until it is resolved
    expect(store.commit).toHaveBeenCalledWith("notify", expect.any(Object))
  })

  it("should show notification for unsuccessful send", async () => {
    wrapper.setData({
      fields: {
        denom: "notmycoin",
        address: "CE456B8BA9AFD1CBDF4ED14558E8C30691E549EA",
        amount: 2,
        zoneId: "cosmos-hub-1"
      }
    })
    node.sign = () => Promise.reject()
    await wrapper.vm.onSubmit()
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0].title).toBe("Error Sending")
    expect(store.state.notifications[0]).toMatchSnapshot()
  })
})
