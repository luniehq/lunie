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

test(`checkbox value default to false`, () => {
  const wrapper = Wrapper()
  let checkbox = wrapper.find(`#checkbox`)
  expect(JSON.parse(checkbox.element.value)).toBe(false) // value is returned as string (`false`)
  expect(wrapper.vm.approve).toEqual(false)
})

test(`disables the 'Vote' button`, () => {
  const wrapper = Wrapper()

  // default values
  let voteBtn = wrapper.find(`#cast-vote`)
  expect(voteBtn.html()).toContain(`disabled="disabled"`)

  // selected option but hasn't approved checkbox
  wrapper.setData({ option: `yes`, approve: false })
  voteBtn = wrapper.find(`#cast-vote`)
  expect(voteBtn.html()).toContain(`disabled="disabled"`)

  // approved checkbox but hasn't selected option
  wrapper.setData({ option: ``, approve: true })
  voteBtn = wrapper.find(`#cast-vote`)
  expect(voteBtn.html()).toContain(`disabled="disabled"`)

  // non valid option value
  wrapper.setData({ option: `other`, approve: true })
  voteBtn = wrapper.find(`#cast-vote`)
  expect(voteBtn.html()).toContain(`disabled="disabled"`)
})

test(`enables the 'Vote' button if the user selected a valid option`, () => {
  const wrapper = Wrapper()

  wrapper.setData({ option: `yes`, approve: true })
  let voteBtn = wrapper.find(`#cast-vote`)
  expect(voteBtn.html()).not.toContain(`disabled="disabled"`)

  wrapper.setData({ option: `no`, approve: true })
  voteBtn = wrapper.find(`#cast-vote`)
  expect(voteBtn.html()).not.toContain(`disabled="disabled"`)

  wrapper.setData({ option: `no_with_veto`, approve: true })
  voteBtn = wrapper.find(`#cast-vote`)
  expect(voteBtn.html()).not.toContain(`disabled="disabled"`)

  wrapper.setData({ option: `abstain`, approve: true })
  voteBtn = wrapper.find(`#cast-vote`)
  expect(voteBtn.html()).not.toContain(`disabled="disabled"`)
})

test(`updates the selected option on click`, () => {
  const wrapper = Wrapper()

  wrapper.vm.voteYes()
  expect(wrapper.vm.option).toEqual(`yes`)
  wrapper.vm.voteYes()
  expect(wrapper.vm.option).toEqual(``)

  wrapper.vm.voteNo()
  expect(wrapper.vm.option).toEqual(`no`)
  wrapper.vm.voteNo()
  expect(wrapper.vm.option).toEqual(``)

  wrapper.vm.voteVeto()
  expect(wrapper.vm.option).toEqual(`no_with_veto`)
  wrapper.vm.voteVeto()
  expect(wrapper.vm.option).toEqual(``)

  wrapper.vm.voteAbstain()
  expect(wrapper.vm.option).toEqual(`abstain`)
  wrapper.vm.voteAbstain()
  expect(wrapper.vm.option).toEqual(``)
})

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

test(`Avoids submitting a vote if the user hasn't selected the checkbox`, () => {
  const wrapper = Wrapper()
  wrapper.setData({ option: `yes`, approve: false })
  wrapper.vm.onVote()

  expect(wrapper.emittedByOrder()).toEqual([])
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
