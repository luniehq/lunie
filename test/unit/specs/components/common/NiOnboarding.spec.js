import NiOnboarding from "common/NiOnboarding.vue"
import htmlBeautify from "html-beautify"
import setup from "../../../helpers/vuex-setup"

describe("NiOnboarding", () => {
  let wrapper, store, instance
  let { mount } = setup()

  beforeEach(() => {
    instance = mount(NiOnboarding, {
      stubs: { "app-menu": "<app-menu />" },
      methods: { watchWindowSize: () => {} }
    })
    wrapper = instance.wrapper
    store = instance.store

    wrapper.update()
  })

  it("has the expected html structure 1", () => {
    store.commit("setOnboardingActive", true)
    store.commit("setOnboardingState", "0")
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
