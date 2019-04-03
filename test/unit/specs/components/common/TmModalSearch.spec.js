import TmModalSearch from "common/TmModalSearch"
import setup from "../../../helpers/vuex-setup"

describe(`TmModalSearch`, () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TmModalSearch, { propsData: { type: `transactions` } })
    store = instance.store
    wrapper = instance.wrapper
    store.commit(`setSearchVisible`, [`transactions`, true])
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.html()).not.toBeUndefined()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should focus search on opening`, async () => {
    jest.useFakeTimers()
    document.body.focus()
    store.commit(`setSearchVisible`, [`transactions`, false])
    store.commit(`setSearchVisible`, [`transactions`, true])
    jest.runAllTimers()
    expect(document.activeElement).toBe(
      wrapper.vm.$el.querySelector(`.tm-field`)
    )
  })

  it(`should close`, () => {
    wrapper.find(`button`).trigger(`click`)
    expect(store.commit).toHaveBeenCalledWith(`setSearchVisible`, [
      `transactions`,
      false
    ])
    expect(wrapper.html()).toBeUndefined()
  })

  it(`should show search query`, () => {
    store.commit(`setSearchQuery`, [`transactions`, `abc`])
    expect(wrapper.vm.query).toBe(`abc`)
  })

  it(`should update the search query`, () => {
    wrapper.vm.query = `def`
    expect(store.commit).toHaveBeenCalledWith(`setSearchQuery`, [
      `transactions`,
      `def`
    ])
  })
})
