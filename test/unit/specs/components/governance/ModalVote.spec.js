"use strict"

import htmlBeautify from "html-beautify"
import { createLocalVue, mount } from "@vue/test-utils"
import ModalVote from "renderer/components/governance/ModalVote"
import Vuelidate from "vuelidate"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

const Wrapper = () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  return mount(ModalVote, {
    localVue,
    propsData: {
      proposalId: lcdClientMock.state.proposals[0].proposal_id
    }
  })
}

test(`renders correctly`, () => {
  expect(htmlBeautify(Wrapper().html())).toMatchSnapshot()
})

test(`the 'option' defaults to an empty string`, () => {
  const wrapper = Wrapper()
  expect(wrapper.vm.option).toEqual(``)
})

test(`display the approval checkbox`, () => {
  let checkbox = Wrapper().find(`#checkbox`)
  expect(JSON.parse(checkbox.element.value)).toBe(false) // value is returned as string (`false`)
})

test(`disables the 'Vote' button`, () => {
  const wrapper = Wrapper()

  let voteBtn = wrapper.find(`#cast-vote`)
  expect(voteBtn.html()).toContain(`disabled="disabled"`)

  wrapper.setData({ option: `yes`, approve: false })
  voteBtn = wrapper.find(`#cast-vote`)
  expect(voteBtn.html()).toContain(`disabled="disabled"`)

  wrapper.setData({ option: ``, approve: true })
  voteBtn = wrapper.find(`#cast-vote`)
  expect(voteBtn.html()).toContain(`disabled="disabled"`)
})

// test(`enables the 'Vote' button if the user selected a valid option`, () => {
//
//
//   let voteBtn =  Wrapper().find(`#cast-vote`)
//   expect(voteBtn.html()).toContain(`disabled="disabled"`)
// })

test(`Vote button casts a vote and closes modal`, () => {
  const wrapper = Wrapper()
  wrapper.setData({ option: `yes`, approve: true })
  wrapper.vm.onVote()

  expect(wrapper.emittedByOrder()).toEqual([
    {
      name: `submitVote`,
      args: [
        {
          option: `yes`,
          proposal_id: lcdClientMock.state.proposals[0].proposal_id
        }
      ]
    },
    {
      name: `update:showModalVote`,
      args: [false]
    }
  ])
})

test(`X button emits close signal`, () => {
  const wrapper = Wrapper()
  wrapper.vm.close()

  expect(wrapper.emittedByOrder()).toEqual([
    {
      name: `update:showModalVote`,
      args: [false]
    }
  ])
})
