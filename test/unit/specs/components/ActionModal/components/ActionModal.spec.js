import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import ActionModal from "src/ActionModal/components/ActionModal"
import { focusParentLast } from "directives"

const localVue = createLocalVue()
localVue.use(Vuelidate)
localVue.directive("focus-last", focusParentLast)
localVue.directive("focus", () => {})

let mockSimulate = jest.fn(() => 123456)
let mockSend = jest.fn(() => ({
  included: () => Promise.resolve(),
  hash: "HASH1234HASH"
}))
let mockSetContext = jest.fn()

jest.mock(`src/ActionModal/utils/ActionManager.js`, () => {
  return jest.fn(() => {
    return {
      setMessage: jest.fn(),
      setContext: mockSetContext,
      simulate: mockSimulate,
      send: mockSend
    }
  })
})

const modalContext = {
  connection: {
    externals: {
      node: {
        url: "http://lunie.io"
      }
    },
    lastHeader: {
      chain_id: "cosmoshub"
    },
    connected: true
  },
  session: {
    address: "cosmos1abcdefghijklmop",
    localKeyPairName: "localKeyPairName"
  },
  delegation: {
    committedDelegates: []
  }
}

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
        extension: {
          enabled: true
        },
        bondDenom: `uatom`,
        wallet: {
          loading: false
        },
        ledger: {
          cosmosApp: {},
          isConnected: true
        },
        liquidAtoms: 1230000000,
        modalContext
      }
    }

    wrapper = shallowMount(ActionModal, {
      localVue,
      propsData: {
        title: `Action Modal`,
        validate: jest.fn(),
        transactionData: {
          type: "MsgSend",
          denom: "uatom",
          validatorAddress: "cosmos12345"
        },
        notifyMessage: {
          title: `Successful transaction`,
          body: `You have successfully completed a transaction.`
        }
      },
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        }
      }
    })
    wrapper.vm.open()
  })

  it(`should set the submissionError if the submission is rejected`, async () => {
    const ActionManagerSend = jest
      .fn()
      .mockRejectedValue(new Error(`some kind of error message`))
    const $store = { dispatch: jest.fn() }
    const self = {
      $store,
      actionManager: {
        setContext: () => {},
        simulate: () => 12345,
        send: ActionManagerSend
      },
      transactionData: {
        type: "TYPE",
        denom: "uatom",
        validatorAddress: "cosmos12345"
      },
      submissionErrorPrefix: `PREFIX`,
      trackEvent: jest.fn(),
      connectLedger: () => {}
    }
    await ActionModal.methods.submit.call(self)

    expect(self.submissionError).toEqual(`PREFIX: some kind of error message.`)
  })

  it(`should default to submissionError being null`, () => {
    expect(wrapper.vm.submissionError).toBe(null)
  })

  it(`opens`, () => {
    wrapper.vm.trackEvent = jest.fn()
    wrapper.vm.open()

    expect(wrapper.isEmpty()).not.toBe(true)
    expect(wrapper.vm.trackEvent).toHaveBeenCalled()
  })

  it(`opens session modal and closes itself`, () => {
    const $store = { commit: jest.fn() }
    const self = { $store, close: jest.fn(), $router: { push: jest.fn() } }
    ActionModal.methods.goToSession.call(self)
    expect(self.close).toHaveBeenCalled()
    expect(self.$router.push).toHaveBeenCalledWith(`/welcome`)
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
      const signMethods = ["local", "ledger", "extension", "explore"]
      const steps = [
        {
          name: "on fees step",
          step: "fees"
        },
        {
          name: "on sign step",
          step: "sign"
        },
        {
          name: "sending",
          step: "sign",
          sending: true
        },
        {
          name: "waiting for inclusion",
          step: "send"
        }
      ]

      signMethods.forEach(method => {
        describe(`with local ${method}`, () => {
          steps.forEach(async ({ name, step, sending }) => {
            it(name, async () => {
              Object.assign(wrapper.vm, { step, sending })
              await wrapper.vm.$nextTick()
              expect(wrapper.vm.$el).toMatchSnapshot()
            })
          })
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
      const transactionProperties = {
        type: "MsgSend",
        toAddress: "comsos12345",
        amounts: [
          {
            amount: "100000",
            denom: "uatoms"
          }
        ],
        memo: "A memo"
      }
      const data = {
        step: `details`,
        gasEstimate: null,
        submissionError: null
      }

      wrapper.setProps({ transactionProperties })
      wrapper.setData(data)
      wrapper.vm.simulate()
      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.gasEstimate).toBe(123456)
        expect(wrapper.vm.submissionError).toBe(null)
        expect(wrapper.vm.step).toBe("fees")
      })
    })

    it(`should max fees to the available amount`, async () => {
      const transactionProperties = {
        type: "MsgSend",
        toAddress: "comsos12345",
        amounts: [
          {
            amount: "1230000000",
            denom: "uatoms"
          }
        ],
        memo: "A memo"
      }
      const data = {
        step: `details`,
        gasEstimate: null,
        submissionError: null
      }

      wrapper.setProps({ transactionProperties, amount: 1230 })
      wrapper.setData(data)
      wrapper.vm.simulate()
      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.submissionError).toBe(null)
        expect(wrapper.vm.step).toBe("fees")
        expect(wrapper.vm.gasPrice).toBe(0)
      })
    })

    it("should fail if simulation fails", () => {
      const mockSimulateFail = jest.fn(() =>
        Promise.reject(new Error(`invalid request`))
      )

      const data = {
        step: `details`,
        gasEstimate: null,
        submissionError: null,
        actionManager: {
          simulate: mockSimulateFail
        }
      }

      const transactionProperties = {
        type: "MsgSend",
        toAddress: "comsos12345",
        amounts: [
          {
            amount: "100000",
            denom: "uatoms"
          }
        ],
        memo: "A memo"
      }

      wrapper.setProps({ transactionProperties })
      wrapper.setData(data)
      wrapper.vm.simulate()
      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.gasEstimate).toBe(null)
        expect(wrapper.vm.submissionError).toBe(
          "Transaction failed: invalid request."
        )
        expect(wrapper.vm.step).toBe("details")
      })
    })
  })

  describe(`submit`, () => {
    it(`should submit transaction`, async () => {
      const transactionProperties = {
        type: "MsgSend",
        toAddress: "comsos12345",
        amounts: [
          {
            amount: "100000",
            denom: "uatoms"
          }
        ],
        memo: "A memo"
      }
      const data = {
        step: `sign`,
        gasEstimate: 12345,
        submissionError: null
      }

      wrapper.setProps({ transactionProperties })
      wrapper.setData(data)
      wrapper.vm.submit()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.submissionError).toBe(null)
      // expect(postSubmit).toHaveBeenCalled()
      expect($store.dispatch).toHaveBeenCalledWith(`postMsgSend`, {
        txMeta: {
          gasEstimate: 12345,
          gasPrice: { amount: "0.000000025", denom: "uatom" },
          password: null,
          submitType: "local"
        },
        txProps: { denom: "uatom", validatorAddress: "cosmos12345" }
      })
      expect($store.commit).toHaveBeenCalledWith(`notify`, {
        title: `Successful transaction`,
        body: `You have successfully completed a transaction.`
      })
      expect(wrapper.emitted(`close`)).toBeTruthy()
    })

    it("should fail if simulation fails", () => {
      const mockSimulateFail = jest.fn(() =>
        Promise.reject(new Error(`invalid request`))
      )

      const data = {
        step: `details`,
        gasEstimate: null,
        submissionError: null,
        actionManager: {
          simulate: mockSimulateFail
        }
      }

      const transactionProperties = {
        type: "MsgSend",
        toAddress: "comsos12345",
        amounts: [
          {
            amount: "100000",
            denom: "uatoms"
          }
        ],
        memo: "A memo"
      }

      wrapper.setProps({ transactionProperties })
      wrapper.setData(data)
      wrapper.vm.simulate()
      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.gasEstimate).toBe(null)
        expect(wrapper.vm.submissionError).toBe(
          "Transaction failed: invalid request."
        )
        expect(wrapper.vm.step).toBe("details")
      })
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

      it(`stops the user from proceeding if disabled`, async () => {
        self.disabled = true

        await ActionModal.methods.validateChangeStep.call(self)
        expect(self.simulate).not.toHaveBeenCalled()
        expect(self.step).toBe("details")
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

      it(`when using extension`, async () => {
        self.session.sessionType = `extension`
        self.selectedSignMethod = `extension`

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
          key: `Ledger Nano`,
          value: `ledger`
        }
      ])
    })
  })
})
