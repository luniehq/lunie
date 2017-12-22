import setup from '../helpers/vuex-setup'
import htmlBeautify from 'html-beautify'
import Vuelidate from 'vuelidate'
import PageBond from 'renderer/components/staking/PageBond'

describe('PageBond', () => {
  let wrapper, store, router
  let {mount, localVue} = setup()
  localVue.use(Vuelidate)

  beforeEach(() => {
    let test = mount(PageBond)
    store = test.store
    router = test.router
    wrapper = test.wrapper

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
        country: 'USA'
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
        country: 'Canada'
      }
    })

    wrapper.update()
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should return to the candidates if desired', () => {
    wrapper.find('.ni-tool-bar a').trigger('click')
    expect(router.currentRoute.fullPath).toBe('/staking')
  })

  it('shows selected candidates', () => {
    expect(htmlBeautify(wrapper.html())).toContain('pubkeyX')
    expect(htmlBeautify(wrapper.html())).toContain('pubkeyY')
  })
})
