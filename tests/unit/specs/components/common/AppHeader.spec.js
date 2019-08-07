import AppHeader from "common/AppHeader"
import { shallowMount } from "@vue/test-utils"

describe(`AppHeader`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        session: {
          experimentalMode: false,
          insecureMode: true
        }
      }
    }

    wrapper = shallowMount(AppHeader, {
      mocks: {
        $store
      },
      methods: {
        watchWindowSize: () => {} // overwriting to not cause side effects when setting the data in tests
      },
      stubs: [`router-link`]
    })
  })

  it(`should display the sidebar on desktop`, () => {
    wrapper.setData({
      desktop: true,
      open: true
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show the sidebar as a menu on mobile`, () => {
    wrapper.setData({
      desktop: false,
      open: true
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should open the menu on click`, () => {
    wrapper.vm.close()

    wrapper.find(`.open-menu`).trigger(`click`)
    expect(wrapper.vm.open).toBe(true)
  })

  it(`should close menu on click`, () => {
    wrapper.vm.show()

    wrapper.find(`.close-menu`).trigger(`click`)
    expect(wrapper.vm.open).toBe(false)
  })

  describe(`watchWindowSize`, () => {
    beforeEach(() => {
      wrapper = shallowMount(AppHeader, {
        mocks: {
          $store
        },
        stubs: [`router-link`]
      })
    })

    it(`should set desktop status to false`, () => {
      global.innerWidth = 1023
      global.dispatchEvent(new Event(`resize`))

      expect(wrapper.vm.desktop).toBe(false)
    })

    it(`should set desktop status to true`, () => {
      global.innerWidth = 1025
      global.dispatchEvent(new Event(`resize`))

      expect(wrapper.vm.desktop).toBe(true)
    })

    it(`should watch window size on update`, () => {
      const window = { onresize: undefined }
      const self = {
        watchWindowSize: jest.fn(),
        window
      }
      AppHeader.updated.call(self)
      expect(self.watchWindowSize).toHaveBeenCalled()
    })
  })
})
