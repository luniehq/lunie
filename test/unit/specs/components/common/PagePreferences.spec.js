import { shallowMount } from "@vue/test-utils"
import PagePreferences from "renderer/components/common/PagePreferences"

jest.mock(`renderer/google-analytics.js`, () => () => { })

describe(`PagePreferences`, () => {
  let wrapper, $store

  const getters = {
    session: {
      address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
      errorCollection: false,
      experimentalMode: false
    },
    mockedConnector: false,
    nodeUrl: `http://localhost:9070`
  }

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters
    }

    wrapper = shallowMount(PagePreferences, {
      mocks: {
        $store
      }
    })
  })

  it(`has the expected html structure if connected`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.vm.$el.outerHTML).toContain(`Node IP`)
    expect(wrapper.vm.$el.outerHTML).toContain(`Automatically send`)
  })
  describe(`should set error collection`, () => {
    it(`when the user is in production or insecure mode`, async () => {
      const errorCollection = false
      const dispatch = jest.fn()
      PagePreferences.methods.setErrorCollection.call({
        $store: {
          dispatch
        },
        session: {
          address: `cosmos1address`,
          experimentalMode: false
        }
      })
      expect(dispatch).toHaveBeenCalledWith(`setErrorCollection`, {
        address: `cosmos1address`,
        optin: !errorCollection
      })
    })

    it(`should not update error collection when user is on experimental mode`, async () => {
      const errorCollection = false
      const dispatch = jest.fn()

      PagePreferences.methods.setErrorCollection.call({
        $store: {
          dispatch
        },
        session: {
          address: `cosmos1address`,
          experimentalMode: true
        }
      })
      expect(dispatch).not.toHaveBeenCalledWith(`setErrorCollection`, {
        address: `cosmos1address`,
        optin: !errorCollection
      })
    })

    it(`should set an error when user tries to set error collection on experimental mode`, async () => {
      wrapper = shallowMount(PagePreferences, {
        mocks: {
          $store: {
            dispatch: jest.fn(),
            getters: {
              session: {
                address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
                errorCollection: false,
                experimentalMode: true
              },
              mockedConnector: false,
              nodeUrl: `http://localhost:9070`
            }
          }
        }
      })

      jest.useFakeTimers()
      wrapper.vm.setErrorCollection() //old style to test timers

      expect(wrapper.vm.showError).toBe(true)
      expect(wrapper.vm.$el.outerHTML).toContain(`Error collection is disabled during development.`)

      jest.runAllTimers()
      expect(wrapper.vm.showError).toBe(false)
    })
  })
})
