import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import ActionModal from "src/ActionModal/components/ActionModal"
import { focusParentLast } from "src/directives"

const localVue = createLocalVue()
localVue.use(Vuelidate)
localVue.directive("focus-last", focusParentLast)
localVue.directive("focus", () => {})

let mockSend = jest.fn(() => ({
  included: () => Promise.resolve({ height: 42 }),
  hash: "HASH1234HASH"
}))
let mockGetSignQueue = jest.fn(() => Promise.resolve({ queue: 1 }))

jest.mock("src/../config.js", () => ({
  default_gas_price: 2.5e-8,
  graphqlHost: "http://localhost:4000"
}))

jest.mock(`src/ActionModal/utils/ActionManager.js`, () => {
  return jest.fn(() => {
    return {
      sendTxAPI: mockSend,
      getSignQueue: mockGetSignQueue
    }
  })
})

// TODO move into global mock to not duplicate everywhere
jest.mock("@sentry/browser", () => ({
  withScope: () => {}
}))

describe(`ActionModal`, () => {
  let wrapper, $store, $apollo

  const overview = {
    totalRewards: 100000,
    liquidStake: 1230.0,
    totalStake: 1430000000
  }

  const balances = [
    {
      denom: "STAKE",
      amount: 1,
      gasPrice: 0.001
    },
    {
      denom: "token2",
      amount: 2,
      gasPrice: 0.002
    }
  ]

  const network = {
    id: "cosmos-hub-testnet",
    stakingDenom: "STAKE",
    chain_id: "gaia-13006",
    api_url: "https://gaia-13006.lunie.io",
    action_send: true // to enable the feature send, needs to match the title of the ActionModal
  }

  const delegations = [
    {
      delegatorAddress: "cosmos1user",
      amount: "0.000000",
      validator: {
        operatorAddress: "cosmosvalop1"
      }
    },
    {
      delegatorAddress: "cosmos1user",
      amount: "1.000000",
      validator: {
        operatorAddress: "cosmosvalop2"
      }
    },
    {
      delegatorAddress: "cosmos1user",
      amount: "2.000000",
      validator: {
        operatorAddress: "cosmosvalop3"
      }
    },
    {
      delegatorAddress: "cosmos1user",
      amount: "3.000000",
      validator: {
        operatorAddress: "cosmosvalop4"
      }
    }
  ]

  $apollo = {
    queries: {
      overview: {
        refetch: jest.fn()
      },
      balances: {
        refetch: jest.fn()
      }
    }
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
        extension: {
          enabled: true
        },
        session: {
          signedIn: true,
          sessionType: `local`,
          browserWithLedgerSupport: null,
          currrentModalOpen: false
        },
        overview,
        balances,
        delegations
      },
      getters: {
        connected: true,
        network: "cosmos-hub-testnet",
        isExtensionAccount: false,
        networks: [
          {
            id: "cosmos-hub-testnet",
            action_send: true
          }
        ]
      }
    }

    wrapper = shallowMount(ActionModal, {
      localVue,
      propsData: {
        title: `Send`,
        validate: jest.fn(),
        featureFlag: `send`,
        queueNotEmpty: false,
        transactionData: {
          type: "MsgSend",
          denom: "uatom",
          validatorAddress: "cosmos12345"
        }
      },
      mocks: {
        $store,
        $router: {
          push: jest.fn(),
          history: {
            current: {
              params: {
                networkId: "lunie-net"
              }
            }
          }
        },
        $apollo
      },
      stubs: ["router-link"]
    })
    wrapper.vm.actionManager.getSignQueue = jest.fn(
      () => new Promise(resolve => resolve(0))
    )
    wrapper.setData({ network, overview, balances })
    wrapper.vm.open()
  })

  it(`should return a number with maximum the specified decimals`, () => {
    const maxDecimalsNumber = ActionModal.methods.maxDecimals(9.89639499, 4)
    expect(maxDecimalsNumber).toBe(9.8964)
  })

  it(`should return the chain applied fees (in this case the Terra tax you need to payfor sending alt-tokens)`, () => {
    const self = {
      gasEstimate: 200000,
      gasPrice: "3e-8",
      networkId: "terra-mainnet",
      maxDecimals: ActionModal.methods.maxDecimals,
      updateTerraGasEstimate: jest.fn(),
      updateEmoneyGasEstimate: () => {},
      chainAppliedFees: 0.00675
    }
    const estimatedFee = ActionModal.computed.estimatedFee.call(self)
    expect(estimatedFee).toBe(0.00675)
  })

  it(`should return the normal estimated fee (gas price * gas estimate) when chainAppliedFees equal 0`, () => {
    const self = {
      gasPrice: "1.5e-8",
      gasEstimate: 300000,
      networkId: `terra-mainnet`,
      maxDecimals: ActionModal.methods.maxDecimals,
      updateTerraGasEstimate: ActionModal.methods.updateTerraGasEstimate
    }
    const estimatedFee = ActionModal.computed.estimatedFee.call(self)
    expect(estimatedFee).toBe(0.0045)
  })

  it(`should not update the gas estimate for emoney when it is a claim rewards transaction`, () => {
    const self = {
      gasPrice: "1.5e-8",
      gasEstimate: 550000,
      networkId: `emoney-mainnet`,
      transactionData: {
        type: `MsgWithdrawDelegationReward`
      },
      maxDecimals: ActionModal.methods.maxDecimals,
      updateEmoneyGasEstimate: ActionModal.methods.updateEmoneyGasEstimate
    }
    ActionModal.computed.estimatedFee.call(self)
    expect(self.gasEstimate).toBe(550000)
  })

  it(`should set the submissionError if the submission is rejected`, async () => {
    const ActionManagerSend = jest
      .fn()
      .mockRejectedValue(new Error(`some kind of error message`))
    const $store = { dispatch: jest.fn() }
    const self = {
      $store,
      $apollo,
      actionManager: {
        sendTxAPI: ActionManagerSend
      },
      transactionData: {
        type: "TYPE",
        denom: "uatom",
        validatorAddress: "cosmos12345"
      },
      network: {
        id: "cosmos-hub-testnet",
        stakingDenom: "ATOM"
      },
      networkId: "cosmos-hub-testnet",
      session: {
        address: "cosmos1234"
      },
      overview: {
        accountInformation: {
          sequence: 42,
          accountNumber: 12
        }
      },
      submissionErrorPrefix: `PREFIX`,
      trackEvent: jest.fn(),
      sendEvent: jest.fn(),
      connectLedger: () => {},
      onSendingFailed: jest.fn()
    }
    await ActionModal.methods.submit.call(self)
    expect(self.onSendingFailed).toHaveBeenCalledWith(
      new Error("some kind of error message")
    )

    ActionModal.methods.onSendingFailed.call(
      self,
      new Error("some kind of error message")
    )
    expect(self.submissionError).toEqual(`PREFIX: some kind of error message.`)
  })

  it(`should trigger onSendingFailed if transaction data is empty`, async () => {
    const ActionManagerSend = jest
      .fn()
      .mockRejectedValue(new Error(`some kind of error message`))
    const $store = { dispatch: jest.fn() }
    const self = {
      $store,
      $apollo,
      actionManager: {
        send: ActionManagerSend,
        sendTxAPI: jest.fn().mockResolvedValue({ hash: 12345 })
      },
      transactionData: {},
      network: {
        stakingDenom: "ATOM"
      },
      submissionErrorPrefix: `PREFIX`,
      trackEvent: jest.fn(),
      connectLedger: () => {},
      onSendingFailed: jest.fn()
    }
    await ActionModal.methods.submit.call(self)
    expect(self.onSendingFailed).toHaveBeenCalledWith(
      new Error(`Error in transaction data`)
    )
  })

  it(`should default to submissionError being null`, () => {
    expect(wrapper.vm.submissionError).toBe(null)
  })

  it(`opens`, async () => {
    wrapper.vm.trackEvent = jest.fn()
    await wrapper.vm.open()
    expect(wrapper.isEmpty()).not.toBe(true)
    expect(wrapper.queueEmpty).not.toBe(true)
    expect(wrapper.vm.show).toBe(true)
    expect(wrapper.vm.trackEvent).toHaveBeenCalled()
  })

  it("shows loading when there is still data to be loaded", () => {
    wrapper = shallowMount(ActionModal, {
      localVue,
      propsData: {
        title: `Send`,
        validate: jest.fn(),
        featureFlag: `send`,
        queueNotEmpty: false,
        transactionData: {
          type: "MsgSend",
          denom: "uatom",
          validatorAddress: "cosmos12345"
        }
      },
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        },
        $apollo: {
          queries: {
            overview: {
              loading: true
            },
            balances: {
              loading: true
            }
          }
        }
      },
      stubs: ["router-link"]
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should confirm modal closing`, () => {
    global.confirm = () => true
    const closeModal = jest.fn()
    wrapper.vm.actionManager.cancel = jest.fn()
    wrapper.vm.session.currrentModalOpen = {
      close: closeModal
    }
    wrapper.vm.confirmModalOpen()
    expect(closeModal).toHaveBeenCalled()
  })

  it(`should not open second modal`, () => {
    wrapper.setData({ show: false })
    global.confirm = () => false
    wrapper.vm.session.currrentModalOpen = true
    wrapper.vm.open()
    expect(wrapper.vm.show).toBe(false)
  })

  it(`opens session modal and closes itself`, () => {
    const $store = { commit: jest.fn(), dispatch: jest.fn() }
    const self = {
      $store,
      close: jest.fn(),
      $router: { push: jest.fn() },
      $route: { name: `route` }
    }
    ActionModal.methods.goToSession.call(self)
    expect(self.close).toHaveBeenCalled()
    expect(self.$router.push).toHaveBeenCalledWith({ name: "portfolio" })
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

  describe(`should show the action modal`, () => {
    describe(`when user has logged in`, () => {
      const signMethods = ["local", "ledger", "extension", "explore"]
      const steps = [
        ["on fees step", "fees", false],
        ["on sign step", "sign", false],
        ["sending", "sign", true]
      ]

      describe.each(signMethods)(`with %s`, signMethod => {
        it.each(steps)(`%s`, async (name, step, sending) => {
          wrapper.vm.session.sessionType = signMethod
          wrapper.vm.step = step
          wrapper.vm.sending = sending
          expect(wrapper.element).toMatchSnapshot()
        })
      })
    })

    it(`when user hasn't logged in`, async () => {
      wrapper.vm.session.signedIn = false
      await wrapper.vm.$nextTick()
      expect(wrapper.element).toMatchSnapshot()
    })

    it(`waiting on inclusion`, async () => {
      wrapper.vm.step = "inclusion"
      expect(wrapper.element).toMatchSnapshot()
    })

    it(`on success`, async () => {
      wrapper.vm.step = "success"
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe(`back button`, () => {
    it(`renders and functions`, () => {
      wrapper.setData({ step: "sign" })
      expect(wrapper.element).toMatchSnapshot()
      wrapper.find("#prevBtn").trigger("click")
      expect(wrapper.vm.step).toBe("fees")
      wrapper.find("#prevBtn").trigger("click")
      expect(wrapper.vm.step).toBe("details")
    })
  })

  describe(`close modal`, () => {
    it(`closes`, () => {
      wrapper.vm.open()
      wrapper.vm.close()
      expect(wrapper.isEmpty()).toBe(true)
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
      wrapper.vm.actionManager = {
        cancel: jest.fn()
      }
      wrapper.vm.step = `sign`
      wrapper.vm.close()
      expect(wrapper.vm.step).toBe(`details`)
      expect(wrapper.vm.actionManager.cancel).toHaveBeenCalled()
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
        wrapper.setData({
          gasPrice: 2.5e-8,
          gasEstimate: 2,
          balances: [
            {
              denom: "STAKE",
              amount: 1211
            }
          ]
        })
        wrapper.setProps({
          selectedDenom: "STAKE"
        })
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
        wrapper.setData({ gasPrice: 150003456700 })
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
      wrapper.setData({
        gasPrice: 10,
        gasEstimate: 2,
        balances: [
          {
            denom: "STAKE",
            amount: 1211
          }
        ]
      })
      wrapper.setProps({
        selectedDenom: "STAKE"
      })
    })

    describe(`success`, () => {
      it(`when the total invoice amount is less than the balance`, () => {
        wrapper.setProps({ amount: 1210 })
        expect(wrapper.vm.isValidInput(`invoiceTotal`)).toBe(true)
      })
    })

    describe(`fails`, () => {
      it(`when the total invoice amount is more than the balance`, () => {
        wrapper.setProps({ amount: 1211.01 })
        expect(wrapper.vm.isValidInput(`invoiceTotal`)).toBe(false)
      })
    })
  })

  it(`should max fees to the available amount`, async () => {
    const self = {
      invoiceTotal: 1.001,
      selectedBalance: balances[0],
      subTotal: 0.999,
      gasEstimate: 100000
    }
    ActionModal.methods.adjustFeesToMaxPayable.call(self)
    expect(self.gasPrice).toBe(1.0000000000000008e-8) // a bit lower then gasEstimate. feels right
  })

  it(`should take chain applied fees into account when adjusting fees for max amount`, async () => {
    const self = {
      invoiceTotal: 1.001,
      selectedBalance: balances[1],
      subTotal: 0.999,
      gasEstimate: 100000,
      chainAppliedFees: 0.001
    }
    ActionModal.methods.adjustFeesToMaxPayable.call(self)
    expect(self.gasPrice).toBe(0.00001)
  })

  describe(`submit`, () => {
    it(`should submit transaction`, async () => {
      const transactionProperties = {
        type: "MsgSend",
        toAddress: "comsos12345",
        amounts: [
          {
            amount: "10",
            denom: "atoms"
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
      wrapper.vm.$emit = jest.fn()
      await wrapper.vm.submit()
      expect(wrapper.vm.submissionError).toBe(null)
      expect(wrapper.vm.txHash).toBe("HASH1234HASH")
    })

    it(`should submit transaction using transaction api`, async () => {
      const transactionProperties = {
        type: "MsgSend",
        toAddress: "cosmos12345",
        amounts: [
          {
            amount: "10",
            denom: "atoms"
          }
        ],
        memo: "A memo"
      }
      const data = {
        step: `sign`,
        gasEstimate: 12345,
        submissionError: null,
        balances
      }

      wrapper.setProps({ transactionProperties })
      wrapper.setData(data)
      wrapper.vm.$emit = jest.fn()
      await wrapper.vm.submit()
      expect(wrapper.vm.submissionError).toBe(null)
      expect(wrapper.vm.txHash).toBe("HASH1234HASH")
    })

    it("should fail if submitting fails", async () => {
      const mockSubmitFail = jest.fn(() =>
        Promise.reject(new Error(`invalid request`))
      )

      const data = {
        step: `fees`,
        gasEstimate: null,
        submissionError: null
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
      wrapper.vm.actionManager.sendTxAPI = mockSubmitFail
      await wrapper.vm.submit()
      await wrapper.vm.$nextTick()

      expect(wrapper.html()).toContain("Transaction failed: invalid request.")
      expect(wrapper.vm.step).toBe("sign")
    })

    it(`Should call onSendingFailed if transaction data is empty`, async () => {
      const ActionManagerSend = jest
        .fn()
        .mockRejectedValue(new Error(`Error in transaction data`))
      const $store = { dispatch: jest.fn() }
      const self = {
        $store,
        $apollo,
        actionManager: {
          simulateTxAPI: jest.fn(),
          sendTxAPI: ActionManagerSend
        },
        transactionData: {},
        network: {
          stakingDenom: "ATOM"
        },
        submissionErrorPrefix: `PREFIX`,
        trackEvent: jest.fn(),
        connectLedger: () => {},
        onSendingFailed: jest.fn()
      }
      await ActionModal.methods.submit.call(self)
      expect(self.onSendingFailed).toHaveBeenCalledWith(
        new Error(`Error in transaction data`)
      )

      ActionModal.methods.onSendingFailed.call(
        self,
        new Error(`Error in transaction data`)
      )
      expect(self.submissionError).toEqual(`PREFIX: Error in transaction data.`)
    })
  })

  describe(`runs validation and changes step`, () => {
    let self, getterValues

    beforeEach(() => {
      getterValues = { session: { sessionType: `ledger` } }
      self = {
        ...getterValues,
        submit: jest.fn(),
        isValidChildForm: true,
        isValidInput: jest.fn(() => true),
        selectedSignMethod: `local`,
        step: `details`,
        validateChangeStep: jest.fn(() => {})
      }
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

      it("should dispaly warning when using an address not in the extension", () => {
        $store.getters.isExtensionAccount = false
        wrapper.vm.step = "sign"
        wrapper.vm.selectedSignMethod = "extension"
        expect(
          wrapper.find(".form-message.notice.extension-address").exists()
        ).toBe(true)
        expect(wrapper.element).toMatchSnapshot()
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
        isValidChildForm: true,
        isValidInput: jest.fn(() => true),
        selectedSignMethod: `local`,
        step: `details`
      }
    })

    it(`when signing with ledger`, done => {
      self.session.sessionType = `ledger`
      self.step = `sign`
      jest.useFakeTimers()
      ActionModal.methods.validateChangeStep.call(self).then(() => {
        expect(self.sending).toBe(false)
        done()
      })
      jest.runAllTimers()
      expect(self.step).toBe("sign")
    })
  })

  describe(`selected sign method`, () => {
    it(`selects local signed in with account`, () => {
      expect(wrapper.vm.selectedSignMethod).toBe(`local`)
      expect(wrapper.vm.signMethods).toEqual([
        {
          key: `Local Account (Unsafe)`,
          value: `local`
        }
      ])
    })

    it(`selects ledger if device is connected`, () => {
      $store.state.session.sessionType = `ledger`
      expect(wrapper.vm.selectedSignMethod).toBe(`ledger`)
      expect(wrapper.vm.signMethods).toEqual([
        {
          key: `Ledger Nano`,
          value: `ledger`
        }
      ])
    })

    it(`selects ledger if device is connected`, () => {
      $store.state.session.sessionType = `extension`
      expect(wrapper.vm.selectedSignMethod).toBe(`extension`)
      expect(wrapper.vm.signMethods).toEqual([
        {
          key: `Lunie Browser Extension`,
          value: `extension`
        }
      ])
    })
  })

  it("shows a feature unavailable message", async () => {
    wrapper.vm.$apollo = {
      query: () => ({
        data: {
          networks: []
        }
      })
    }
    await wrapper.vm.open()
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.exists("featurenotavailable-stub")).toBe(true)
  })

  it("triggers the tx included functions on subscription", () => {
    const hash = "superhash"
    const self = {
      onTxIncluded: jest.fn(),
      txHash: hash
    }
    ActionModal.apollo.$subscribe.userTransactionAdded.result.call(self, {
      data: {
        userTransactionAddedV2: {
          hash,
          success: true
        }
      }
    })

    expect(self.onTxIncluded).toHaveBeenCalled()
  })

  it("triggers the tx inclusion failure functions on subscription", () => {
    const hash = "superhash"
    const self = {
      onTxIncluded: jest.fn(),
      onSendingFailed: jest.fn(),
      txHash: hash
    }
    ActionModal.apollo.$subscribe.userTransactionAdded.result.call(self, {
      data: {
        userTransactionAddedV2: {
          hash,
          success: false,
          log: "error"
        }
      }
    })

    expect(self.onSendingFailed).toHaveBeenCalledWith(new Error("error"))
  })

  it(`triggers sendEvent to Google Analytics`, () => {
    const self = {
      $emit: jest.fn(),
      trackEvent: jest.fn(),
      sendEvent: jest.fn(),
      network: {
        id: "testnetwork"
      },
      session: {
        address: "testaddress"
      },
      $apollo: {
        queries: {
          overview: { refetch: jest.fn() }
        }
      }
    }
    const spy = jest.spyOn(self, `sendEvent`)
    ActionModal.methods.onTxIncluded.call(self)
    expect(spy).toHaveBeenCalled()
    self.sendEvent.mockClear()
  })
})
