import setup from "../../../helpers/vuex-setup"
import AnchorCopy from "renderer/components/common/AnchorCopy"

describe(`AnchorCopy`, () => {
  let wrapper, store
  const instance = setup()

  beforeEach(() => {
    const test = instance.mount(AnchorCopy, {
      propsData: {
        title: `title`,
        body: `body`,
        value: `this is a test`,
        label: `label`,
        icon: `icon`
      }
    })
    wrapper = test.wrapper
    store = test.store

    wrapper.vm.copy = jest.fn()
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it(`should open a notification`, () => {
    wrapper.setProps({ body: `` })
    wrapper.trigger(`click`)
    expect(store.commit).toHaveBeenCalled()
    expect(store.commit.mock.calls[0][0]).toBe(`notify`)
    expect(store.commit.mock.calls[0][1].body).toContain(`this is a test`)
  })

  it(`should use a provided title in message`, () => {
    wrapper.setProps({ title: `Title A` })
    wrapper.trigger(`click`)
    expect(store.commit.mock.calls[0][1].title).toBe(`Title A`)
  })

  it(`should use a provided body in message`, () => {
    wrapper.setProps({ body: `Body A` })
    wrapper.trigger(`click`)
    expect(store.commit.mock.calls[0][1].body).toBe(`Body A`)
  })
})
