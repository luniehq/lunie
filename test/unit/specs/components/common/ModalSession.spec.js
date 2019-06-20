import { shallowMount } from "@vue/test-utils"
import ModalSession from "common/ModalSession"

describe(`TmSessionSignIn`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(() => true),
      getters: {
        connected: true,
        session: {
          accounts: [
            {
              name: `my_account`
            }
          ],
          modals: {
            session: {
              active: true
            }
          }
        }
      }
    }

    wrapper = shallowMount(ModalSession, {
      mocks: {
        $store
      }
    })
  })

  it(`shows a modal containing the session selector`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.html()).toBeDefined()
  })

  it("closes the modal", () => {
    ModalSession.methods.close.call({
      $store
    })

    expect($store.commit).toHaveBeenCalledWith("toggleSessionModal", false)
  })

  it("only the shows the modal according to the store settings", () => {
    wrapper.vm.session.modals.session.active = false
    expect(wrapper.html()).toBeUndefined()
  })
})
