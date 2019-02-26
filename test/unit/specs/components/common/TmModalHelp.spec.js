import { shallowMount } from "@vue/test-utils"
import TmModalHelp from "common/TmModalHelp"

describe(`TmModalHelp`, () => {
  let wrapper

  const $store = {
    commit: jest.fn(),
    getters: {
      session: {
        modals: {
          help: {
            active: true
          }
        }
      }
    }
  }

  beforeEach(() => {
    wrapper = shallowMount(TmModalHelp, {
      mocks: {
        $store
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should hide`, () => {
    wrapper.vm.close()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})