import setup from '../../../helpers/vuex-setup'
import htmlBeautify from 'html-beautify'
import Vuelidate from 'vuelidate'
import PageBond from 'renderer/components/staking/PageBond'
import interact from 'interactjs'

describe('PageBond', () => {
  let wrapper, store, router
  let {mount, localVue} = setup()
  localVue.use(Vuelidate)

  beforeEach(() => {
    let test = mount(PageBond)
    store = test.store
    router = test.router
    wrapper = test.wrapper

    store.commit('setAtoms', 101)

    store.commit('addToCart', {
      id: 'pubkeyX',
      pub_key: {
        type: 'ed25519',
        data: 'pubkeyX'
      },
      voting_power: 10000,
      shares: 5000,
      description: {
        description: 'descriptionX',
        country: 'USA',
        moniker: 'someValidator'
      }
    })
    store.commit('addToCart', {
      id: 'pubkeyY',
      pub_key: {
        type: 'ed25519',
        data: 'pubkeyY'
      },
      voting_power: 30000,
      shares: 10000,
      description: {
        description: 'descriptionY',
        country: 'Canada',
        moniker: 'someOtherValidator'
      }
    })

    wrapper.update()
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show the correct number of total atoms', () => {
    store.commit('setAtoms', 1337)
    expect(wrapper.vm.totalAtoms).toBe(1337)
  })

  it('shows the correct bond bar percent', () => {
    store.commit('setAtoms', 120)
    expect(wrapper.vm.bondBarPercent(30)).toBe('25%')
  })

  it('sets the correct bond bar inner width and style', () => {
    store.commit('setAtoms', 120)
    wrapper.setData({ bondBarOuterWidth: 128 })
    expect(wrapper.vm.bondBarInnerWidth(80)).toBe('95px')
    expect(wrapper.vm.styleBondBarInner(80)).toEqual({width: '95px'})
  })

  it('sets the correct bond group class', () => {
    expect(wrapper.vm.bondGroupClass(1337)).toBe('bond-group--positive')
    expect(wrapper.vm.bondGroupClass(-1337)).toBe('bond-group--negative')
    expect(wrapper.vm.bondGroupClass(0)).toBe('bond-group--neutral')
  })

  it('has bond bars the user can interact with', () => {
    expect(interact.isSet('.bond-bar__inner--editable')).toBe(true)
  })

  it('updates delegate atoms', () => {
    wrapper.vm.updateDelegateAtoms('pubkeyX', 88)
    let delegate = wrapper.vm.fields.delegates.find(d => d.id === 'pubkeyX')
    expect(delegate.atoms).toBe(88)
  })

  it('calculates delta', () => {
    expect(wrapper.vm.delta(100.23293423, 90.5304934)).toBe(9.70244083)
    expect(wrapper.vm.delta(100, 90, 'int')).toBe(10)
  })

  it('calculates percentages', () => {
    expect(wrapper.vm.percent(45, 60)).toBe('75%')
    expect(wrapper.vm.percent(40, 60, 4)).toBe('66.6667%')
  })

  it('should leave if there are no candidates selected', () => {
    store.commit('removeFromCart', 'pubkeyX')
    store.commit('removeFromCart', 'pubkeyY')
    expect(router.currentRoute.fullPath).toBe('/staking')
  })

  it('should return to the candidates if desired', () => {
    wrapper.find('.ni-tool-bar a').trigger('click')
    expect(router.currentRoute.fullPath).toBe('/staking')
  })

  it('shows selected candidates', () => {
    expect(htmlBeautify(wrapper.html())).toContain('someValidator')
    expect(htmlBeautify(wrapper.html())).toContain('someOtherValidator')
  })

  it('should reset fields properly', () => {
    wrapper.setData({
      fields: {
        delegates: [
          {
            id: 'pubkeyX',
            delegate: store.getters.shoppingCart[0].delegate,
            atoms: 50,
            oldAtoms: 40
          },
          {
            id: 'pubkeyY',
            delegate: store.getters.shoppingCart[1].delegate,
            atoms: 50,
            oldAtoms: 40
          }
        ]
      }
    })
    expect(wrapper.find('#new-unbonded-atoms').element.value).toBe("81")
    wrapper.find('#btn-reset').trigger('click')
    expect(wrapper.find('#new-unbonded-atoms').element.value).toBe("101")
  })

  it('should show an error when bonding too many atoms', () => {
    wrapper.setData({
      fields: {
        delegates: [
          {
            id: 'pubkeyX',
            delegate: store.getters.shoppingCart[0].delegate,
            atoms: 100
          },
          {
            id: 'pubkeyY',
            delegate: store.getters.shoppingCart[1].delegate,
            atoms: 100
          }
        ]
      }
    })
    wrapper.findAll('#btn-bond').trigger('click')
    expect(store.dispatch.mock.calls[0]).toBeUndefined()
    expect(wrapper.find('.ni-form-msg-error')).toBeDefined()
  })

  it('should show an appropriate amount of unbonded atoms', () => {
    wrapper.setData({
      fields: {
        bondConfirm: false,
        delegates: [
          {
            id: 'pubkeyX',
            delegate: store.getters.shoppingCart[0].delegate,
            atoms: 30,
            oldAtoms: 20
          },
          {
            id: 'pubkeyY',
            delegate: store.getters.shoppingCart[1].delegate,
            atoms: 30,
            oldAtoms: 20
          }
        ]
      }
    })
    expect(wrapper.vm.newUnbondedAtoms).toBe(81)
    expect(wrapper.find('#new-unbonded-atoms').vnode.elm._value).toBe(81)
  })

  it('should show an appropriate amount of unbonding atoms', () => {
    wrapper.setData({
      fields: {
        bondConfirm: false,
        delegates: [
          {
            id: 'pubkeyX',
            delegate: store.getters.shoppingCart[0].delegate,
            atoms: 31,
            oldAtoms: 41
          },
          {
            id: 'pubkeyY',
            delegate: store.getters.shoppingCart[1].delegate,
            atoms: 30,
            oldAtoms: 40
          }
        ]
      }
    })
    expect(wrapper.vm.newUnbondingAtoms).toBe(20)
    expect(wrapper.find('#new-unbonding-atoms').vnode.elm._value).toBe(20)
  })

  it('should show an error if confirmation is not checked', () => {
    wrapper.setData({
      fields: {
        bondConfirm: false,
        delegates: [
          {
            id: 'pubkeyX',
            delegate: store.getters.shoppingCart[0].delegate,
            atoms: 51
          },
          {
            id: 'pubkeyY',
            delegate: store.getters.shoppingCart[1].delegate,
            atoms: 50
          }
        ]
      }
    })
    wrapper.findAll('#btn-bond').trigger('click')
    expect(store.dispatch.mock.calls[0]).toBeUndefined()
    expect(wrapper.find('.ni-form-msg-error')).toBeDefined()
  })

  it('should bond atoms on submit', () => {
    wrapper.setData({
      fields: {
        bondConfirm: true,
        delegates: [
          {
            id: 'pubkeyX',
            delegate: store.getters.shoppingCart[0].delegate,
            atoms: 51
          },
          {
            id: 'pubkeyY',
            delegate: store.getters.shoppingCart[1].delegate,
            atoms: 50
          }
        ]
      }
    })
    wrapper.findAll('#btn-bond').trigger('click')
    expect(store.dispatch.mock.calls[0][0]).toBe('submitDelegation')
  })

  it('should unbond atoms if bond amount is decreased', () => {
    store.commit('setCommittedDelegation', {
      candidateId: 'pubkeyX',
      value: 51
    })
    store.commit('setCommittedDelegation', {
      candidateId: 'pubkeyY',
      value: 50
    })
    wrapper.update()
    wrapper.setData({
      fields: {
        bondConfirm: true,
        delegates: [
          {
            id: 'pubkeyX',
            delegate: store.getters.shoppingCart[0].delegate,
            atoms: 0
          },
          {
            id: 'pubkeyY',
            delegate: store.getters.shoppingCart[1].delegate,
            atoms: 25
          }
        ]
      }
    })
    wrapper.findAll('#btn-bond').trigger('click')
    expect(store.dispatch.mock.calls[0][0]).toBe('submitDelegation')
  })
})
