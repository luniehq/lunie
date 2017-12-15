import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import AppFooter from 'renderer/components/common/AppFooter'
const node = require('renderer/vuex/modules/node').default({
  node: require('../helpers/node_mock')
})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('AppFooter', () => {
  let wrapper, store

  it('has the expected html structure if connected', () => {
    store = new Vuex.Store({
      getters: {
        nodeIP: () => node.state.nodeIP,
        connected: () => node.state.connected,
        lastHeader: () => node.state.lastHeader
      }
    })

    node.state = {
      nodeIP: '192.169.9.5',
      connected: true,
      lastHeader: {
        chain_id: 'gaia-1',
        height: '4555'
      }
    }

    wrapper = mount(AppFooter, {
      localVue,
      store
    })

    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('has the expected html structure if not connected', () => {
    store = new Vuex.Store({
      getters: {
        nodeIP: () => node.state.nodeIP,
        connected: () => node.state.connected,
        lastHeader: () => node.state.lastHeader
      }
    })

    node.state = {
      nodeIP: '192.169.9.5',
      connected: false,
      lastHeader: {
        chain_id: 'gaia-1',
        height: '4555'
      }
    }

    wrapper = mount(AppFooter, {
      localVue,
      store
    })

    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
    expect(wrapper.contains('.afi-connecting')).toBe(true)
  })
})
