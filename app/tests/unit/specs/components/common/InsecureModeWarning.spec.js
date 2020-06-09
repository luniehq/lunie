import { shallowMount } from "@vue/test-utils"
import InsecureModeWarning from "common/InsecureModeWarning"

describe(`InsecureModeWarning`, () => {
  let $store, wrapper

  beforeEach(() => {
    $store = {
      state: {
        connection: {
          network: "cosmos-hub-mainnet",
        },
      },
    }

    wrapper = shallowMount(InsecureModeWarning, {
      mocks: {
        $store,
      },
      stubs: [`router-link`],
    })
  })
  it(`has the expected html structure`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`should show How to Manage Your Keys tutorial`, () => {
    wrapper.setData({
      showTutorial: false,
    })
    wrapper.vm.openTutorial()
    expect(wrapper.vm.showTutorial).toBe(true)
  })
  it(`should hide How to Manage Your Keys tutorial`, () => {
    wrapper.setData({
      showTutorial: true,
    })
    wrapper.vm.hideTutorial()
    expect(wrapper.vm.showTutorial).toBe(false)
  })
})
