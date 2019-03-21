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
        connected: true,
        session: { signedIn: true, sessionType: `local` },
        bondDenom: `uatom`,
        wallet: {
          loading: false,
          balances: [
            { denom: `uatom`, amount: `20000000` }
          ]
        }
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
    jest.useFakeTimers()

    const submitFn = jest
      .fn()
      .mockRejectedValue(new Error(`some kind of error message`))
    const self = { submitFn, submissionErrorPrefix: `PREFIX` }
    await ActionModal.methods.submit.call(self)

    jest.runAllTimers()
    expect(self.submissionError).toEqual(null)
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
        $v: {
          gasPrice: {
            $touch: () => { }
          },
          password: {
            $touch: () => { }
          },
          $invalid: false
        },
        selectedSignMethod: `local`,
        step: `txDetails`
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
        self.$v.$invalid = true
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
        self.$v.$invalid = true
        await ActionModal.methods.validateChangeStep.call(self)
        expect(self.submit).not.toHaveBeenCalled()
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
        $v: {
          gasPrice: {
            $touch: () => { }
          },
          password: {
            $touch: () => { }
          },
          $invalid: false
        },
        selectedSignMethod: `local`,
        step: `txDetails`
      }
    })

    it(`when signing with local keystore`, done => {
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
      ActionModal.methods.validateChangeStep.call(self).then(() => {
        expect(self.sending).toBe(false)
        done()
      })
      expect(self.sending).toBe(true)
      jest.runAllTimers()
    })
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
