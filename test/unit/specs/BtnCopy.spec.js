import Vuex from 'vuex'
import { shallow, createLocalVue } from 'vue-test-utils'
import BtnCopy from '../../../app/src/renderer/components/wallet/BtnCopy'

const notifications = require('@/renderer/vuex/modules/notifications').default({})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('BtnCopy', () => {
  let wrapper, store
  let propsData = {
    value: 'some string longer than 20'
  }

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        notifications
      }
    })
    wrapper = shallow(BtnCopy, {
      localVue,
      store,
      propsData
    })

    jest.spyOn(store, 'commit')
  })

  it('has a value from props', () => {
    expect(wrapper.vm.value).toEqual('some string longer than 20')
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('returns truncated value if value.length is greater than 20', () => {
    const truncated = wrapper.vm.trunc(wrapper.vm.value)
    expect(truncated).toEqual('some strin...')
  })

  it('calls notify on click', () => {
    wrapper.vm.click()
    expect(store.commit).toHaveBeenCalled()
  })
})
