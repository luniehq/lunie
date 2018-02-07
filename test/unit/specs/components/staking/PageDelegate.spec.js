import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import PageDelegate from 'renderer/components/staking/PageDelegate'

const localVue = createLocalVue()
localVue.use(Vuex)

const $route = {
  params: {
    delegate: '1a2b3c'
  }
}

describe('PageDelegate', () => {
  let wrapper
  let store = new Vuex.Store({
    getters: {
      config: () => ({ desktop: false }),
      delegates: () => ({
        delegates: [
          {
            id: '1a2b3c',
            moniker: 'JB',
            website: 'https://the.zone',
            voting_power: 1000,
            owner: {
              addr: 'helloaddr'
            },
            pub_key: {
              data: '123pubkeyforme'
            }
          },
          {
            id: 'd4e5f6'
          }
        ]
      })
    }
  })

  beforeEach(() => {
    wrapper = mount(PageDelegate, {
      localVue,
      store,
      mocks: {
        $route
      }
    })

    wrapper.update()
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should return one delegate based on route params', () => {
    expect(wrapper.vm.delegate.id).toEqual('1a2b3c')
  })
})
