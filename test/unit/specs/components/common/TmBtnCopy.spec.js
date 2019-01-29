import setup from "../../../helpers/vuex-setup"
import TmBtnCopy from "renderer/components/common/TmBtnCopy"

describe(`TmBtnCopy`, () => {
  let wrapper, store
  const instance = setup()

  beforeEach(() => {
    const test = instance.mount(TmBtnCopy, {
      propsData: {
        title: `title`,
        body: `body`,
        value: `this is a test`
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

  it(`should truncate long messages`, () => {
    wrapper.setProps({ value: `123456789012345678901234567890`, body: `` })
    wrapper.trigger(`click`)
    expect(store.commit.mock.calls[0][1].body).not.toContain(
      `123456789012345678901234567890`
    )
    expect(store.commit.mock.calls[0][1].body).toContain(`1234567890`)
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
