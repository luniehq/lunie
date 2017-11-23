import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import BtnCopy from '@/components/wallet/BtnCopy'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('BtnCopy', () => {
  let wrapper
  let propsData = {
    value: 'some string longer than 20'
  }

  beforeEach(() => {
    wrapper = mount(BtnCopy, {
      localVue,
      propsData
    })
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
})
