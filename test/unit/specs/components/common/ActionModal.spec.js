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
        ledger: { isConnected: false },
        session: { signedIn: true }
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

  describe(`has the expected html structure`, () => {
    describe(`when user has logged in`, () => {
      it(`with local keystore`, () => {
        expect(wrapper.vm.$el).toMatchSnapshot()
      })

      it(`with ledger`, async () => {
        $store = {
          getters: {
            connected: true,
            ledger: { isConnected: true },
            session: { signedIn: true }
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
        expect(wrapper.vm.$el).toMatchSnapshot()
      })

      it(`with ledger and is on sign step`, async () => {
        wrapper.vm.ledger.isConnected = true
        wrapper.vm.step = `sign`
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.$el).toMatchSnapshot()
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

  it(`opens session modal`, () => {
    const $store = { commit: jest.fn() }
    const self = { $store }
    ActionModal.methods.goToSession.call(self)
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
      getterValues = { ledger: { isConnected: false } }
      self = {
        ...getterValues,
        submit: jest.fn(),
        validate: jest.fn(() => true),
        $v: {
          $touch: () => {}
        },
        selectedSignMethod: `local`,
        step: `txDetails`
      }
    })
    it(`if connected to local`, async () => {
      await ActionModal.methods.validateChangeStep.call(self)
      expect(self.validate).toHaveBeenCalled()
      expect(self.submit).toHaveBeenCalled()
    })

    it(`if connected to ledger and is on 'txDetails' step`, async () => {
      self.ledger = { isConnected: true }
      self.selectedSignMethod = `ledger`
      await ActionModal.methods.validateChangeStep.call(self)
      expect(self.validate).toHaveBeenCalled()
      expect(self.submit).not.toHaveBeenCalled()
      expect(self.step).toBe(`sign`)
    })

    it(`if connected to ledger and is on 'sign' step`, async () => {
      self.ledger = { isConnected: true }
      self.selectedSignMethod = `ledger`
      self.step = `sign`
      await ActionModal.methods.validateChangeStep.call(self)
      expect(self.validate).toHaveBeenCalled()
      expect(self.submit).toHaveBeenCalled()
    })

    it(`doesn't submit on failed validation`, async () => {
      self.validate = jest.fn(() => false)
      await ActionModal.methods.validateChangeStep.call(self)
      expect(self.validate).toHaveBeenCalled()
      expect(self.submit).not.toHaveBeenCalled()
    })

    it(`fails validation if the password is missing`, async () => {
      wrapper.setData({ password: null })
      await wrapper.vm.validateChangeStep()
      expect(wrapper.vm.submitFn).not.toHaveBeenCalled()
      expect(wrapper.vm.$v.$invalid).toBe(true)
    })
  })

  describe(`shows sending indication`, () => {
    let self, getterValues

    beforeEach(() => {
      getterValues = { ledger: { isConnected: false } }
      self = {
        ...getterValues,
        submit: jest.fn(
          () => new Promise(resolve => setTimeout(resolve, 1000))
        ),
        validate: jest.fn(() => true),
        $v: {
          $touch: () => {}
        },
        selectedSignMethod: `local`,
        step: `txDetails`
      }
    })

    it(`when signing with local keystore`, done => {
      ActionModal.methods.validateChangeStep.call(self).then(() => {
        expect(self.sending).toBe(false)
        done()
      })
      expect(self.sending).toBe(true)
      jest.runAllTimers()
    })

    it(`when signing with ledger`, done => {
      self.ledger = { isConnected: true }
      self.step = `sign`
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

  it(`hides password input if signing with Ledger`, async () => {
    $store.getters.ledger.isConnected = true
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
      $store.getters.ledger.isConnected = true
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
