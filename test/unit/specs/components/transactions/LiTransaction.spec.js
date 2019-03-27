import { mount } from "@vue/test-utils"
import LiTransaction from "transactions/LiTransaction"

describe(`LiTransaction`, () => {
  let wrapper
  const propsData = {
    color: `#FFFFFF`,
    time: new Date(Date.now()).toISOString(),
    block: 500
  }
  const day = 86400000

  beforeEach(() => {
    wrapper = mount(LiTransaction, {
      propsData,
      mocks: {
        $route: {
          path: `/transactions`
        }
      },
      slots: {
        caption: `<span>Some Caption</span>`,
        details: `<span>Some Details</span>`
      },
      stubs: [`router-link`]
    })
  })

  it(`should show a transaction item`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show logo based on path`, () => {
    const $route = { path: `/transactions` }
    let path = LiTransaction.computed.logoPath.call({ $route })
    expect(path).toBe(`images/cosmos-logo.png`)

    $route.path = `/staking/my-delegations`
    path = LiTransaction.computed.logoPath.call({ $route })
    expect(path).toBe(`../images/cosmos-logo.png`)
  })

  it(`Should print the hour only if the same day`, () => {
    expect(
      LiTransaction.computed.date(
        { time: new Date(Date.now()).toISOString() }
      )
    ).toEqual(
      `00:00:42`
    )
  })

  it(`Should print the datetime if we are in a different day`, () => {
    expect(
      LiTransaction.computed.date(
        { time: new Date(Date.now() - day * 2).toISOString() }
      )
    ).toEqual(`Dec 30th 1969 00:00:42`)
  })
})
