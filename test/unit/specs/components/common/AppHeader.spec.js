import AppHeader from "common/AppHeader"
import { mount } from "@vue/test-utils"

describe(`AppHeader`, () => {
  let wrapper, $store

  it(`should display the sidebar on desktop`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        config: {
          desktop: true,
          activeMenu: `app`
        }
      }
    }

    wrapper = mount(AppHeader, {
      mocks: {
        $store
      },
      stubs: { "app-menu": true }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should display the sidebar on desktop`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        config: {
          desktop: true,
          activeMenu: ``
        }
      }
    }

    wrapper = mount(AppHeader, {
      mocks: {
        $store
      },
      stubs: { "app-menu": true }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show the sidebar as a menu on mobile`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        config: {
          desktop: false,
          activeMenu: `app`
        }
      }
    }

    wrapper = mount(AppHeader, {
      mocks: {
        $store
      },
      stubs: { "app-menu": true }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show the sidebar as a menu on mobile`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        config: {
          desktop: false,
          activeMenu: ``
        }
      }
    }

    wrapper = mount(AppHeader, {
      mocks: {
        $store
      },
      stubs: { "app-menu": true }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should call the open menu function on click`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        config: {
          desktop: false,
          activeMenu: ``
        }
      }
    }

    wrapper = mount(AppHeader, {
      mocks: {
        $store
      },
      stubs: { "app-menu": true }
    })

    wrapper.vm.enableMenu = jest.fn()

    wrapper.find(`.open-menu`).trigger(`click`)
    expect(wrapper.vm.enableMenu).toHaveBeenCalled()
  })

  it(`should call the close menu function on click`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        config: {
          desktop: false,
          activeMenu: `app`
        }
      }
    }

    wrapper = mount(AppHeader, {
      mocks: {
        $store
      },
      stubs: { "app-menu": true }
    })

    wrapper.vm.close = jest.fn()

    wrapper.find(`.close-menu`).trigger(`click`)
    expect(wrapper.vm.close).toHaveBeenCalled()
  })

  describe(`Close`, () => {
    it(`should call the commit setActiveMenu with an empty string`, () => {
      $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: {
          config: {
            desktop: false,
            activeMenu: `app`
          }
        }
      }

      wrapper = mount(AppHeader, {
        mocks: {
          $store
        },
        stubs: { "app-menu": true }
      })

      wrapper.find(`.close-menu`).trigger(`click`)
      expect($store.commit).toHaveBeenCalledWith(`setActiveMenu`, ``)
    })
  })

  describe(`enableMenu`, () => {
    it(`should call the commit setActiveMenu with 'app'`, () => {
      $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: {
          config: {
            desktop: false,
            activeMenu: ``
          }
        }
      }

      wrapper = mount(AppHeader, {
        mocks: {
          $store
        },
        stubs: { "app-menu": true }
      })

      wrapper.find(`.open-menu`).trigger(`click`)
      expect($store.commit).toHaveBeenCalledWith(`setActiveMenu`, `app`)
    })
  })

  describe(`watchWindowSize`, () => {
    it(`should commit desktop status to false`, () => {
      global.innerWidth = 1023
      global.dispatchEvent(new Event(`resize`))

      expect($store.commit).toHaveBeenCalledWith(`setConfigDesktop`, false)
    })

    it(`should commit desktop status to false`, () => {
      global.innerWidth = 1024
      global.dispatchEvent(new Event(`resize`))

      expect($store.commit).toHaveBeenCalledWith(`setConfigDesktop`, false)
    })

    it(`should commit desktop status to true`, () => {
      global.innerWidth = 1025
      global.dispatchEvent(new Event(`resize`))

      expect($store.commit).toHaveBeenCalledWith(`setConfigDesktop`, true)
    })
  })

  describe(`updated`, () => {
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
