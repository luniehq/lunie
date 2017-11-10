import Vue from 'vue'
import Vuex from 'vuex'
import { shallow, createLocalVue } from 'vue-test-utils'
import { store } from '../../../app/src/renderer/vuex/store'
import PageBalances from '../../../app/src/renderer/components/wallet/PageBalances'

describe('PageBalances', () => {
  let vm
  let localVue = createLocalVue()
  localVue.use(Vuex)

  const AnchorCopy = Vue.extend({ template: 'AnchorCopy' })
  const Btn = Vue.extend({ template: 'Btn' })
  const ListItem = Vue.extend({ template: 'ListItem' })
  const ModalSearch = Vue.extend({ template: 'ModalSearch' })
  const Page = Vue.extend({ template: 'Page' })
  const Part = Vue.extend({ template: 'Part' })
  const ToolBar = Vue.extend({ template: 'ToolBar' })

  beforeEach(() => {
    vm = shallow(PageBalances, {
      store,
      localVue,
      components: {
        AnchorCopy,
        Btn,
        ListItem,
        ModalSearch,
        Page,
        Part,
        ToolBar
      }
    })
  })

  it('has the expected html structure', () => {
    expect(vm.$el).toMatchSnapshot()
  })
})
