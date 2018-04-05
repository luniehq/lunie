import Vuex from "vuex"
import { mount, createLocalVue } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import ChartVotes from "renderer/components/govern/ChartVotes"

const localVue = createLocalVue()
localVue.use(Vuex)

describe("ChartVotes", () => {
  let wrapper, store, getters

  let propsData = {
    votes: {
      yes: 60,
      no: 20,
      reject: 5,
      abstain: 15
    },
    size: "lg"
  }

  beforeEach(() => {
    getters = {
      themes: () => ({})
    }
    store = new Vuex.Store({ getters })
    store.commit = jest.fn()
    store.dispatch = jest.fn(async () => true)
    wrapper = mount(ChartVotes, { propsData, localVue, store })
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
