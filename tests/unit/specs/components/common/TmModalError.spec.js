import Vuex from "vuex"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmModalError from "common/TmModalError"

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmModalError`, () => {
  let wrapper
  const store = new Vuex.Store({
    getters: {
      lastHeader: () => ({ chain_id: `gaia-test`, height: `31337` })
    }
  })

  beforeEach(() => {
    wrapper = shallowMount(TmModalError, {
      localVue,
      store
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has an icon`, () => {
    expect(
      wrapper
        .find(`.tm-modal-error__icon i.material-icons`)
        .text()
        .trim()
    ).toBe(`error_outline`)
  })

  it(`shows an icon if specified`, () => {
    wrapper.setProps({ icon: `icon-x` })
    expect(
      wrapper
        .find(`.tm-modal-error__icon i.material-icons`)
        .text()
        .trim()
    ).toBe(`icon-x`)
  })

  it(`has a title`, () => {
    expect(
      wrapper
        .find(`.tm-modal-error__title`)
        .text()
        .trim()
    ).toBe(`Voyager ran into an error`)
  })

  it(`shows a title if specified`, () => {
    wrapper.setProps({ title: `title-x` })
    expect(
      wrapper
        .find(`.tm-modal-error__title`)
        .text()
        .trim()
    ).toBe(`title-x`)
  })

  it(`has a body`, () => {
    expect(
      wrapper
        .find(`.tm-modal-error__body`)
        .text()
        .trim()
    ).toContain(
      `Voyager has encountered a critical error that blocks the app from running. Please create an issue and include a copy of the app logs.`
    )
  })

  it(`shows a body if specified`, () => {
    wrapper.setProps({ body: `body-x` })
    expect(
      wrapper
        .find(`.tm-modal-error__body`)
        .text()
        .trim()
    ).toBe(`body-x`)
  })

  it(`has a button to create an issue`, () => {
    wrapper.find(`#tm-modal-error__btn-issue`).trigger(`click`)
  })
})
