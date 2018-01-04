import setup from '../helpers/vuex-setup'
import LiDelegate from 'renderer/components/staking/LiDelegate'

describe('LiDelegate', () => {
  let wrapper, store, delegate
  let instance = setup()

  beforeEach(() => {
    let test = instance.mount(LiDelegate, {
      propsData: {
        delegate: {
          id: 'abc',
          description: {}
        }
      }
    })
    wrapper = test.wrapper
    store = test.store

    store.commit('addDelegate', {
      pub_key: {
        type: 'ed25519',
        data: 'pubkeyX'
      },
      voting_power: 10000,
      shares: 5000,
      description: {
        description: 'descriptionX',
        moniker: 'candidateX',
        country: 'USA'
      }
    })
    store.commit('addDelegate', {
      pub_key: {
        type: 'ed25519',
        data: 'pubkeyY'
      },
      voting_power: 30000,
      shares: 10000,
      description: {
        description: 'descriptionY',
        moniker: 'candidateY',
        country: 'Canada'
      }
    })

    delegate = store.state.delegates[0]

    wrapper.setData({ delegate })
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show the voting power', () => {
    expect(wrapper.html()).toContain('25%')
  })

  it('should show the number of bonded atoms', () => {
    expect(wrapper.html()).toContain('10,000')
  })

  it('should show the relative voting power as a bar', () => {
    expect(wrapper.vm.$el.querySelector('.voting_power .bar').style.width).toBe('33%')
  })

  it('should add to cart', () => {
    expect(wrapper.vm.shoppingCart).toEqual([])
    expect(wrapper.vm.inCart).toBeFalsy()
    expect(wrapper.html()).not.toContain('li-delegate-active')
    wrapper.find('.fa-square-o').trigger('click')
    expect(wrapper.vm.inCart).toBeTruthy()
    expect(store.commit).toHaveBeenCalledWith('addToCart', store.state.delegates[0])
    expect(wrapper.html()).toContain('li-delegate-active')
  })

  it('should remove from cart', () => {
    store.commit('addToCart', store.state.delegates[0])
    wrapper.update()
    expect(wrapper.vm.inCart).toBeTruthy()
    wrapper.find('.fa-check-square-o').trigger('click')
    expect(store.commit).toHaveBeenCalledWith('removeFromCart', delegate.id)
    expect(wrapper.vm.shoppingCart).toEqual([])
    expect(wrapper.vm.inCart).toBeFalsy()
    expect(wrapper.html()).not.toContain('li-delegate-active')
  })
})
