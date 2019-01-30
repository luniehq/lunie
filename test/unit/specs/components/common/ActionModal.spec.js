import setup from "../../../helpers/vuex-setup"
import ActionModal from "renderer/components/common/ActionModal"

describe(`ActionModal`, () => {
  let wrapper, store
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
    store = test.store
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

  describe(`runs validation and changes step`, () => {
    it(`if connected to local`, async () => {
      const getterValues = { ledger: { isConnected: false } }
      const validate = jest.fn(() => true)
      const submit = jest.fn()
      const self = {
        ...getterValues,
        validate,
        submit,
        $v: {
          $touch: () => {}
        },
        selectedSignMethod: `local`,
        step: `txDetails`
      }
      await ActionModal.methods.validateChangeStep.call(self)
      expect(validate).toHaveBeenCalled()
      expect(submit).toHaveBeenCalled()
    })

    it(`if connected to ledger and is on 'txDetails' step`, async () => {
      const getterValues = { ledger: { isConnected: true } }
      const validate = jest.fn(() => true)
      const submit = jest.fn()
      const self = {
        ...getterValues,
        validate,
        submit,
        $v: {
          $touch: () => {}
        },
        selectedSignMethod: `ledger`,
        step: `txDetails`
      }
      await ActionModal.methods.validateChangeStep.call(self)
      expect(validate).toHaveBeenCalled()
      expect(submit).not.toHaveBeenCalled()
      expect(self.step).toBe(`sign`)
    })

    it(`if connected to ledger and is on 'sign' step`, async () => {
      const getterValues = { ledger: { isConnected: true } }
      const validate = jest.fn(() => true)
      const submit = jest.fn()
      const self = {
        ...getterValues,
        validate,
        submit,
        $v: {
          $touch: () => {}
        },
        selectedSignMethod: `ledger`,
        step: `sign`
      }
      await ActionModal.methods.validateChangeStep.call(self)
      expect(validate).toHaveBeenCalled()
      expect(submit).toHaveBeenCalled()
    })

    it(`doesn't submit on failed validation`, async () => {
      const validate = jest.fn(() => false)
      const submit = jest.fn()
      const self = {
        validate,
        submit,
        $v: {
          $touch: () => {}
        }
      }
      await ActionModal.methods.validateChangeStep.call(self)
      expect(validate).toHaveBeenCalled()
      expect(submit).not.toHaveBeenCalled()
    })
  })

  describe(`shows sending indication`, () => {
    it(`when signing with local keystore`, done => {
      const getterValues = { ledger: { isConnected: false } }
      const validate = jest.fn(() => true)
      const submit = jest.fn(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )
      const self = {
        ...getterValues,
        validate,
        submit,
        $v: {
          $touch: () => {}
        },
        selectedSignMethod: `local`,
        step: `txDetails`
      }
      ActionModal.methods.validateChangeStep.call(self).then(() => {
        expect(self.sending).toBe(false)
        done()
      })
      expect(self.sending).toBe(true)
      jest.runAllTimers()
    })

    it(`when signing with ledger`, done => {
      const getterValues = { ledger: { isConnected: true } }
      const validate = jest.fn(() => true)
      const submit = jest.fn(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )
      const self = {
        ...getterValues,
        validate,
        submit,
        $v: {
          $touch: () => {}
        },
        selectedSignMethod: `ledger`,
        step: `sign`
      }
      ActionModal.methods.validateChangeStep.call(self).then(() => {
        expect(self.sending).toBe(false)
        done()
      })
      expect(self.sending).toBe(true)
      jest.runAllTimers()
    })
  })

  it(`shows a password input for local signing`, () => {
    expect(wrapper.vm.selectedSignMethod).toBe(`local`)
    expect(wrapper.find(`#password`).exists()).toBe(true)
  })

  it(`fails validation if the password is missing`, async () => {
    wrapper.vm.validateChangeStep()
    expect(wrapper.vm.submitFn).not.toHaveBeenCalled()
  })

  // TODO: test didn't work
  xit(`hides password input if signing with Ledger`, async () => {
    store.commit(`setLedgerConnection`, true)
    expect(wrapper.vm.selectedSignMethod).toBe(`ledger`)
    await wrapper.vm.$nextTick()
    console.log(wrapper.find(`#password`).html())
    expect(wrapper.find(`#password`).exists()).toBe(false)
  })
})
