import setup from '../../../helpers/vuex-setup'
import PageDelegate from 'renderer/components/staking/PageDelegate'

describe('PageDelegate', () => {
  let wrapper, store, router
  let {mount} = setup()

  beforeEach(() => {
    let instance = mount(PageDelegate)
    wrapper = instance.wrapper
    store = instance.store
    router = instance.router

    store.commit('addDelegate', {
      pub_key: {
        type: 'ed25519',
        data: 'pubkeyX'
      },
      voting_power: 10000,
      shares: 5000,
      description: {
        description: 'descriptionX',
        moniker: 'monikerX',
        country: 'US'
      }
    })
    router.push('/staking/delegates/pubkeyX')
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should add/remove candidate to cart', () => {
    expect(wrapper.vm.inCart).toBe(false)
    wrapper.vm.add(wrapper.vm.delegate)
    expect(wrapper.vm.inCart).toBe(true)
    wrapper.vm.rm('pubkeyX')
    expect(wrapper.vm.inCart).toBe(false)
  })

  it('should show the correct country name', () => {
    expect(wrapper.html()).toContain('United States')
  })
})
