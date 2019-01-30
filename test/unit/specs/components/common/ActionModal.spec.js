import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import ActionModal from "renderer/components/common/ActionModal"

const localVue = createLocalVue()
localVue.use(Vuelidate)

describe(`ActionModal`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        connected: true
      }
    }

    wrapper = shallowMount(ActionModal, {
      localVue,
      propsData: {
        title: `Action Modal`,
        submitFn: jest.fn(),
        validate: jest.fn()
      },
      mocks: {
        $store
      }
    })
    wrapper.vm.open()
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should default to submissionError being null`, () => {
    expect(wrapper.vm.submissionError).toBe(null)
  })

  it(`opens`, () => {
    wrapper.vm.open()

    expect(wrapper.isEmpty()).not.toBe(true)
  })

  it(`closes`, () => {
    wrapper.vm.open()
    wrapper.vm.close()

    expect(wrapper.isEmpty()).toBe(true)
  })

  it(`should close if submitted`, async () => {
    wrapper.vm.close = jest.fn()
    const submitFn = jest.fn()
    await wrapper.vm.submit(submitFn)

    expect(wrapper.vm.close).toHaveBeenCalled()
  })

  it(`should erase password on close`, async () => {
    wrapper.vm.password = `abcd`
    wrapper.vm.close()
    expect(wrapper.vm.password).toBeNull()
  })

  it(`should set the submissionError if the submission is rejected`, async () => {
    const submitFn = jest
      .fn()
      .mockRejectedValue(new Error(`some kind of error message`))
    const self = { submitFn, submissionErrorPrefix: `PREFIX` }
    await ActionModal.methods.submit.call(self)

    expect(self.submissionError).toEqual(`PREFIX: some kind of error message.`)
  })

  it(`should clear the submissionError after a timeout if the function is rejected`, async () => {
    jest.useFakeTimers()

    const submitFn = jest
      .fn()
      .mockRejectedValue(new Error(`some kind of error message`))
    const self = { submitFn, submissionErrorPrefix: `PREFIX` }
    await ActionModal.methods.submit.call(self)

    jest.runAllTimers()
    expect(self.submissionError).toEqual(null)
  })

  it(`run validation`, async () => {
    const validate = jest.fn(() => true)
    const submit = jest.fn()
    const self = {
      validate,
      submit,
      $v: {
        $touch: () => {}
      }
    }
    await ActionModal.methods.validateForm.call(self)

    expect(validate).toHaveBeenCalled()
    expect(submit).toHaveBeenCalled()
  })

  it(`not submit on failed validation`, async () => {
    const validate = jest.fn(() => false)
    const submit = jest.fn()
    const self = {
      validate,
      submit,
      $v: {
        $touch: () => {}
      }
    }
    await ActionModal.methods.validateForm.call(self)

    expect(validate).toHaveBeenCalled()
    expect(submit).not.toHaveBeenCalled()
  })

  it(`sets sending indication`, done => {
    jest.useFakeTimers()

    const validate = jest.fn(() => true)
    const submit = jest.fn(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )
    const self = {
      validate,
      submit,
      $v: {
        $touch: () => {}
      }
    }
    ActionModal.methods.validateForm.call(self).then(() => {
      expect(self.sending).toBe(false)
      done()
    })
    expect(self.sending).toBe(true)
    jest.runAllTimers()
  })

  it(`shows sending indication`, async () => {
    wrapper.setData({ sending: true })
    await wrapper.vm.$nextTick()
    expect(
      wrapper.find(`.action-modal-footer tm-btn-stub`).props(`value`)
    ).toBe(`Sending...`)
    expect(wrapper.vm.$el).toMatchSnapshot()

    wrapper.setData({ sending: false })
    await wrapper.vm.$nextTick()
    expect(
      wrapper.find(`.action-modal-footer tm-btn-stub`).props(`value`)
    ).toBe(`Submit`)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`disables user from submitting when still connecting`, async () => {
    $store = {
      getters: {
        connected: false
      }
    }

    wrapper = shallowMount(ActionModal, {
      localVue,
      propsData: {
        title: `Action Modal`,
        submitFn: jest.fn(),
        validate: jest.fn()
      },
      mocks: {
        $store
      }
    })
    wrapper.vm.open()

    expect(
      wrapper.find(`.action-modal-footer tm-btn-stub`).props(`value`)
    ).toBe(`Connecting...`)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a password input for local signing`, async () => {
    expect(wrapper.vm.selectedSignMethod).toBe(`local`)
    expect(wrapper.find(`#password`).exists()).toBe(true)
  })

  it(`fails validation if the password is missing in local mode`, async () => {
    wrapper.setData({
      selectedSignMethod: `local`,
      password: undefined
    })
    await wrapper.vm.validateForm()
    expect(wrapper.vm.$v.$invalid).toBe(true)

    wrapper.setData({
      selectedSignMethod: `ledger`,
      password: undefined
    })
    await wrapper.vm.validateForm()
    expect(wrapper.vm.$v.$invalid).toBe(false)
  })
})
