import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import CardCandidate from 'renderer/components/staking/CardCandidate'

const shoppingCart = require('renderer/vuex/modules/shoppingCart').default({})
const candidates = require('renderer/vuex/modules/candidates').default({})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('CardCandidate', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        shoppingCart: () => shoppingCart.state,
        candidates: () => candidates.state
      },
      modules: {
        shoppingCart,
        candidates
      }
    })

    store.commit('addCandidate', {
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
    store.commit('addCandidate', {
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

    let candidate = store.state.candidates[0]

    wrapper = mount(CardCandidate, {
      localVue,
      store,
      propsData: {
        candidate
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
    expect(wrapper.html()).not.toContain('card-candidate-active')
    wrapper.find('menu .ni-btn').trigger('click')
    expect(store.commit).toHaveBeenCalledWith('addToCart', store.state.candidates[0])
    expect(wrapper.html()).toContain('card-candidate-active')
  })

  it('should remove from cart', () => {
    wrapper.find('menu .ni-btn').trigger('click')
    wrapper.find('menu .ni-btn').trigger('click')
    expect(store.commit).toHaveBeenCalledWith('removeFromCart', store.state.candidates[0].id)

    // TODO still has the candidate in the shopping cart
    // console.log(store.state.candidates[0].id, store.state.shoppingCart.candidates.map(x => x.id))
    // expect(wrapper.html()).not.toContain('card-candidate-active')
  })
})
