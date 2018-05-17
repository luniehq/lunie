import setup from "../../../helpers/vuex-setup"
import PageDelegate from "renderer/components/staking/PageDelegate"

describe("PageDelegate", () => {
  let wrapper, router
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(PageDelegate, {
      getters: {
        config: () => ({ desktop: false }),
        delegates: () => ({
          delegates: [
            {
              id: "1a2b3c",
              moniker: "JB",
              website: "https://the.zone",
              voting_power: 1000,
              address: "helloaddr",
              pub_key: { data: "123pubkeyforme" }
            },
            { id: "d4e5f6" }
          ]
        })
      }
    })
    wrapper = instance.wrapper
    router = instance.router

    router.push("/staking/delegates/1a2b3c")
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should return one delegate based on route params", () => {
    expect(wrapper.vm.delegate.id).toEqual("1a2b3c")
  })
})
