import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionAccountDelete from "common/TmSessionAccountDelete"

describe(`TmSessionAccountDelete`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(async () => true)
    }

    wrapper = shallowMount(TmSessionAccountDelete, {
      localVue,
      mocks: {
        $store
      }
    })
    wrapper.setData({
      deletionPassword: ``,
      deletionWarning: false
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should set the current view to the state`, () => {
    const self = {
      $emit: jest.fn()
    }
    TmSessionAccountDelete.methods.setState.call(self, `someState`)
    expect(self.$emit).toHaveBeenCalledWith(`route-change`, `someState`)
  })

  it(`should go back on successful deletion`, async () => {
    wrapper.setData({
      deletionPassword: `1234567890`,
      deletionWarning: true
    })
    wrapper.vm.$emit = jest.fn()
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$emit).toHaveBeenCalledWith(`route-change`, `welcome`)
  })

  it(`should show error if password not 10 long`, async () => {
    wrapper.setData({
      deletionPassword: `123`,
      deletionWarning: true
    })
    await wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(`.form-msg-error`)).toBeDefined()
  })

  it(`should show error if deletionWarning is not acknowledged`, async () => {
    wrapper.setData({
      deletionPassword: `1234567890`,
      deletionWarning: false
    })
    await wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(`.form-msg-error`)).toBeDefined()
  })

  it(`should show a notification if deletion failed`, async () => {
    const error = {
      message: `Error body`
    }

    $store.commit = jest.fn()
    $store.dispatch = jest.fn().mockRejectedValue(error)

    wrapper.setData({
      deletionPassword: `1234567890`,
      deletionWarning: true
    })

    await wrapper.vm.onSubmit()
    expect($store.commit).toHaveBeenCalledWith(`notifyError`, {
      body: `Error body`,
      title: `Account Deletion Failed`
    })
  })
})
