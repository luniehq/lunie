import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import htmlBeautify from 'html-beautify'
import NiConnectivity from 'common/NiConnectivity'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('NiConnectivity', () => {
  let wrapper
  let store = new Vuex.Store({
    getters: {
      connected: () => true,
      lastHeader: () => ({ chain_id: 'gaia-home', height: '31337' }),
      nodeIP: () => '127.0.0.1'
    }
  })
  store.commit = jest.fn()

  beforeEach(() => {
    wrapper = mount(NiConnectivity, {
      localVue,
      store
    })
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('has a network icon', () => {
    expect(wrapper.find('.ni-li:nth-child(1) i.material-icons').text().trim())
      .toBe('done')
  })

  it('has a network string', () => {
    expect(wrapper.find('.ni-li:nth-child(1) .ni-li-title').text().trim())
      .toBe('gaia-home (#31,337)')
  })

  it('has an IP icon', () => {
    expect(wrapper.find('.ni-li:nth-child(2) i.material-icons').text().trim())
      .toBe('settings_ethernet')
  })

  it('has an IP string', () => {
    expect(wrapper.find('.ni-li:nth-child(2) .ni-li-title').text().trim())
      .toBe('127.0.0.1')
  })
})
