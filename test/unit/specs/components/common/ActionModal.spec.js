import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import ActionModal from "src/components/common/ActionModal"
import { focusParentLast } from "directives"

const localVue = createLocalVue()
localVue.use(Vuelidate)
localVue.directive("focus-last", focusParentLast)

describe(`ActionModal`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        connected: true,
        session: {
          signedIn: true,
          sessionType: `local`,
          browserWithLedgerSupport: null
        },
        bondDenom: `uatom`,
        wallet: {
          loading: false
        },
        ledger: {
          cosmosApp: {},
          isConnected: true
        },
        liquidAtoms: 1230000000
      }
    }

    wrapper = shallowMount(ActionModal, {
      localVue,
      propsData: {
        title: `Action Modal`,
        submitFn: jest.fn(),
        simulateFn: jest.fn(),
        validate: jest.fn()
      },
      mocks: {
        $store
      }
    })
    wrapper.vm.open()
  })

  it(`should set the submissionError if the submission is rejected`, async () => {
    const submitFn = jest
      .fn()
      .mockRejectedValue(new Error(`some kind of error message`))
    const $store = { dispatch: jest.fn() }
    const self = {
      $store,
      submitFn,
      submissionErrorPrefix: `PREFIX`,
      connectLedger: () => {}
    }
    await ActionModal.methods.submit.call(self)

    expect(self.submissionError).toEqual(`PREFIX: some kind of error message.`)
  })

  it(`should clear the submissionError after a timeout if the function is rejected`, async () => {
    jest.useFakeTimers()

    const submitFn = jest
      .fn()
      .mockRejectedValue(new Error(`some kind of error message`))
    const $store = { dispatch: jest.fn() }
    const self = {
      $store,
      submitFn,
      submissionErrorPrefix: `PREFIX`,
      connectLedger: () => {}
    }
    await ActionModal.methods.submit.call(self)

    jest.runAllTimers()
    expect(self.submissionError).toEqual(null)
  })

  it(`should default to submissionError being null`, () => {
    expect(wrapper.vm.submissionError).toBe(null)
  })

  it(`opens`, () => {
    wrapper.vm.track = jest.fn()
    wrapper.vm.open()

    expect(wrapper.isEmpty()).not.toBe(true)
    expect(wrapper.vm.track).toHaveBeenCalled()
  })

  it(`opens session modal and closes itself`, () => {
    const $store = { commit: jest.fn() }
    const self = { $store, close: jest.fn() }
    ActionModal.methods.goToSession.call(self)
    expect(self.close).toHaveBeenCalled()
    expect($store.commit).toHaveBeenCalledWith(`setSessionModalView`, `welcome`)
    expect($store.commit).toHaveBeenCalledWith(`toggleSessionModal`, true)
  })

  it(`shows a password input for local signing`, async () => {
    wrapper.vm.step = `sign`
    expect(wrapper.vm.selectedSignMethod).toBe(`local`)
    await wrapper.vm.$nextTick()
    expect(wrapper.find(`#password`).exists()).toBe(true)
  })

  it(`hides password input if signing with Ledger`, async () => {
    wrapper.vm.session.sessionType = `ledger`
    wrapper.vm.step = `sign`
    expect(wrapper.vm.selectedSignMethod).toBe(`ledger`)
    expect(wrapper.find(`#password`).exists()).toBe(false)
  })

  it(`should dispatch connectLedgerApp`, () => {
    const $store = { dispatch: jest.fn() }
    const self = { $store }
    ActionModal.methods.connectLedger.call(self)
    expect($store.dispatch).toHaveBeenCalledWith(`connectLedgerApp`)
  })

  describe(`should show the action modal`, () => {
    describe(`when user has logged in`, () => {
      describe(`with local keystore`, () => {
        it(`on default step`, () => {
          expect(wrapper.vm.$el).toMatchSnapshot()
        })

        it(`on fees step`, async () => {
          wrapper.vm.step = `fees`
          await wrapper.vm.$nextTick()
          expect(wrapper.vm.$el).toMatchSnapshot()
        })

        it(`on sign step`, async () => {
          wrapper.vm.step = `sign`
          await wrapper.vm.$nextTick()
          expect(wrapper.vm.$el).toMatchSnapshot()
        })
      })

      describe(`with ledger`, () => {
        it(`on default step`, async () => {
          wrapper.vm.session.sessionType = `ledger`
          await wrapper.vm.$nextTick()
          expect(wrapper.vm.$el).toMatchSnapshot()
        })

        it(`on fees step`, async () => {
          wrapper.vm.session.sessionType = `ledger`
          wrapper.vm.step = `fees`
          await wrapper.vm.$nextTick()
          expect(wrapper.vm.$el).toMatchSnapshot()
        })

        it(`on sign step`, async () => {
          wrapper.vm.session.sessionType = `ledger`
          wrapper.vm.step = `sign`
          await wrapper.vm.$nextTick()
          expect(wrapper.vm.$el).toMatchSnapshot()
        })
      })
    })

    it(`when user hasn't logged in`, async () => {
      wrapper.vm.session.signedIn = false
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`close modal`, () => {
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

    it(`should clear error on close`, () => {
      wrapper.vm.submissionError = `TRUMP`
      wrapper.vm.close()
      expect(wrapper.vm.submissionError).toBeNull()
    })

    it(`should set the step to transaction details`, () => {
      wrapper.vm.step = `sign`
      wrapper.vm.close()
      expect(wrapper.vm.step).toBe(`details`)
    })

    it(`should close on escape key press`, () => {
      wrapper.trigger("keyup.esc")
      expect(wrapper.isEmpty()).toBe(true)
    })
  })

  describe(`validates child form`, () => {
    it(`default`, () => {
      const isValid = ActionModal.computed.isValidChildForm.call({})
      expect(isValid).toBe(true)
    })

    it(`when validation function is present`, () => {
      const self = {
        validate: jest.fn(() => true)
      }
      const isValid = ActionModal.computed.isValidChildForm.call(self)
      expect(isValid).toBe(true)
      expect(self.validate).toHaveBeenCalled()
    })
  })

  describe(`validates password and gas price`, () => {
    describe(`success`, () => {
      it(`when password is required`, () => {
        wrapper.vm.step = `sign`
        wrapper.vm.session.sessionType = `localKeystore`
        wrapper.setData({ password: `1234567890` })
        expect(wrapper.vm.isValidInput(`password`)).toBe(true)
      })

      it(`when gas price is set on dev mode session`, () => {
        wrapper.vm.step = `fees`
        wrapper.vm.session.experimentalMode = true
        wrapper.setData({ gasPrice: 2.5e-8 })
        expect(wrapper.vm.isValidInput(`gasPrice`)).toBe(true)
      })
    })

    describe(`fails`, () => {
      it(`if password is undefined`, () => {
        wrapper.vm.step = `sign`
        wrapper.vm.session.sessionType = `localKeystore`
        wrapper.setData({ password: undefined })
        expect(wrapper.vm.isValidInput(`password`)).toBe(false)
      })

      it(`if gas price is out of range`, () => {
        wrapper.vm.step = `fees`
        wrapper.vm.session.experimentalMode = true
        wrapper.setData({ gasPrice: 1500000 })
        expect(wrapper.vm.isValidInput(`gasPrice`)).toBe(false)
      })

      it(`if gas price is undefined`, () => {
        wrapper.vm.step = `fees`
        wrapper.vm.session.experimentalMode = true
        wrapper.setData({ gasPrice: undefined })
        expect(wrapper.vm.isValidInput(`gasPrice`)).toBe(false)
      })
    })
  })

  describe(`validates total price does not exceed available atoms`, () => {
    beforeEach(() => {
      wrapper.setData({ gasPrice: 10 })
      wrapper.setData({ gasEstimate: 2 })
    })

    describe(`success`, () => {
      it(`when the total invoice amount is less than the balance`, () => {
        wrapper.setProps({ amount: 1210 })
        expect(wrapper.vm.isValidInput(`invoiceTotal`)).toBe(true)
      })
    })

    describe(`fails`, () => {
      it(`when the total invoice amount is more than the balance`, () => {
        wrapper.setProps({ amount: 1211 })
        expect(wrapper.vm.isValidInput(`invoiceTotal`)).toBe(false)
      })
    })
  })

  describe(`simulate`, () => {
    it(`should simulate transaction to get estimated gas`, async () => {
      const self = {
        step: `details`,
        gasEstimate: null,
        simulateFn: jest.fn(() => 123456),
        submissionError: null,
        submissionErrorPrefix: null
      }
      await ActionModal.methods.simulate.call(self)
      expect(self.gasEstimate).toBe(123456)
      expect(self.step).toBe(`fees`)
      expect(self.submissionError).toBeNull()
    })

    it(`should fail simulation if request fails`, async () => {
      const self = {
        step: `details`,
        gasEstimate: null,
        simulateFn: jest.fn(() => Promise.reject(Error(`invalid request`))),
        submissionError: null,
        submissionErrorPrefix: `Error`
      }
      jest.useFakeTimers()
      await ActionModal.methods.simulate.call(self)
      expect(self.gasEstimate).toBe(null)
      expect(self.step).toBe(`details`)
      expect(self.submissionError).toBe(`Error: invalid request.`)
    })
  })

  describe(`runs validation and changes step`, () => {
    let self, getterValues

    beforeEach(() => {
      getterValues = { session: { sessionType: `ledger` } }
      self = {
        ...getterValues,
        submit: jest.fn(),
        simulate: jest.fn(),
        isValidChildForm: true,
        isValidInput: jest.fn(() => true),
        selectedSignMethod: `local`,
        step: `details`
      }
    })

    describe(`on tx details step`, () => {
      it(`when using local keystore`, async () => {
        await ActionModal.methods.validateChangeStep.call(self)
        expect(self.simulate).toHaveBeenCalled()
      })

      it(`when using ledger`, async () => {
        self.session.sessionType = `ledger`
        self.selectedSignMethod = `ledger`

        await ActionModal.methods.validateChangeStep.call(self)
        expect(self.simulate).toHaveBeenCalled()
      })
    })

    describe(`on fees step`, () => {
      beforeEach(() => {
        self.step = `fees`
      })

      it(`success`, async () => {
        await ActionModal.methods.validateChangeStep.call(self)
        expect(self.step).toBe(`sign`)
      })

      it(`fails if gas price is invalid`, async () => {
        self.isValidInput = jest.fn(() => false)
        await ActionModal.methods.validateChangeStep.call(self)
        expect(self.step).toBe(`fees`)
      })
    })

    describe(`on sign step`, () => {
      beforeEach(() => {
        self.step = `sign`
      })

      it(`when using local keystore`, async () => {
        self.password = `1234567890`
        await ActionModal.methods.validateChangeStep.call(self)
        expect(self.submit).toHaveBeenCalled()
      })

      it(`fails validation if the password is missing`, async () => {
        self.password = null
        self.isValidInput = jest.fn(() => false)
        await ActionModal.methods.validateChangeStep.call(self)
        expect(self.submit).not.toHaveBeenCalled()
      })

      it(`when using ledger`, async () => {
        self.session.sessionType = `ledger`
        self.selectedSignMethod = `ledger`

        await ActionModal.methods.validateChangeStep.call(self)
        expect(self.submit).toHaveBeenCalled()
      })

      it(`doesn't submit on failed validation`, async () => {
        self.isValidInput = jest.fn(() => false)
        await ActionModal.methods.validateChangeStep.call(self)
        expect(self.submit).not.toHaveBeenCalled()
      })
    })

    describe(`invalid step`, () => {
      it(`does anything`, async () => {
        self.step = `other`
        await ActionModal.methods.validateChangeStep.call(self)
      })
    })
  })

  describe(`shows sending indication`, () => {
    let self, getterValues

    beforeEach(() => {
      getterValues = { session: { sessionType: `ledger` } }
      self = {
        ...getterValues,
        submit: jest.fn(
          () => new Promise(resolve => setTimeout(resolve, 1000))
        ),
        simulate: jest.fn(),
        isValidChildForm: true,
        isValidInput: jest.fn(() => true),
        selectedSignMethod: `local`,
        step: `details`
      }
    })

    it(`when signing with local keystore`, done => {
      jest.useFakeTimers()
      self.isValidChildForm = true
      ActionModal.methods.validateChangeStep.call(self).then(() => {
        expect(self.sending).toBe(false)
        done()
      })
      expect(self.sending).toBe(true)
      jest.runAllTimers()
    })

    it(`when signing with ledger`, done => {
      self.session.sessionType = `ledger`
      self.step = `sign`
      jest.useFakeTimers()
      ActionModal.methods.validateChangeStep.call(self).then(() => {
        expect(self.sending).toBe(false)
        done()
      })
      expect(self.sending).toBe(true)
      jest.runAllTimers()
    })
  })

  describe(`selected sign method`, () => {
    it(`selects local signed in with account`, () => {
      expect(wrapper.vm.selectedSignMethod).toBe(`local`)
      expect(wrapper.vm.signMethods).toEqual([
        {
          key: `(Unsafe) Local Account`,
          value: `local`
        }
      ])
    })

    it(`selects ledger if device is connected`, () => {
      $store.getters.session.sessionType = `ledger`
      expect(wrapper.vm.selectedSignMethod).toBe(`ledger`)
      expect(wrapper.vm.signMethods).toEqual([
        {
          key: `Ledger Nano S`,
          value: `ledger`
        }
      ])
    })
  })
})
