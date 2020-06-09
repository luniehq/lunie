import { shallowMount } from "@vue/test-utils"
import DisconnectedBar from "common/DisconnectedBar"

describe(`DisconnectedBar`, () => {
  let wrapper, $store

  beforeEach(async () => {
    $store = {
      dispatch: jest.fn(),
      state: {
        connection: {
          stopConnecting: true,
        },
      },
    }

    wrapper = shallowMount(DisconnectedBar, {
      mocks: {
        $store,
      },
      stubs: [`router-link`],
    })
  })

  it(`shows the disconnected bar`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`hides the disconnected bar if proper connection assumped`, () => {
    $store = {
      state: {
        connection: {
          stopConnecting: false,
        },
      },
    }

    wrapper = shallowMount(DisconnectedBar, {
      mocks: {
        $store,
      },
      stubs: [`router-link`],
    })
    expect(wrapper.html()).toBeUndefined()
  })

  it(`can trigger a reconnection`, () => {
    wrapper.find("a").trigger("click")
    expect($store.dispatch).toHaveBeenCalledWith(`reconnect`)
  })
})
