import setup from "../../../helpers/vuex-setup"
import ActionModal from "renderer/components/common/ActionModal"

describe(`ActionModal`, () => {
  let wrapper
  const instance = setup()

  beforeEach(() => {
    const test = instance.mount(ActionModal, {
      propsData: {
        title: `Action Modal`,
        submitFn: jest.fn(),
        validate: jest.fn()
      }
    })
    wrapper = test.wrapper
    wrapper.vm.open()

    jest.useFakeTimers()
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

  it(`should erase password on close`, () => {
    wrapper.vm.password = `mySecretPassword`
    wrapper.vm.close()
    expect(wrapper.vm.password).toBeNull()
  })

  it(`should set the step to transaction details`, () => {
    wrapper.vm.step = `sign`
    wrapper.vm.close()
    expect(wrapper.vm.step).toBe(`txDetails`)
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
    const submitFn = jest
      .fn()
      .mockRejectedValue(new Error(`some kind of error message`))
    const self = { submitFn, submissionErrorPrefix: `PREFIX` }
    await ActionModal.methods.submit.call(self)

    jest.runAllTimers()
    expect(self.submissionError).toEqual(null)
  })

  it(`run validation if connected to local`, async () => {
    wrapper.vm.selectedSignMethod = `local`
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

  it(`change step if connected to ledger`, async () => {
    wrapper.vm.selectedSignMethod = `ledger`
    wrapper.vm.step = `txDetails`
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
    expect(submit).not.toHaveBeenCalled()
    expect(wrapper.vm.step).toBe(`sign`)
  })

  it(`run validation if connected to ledger and is on sign step`, async () => {
    wrapper.vm.selectedSignMethod = `ledger`
    wrapper.vm.step = `sign`
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

  // it(`shows sending indication`, done => {
  //   const validate = jest.fn(() => true)
  //   const submit = jest.fn(
  //     () => new Promise(resolve => setTimeout(resolve, 1000))
  //   )
  //   const self = {
  //     validate,
  //     submit,
  //     $v: {
  //       $touch: () => {}
  //     }
  //   }
  //   ActionModal.methods.validateForm.call(self).then(() => {
  //     expect(self.sending).toBe(false)
  //     done()
  //   })
  //   expect(self.sending).toBe(true)
  //   jest.runAllTimers()
  // })

  it(`shows sending indication`, done => {
    const test = instance.mount(ActionModal, {
      propsData: {
        title: `Action Modal`,
        submitFn: jest.fn(
          () => new Promise(resolve => setTimeout(resolve, 1000))
        ),
        validate: jest.fn(() => true)
      }
    })
    wrapper = test.wrapper
    wrapper.vm.open()

    wrapper.vm.validateForm().then(() => {
      expect(wrapper.vm.sending).toBe(false)
      expect(wrapper.vm.$el).toMatchSnapshot()
      done()
    })
    expect(wrapper.vm.sending).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()

    jest.runAllTimers()
  })

  it(`shows a password input for local signing`, async () => {
    expect(wrapper.vm.selectedSignMethod).toBe(`local`)
    expect(wrapper.find(`#password`).exists()).toBe(true)
  })

  it(`fails validation if the password is missing`, async () => {
    wrapper.vm.validateForm()
    expect(wrapper.vm.submitFn).not.toHaveBeenCalled()
  })

  it(`hides password input if signing with Ledger`, async () => {
    wrapper.vm.selectedSignMethod = `ledger`
    expect(wrapper.find(`#password`).exists()).toBe(false)
  })
})
