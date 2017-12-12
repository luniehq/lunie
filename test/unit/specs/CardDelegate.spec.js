import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import CardDelegate from 'renderer/components/staking/CardDelegate'

const shoppingCart = require('renderer/vuex/modules/shoppingCart').default({})
const delegates = require('renderer/vuex/modules/delegates').default({})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('CardDelegate', () => {
  let wrapper, store, delegate

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        shoppingCart: () => shoppingCart.state.delegates,
        delegates: () => delegates.state
      },
      modules: {
        shoppingCart,
        delegates
      }
    })

    store.commit('addDelegate', {
      pubkey: 'pubkeyX',
      description: JSON.stringify({
        id: 'idX',
        description: 'descriptionX',
        voting_power: 10000,
        shares: 5000,
        keybaseID: 'keybaseX',
        country: 'USA'
      })
    })
    store.commit('addDelegate', {
      pubkey: 'pubkeyY',
      description: JSON.stringify({
        id: 'idY',
        description: 'descriptionY',
        voting_power: 30000,
        shares: 10000,
        keybaseID: 'keybaseY',
        country: 'Canada'
      })
    })

    delegate = store.state.delegates[0]

    wrapper = mount(CardDelegate, {
      localVue,
      store,
      propsData: {
        delegate
      }
    })

    jest.spyOn(store, 'commit')
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show the country', () => {
    expect(wrapper.html()).toContain('USA')
  })

  it('should show the voting power', () => {
    expect(wrapper.html()).toContain('10,000')
  })

  it('should show the relative voting power as a bar', () => {
    expect(wrapper.vm.$el.querySelector('.voting_power .bar').style.width).toBe(Math.floor(10000 / 30000 * 100) + '%')
  })

  it('should show the relative shares hold as a bar', () => {
    expect(wrapper.vm.$el.querySelector('.voting_power .bar').style.width).toBe(Math.floor(5000 / 15000 * 100) + '%')
  })

  it('should add to cart', () => {
    expect(wrapper.vm.shoppingCart).toEqual([])
    expect(wrapper.vm.inCart).toBeFalsy()
    expect(wrapper.find('menu .ni-btn').text()).toContain('Add')
    expect(wrapper.html()).not.toContain('card-delegate-active')
    wrapper.find('menu .ni-btn').trigger('click')
    expect(wrapper.vm.inCart).toBeTruthy()
    expect(store.commit).toHaveBeenCalledWith('addToCart', store.state.delegates[0])
    expect(wrapper.html()).toContain('card-delegate-active')
  })

  it('should remove from cart', () => {
    store.commit('addToCart', store.state.delegates[0])
    wrapper.update()
    expect(wrapper.vm.inCart).toBeTruthy()
    expect(wrapper.find('menu .ni-btn').text()).toContain('Remove')
    wrapper.find('menu .ni-btn').trigger('click')
    expect(store.commit).toHaveBeenCalledWith('removeFromCart', delegate.id)
    expect(wrapper.vm.shoppingCart).toEqual([])
    expect(wrapper.vm.inCart).toBeFalsy()
    expect(wrapper.html()).not.toContain('card-delegate-active')
  })
})
