import setup from "../../../helpers/vuex-setup"
import Vuelidate from "vuelidate"
import PageSend from "renderer/components/wallet/PageSend"

describe("PageSend", () => {
  let wrapper, store, node

  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  beforeEach(async () => {
    let test = mount(PageSend)
    wrapper = test.wrapper
    store = test.store
    node = test.node
    store.commit("setAccounts", [
      {
        address: "1234567890123456789012345678901234567890",
        name: "default",
        password: "1234567890"
      }
    ])
    await store.dispatch("signIn", {
      account: "default",
      password: "1234567890"
    })
    store.commit("setWalletBalances", [
      {
        denom: "ATOM",
        amount: 123
      },
      {
        denom: "FERMION",
        amount: 456
      }
    ])
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
    ).toBe("ATOM")
    expect(
      wrapper
        .findAll("option")
        .at(2)
        .text()
    ).toBe("FERMION")
  })

  it("should show notification for successful send", async () => {
    wrapper.setData({
      fields: {
        denom: "ATOM",
        address: "CE456B8BA9AFD1CBDF4ED14558E8C30691E549EA",
        amount: 2
      }
    })
    await wrapper.vm.onSubmit()
    // walletSend is async so we need to wait until it is resolved
    expect(store.commit).toHaveBeenCalledWith("notify", expect.any(Object))
  })

  it("should show notification for unsuccessful send", async () => {
    wrapper.setData({
      fields: {
        denom: "ATOM",
        address: "CE456B8BA9AFD1CBDF4ED14558E8C30691E5fail",
        amount: 2
      }
    })
    node.sign = () => Promise.reject()
    await wrapper.vm.onSubmit()
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0].title).toBe("Error Sending")
    expect(store.state.notifications[0]).toMatchSnapshot()
  })
})
