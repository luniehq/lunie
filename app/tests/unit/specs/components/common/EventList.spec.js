import { shallowMount } from "@vue/test-utils"
import EventList from "src/components/common/EventList"
import { messageType } from "src/components/transactions/messageTypes"

describe(`EventList`, () => {
  let wrapper

  let txs = []
  let height = 1000000

  for (var type in messageType) {
    txs.push({
      type: messageType[type],
      hash: "A0DEB29E97A4DF38289D55D63C5724588985E1D35B26518CB66EAF96CFEF2E04",
      height,
      timestamp: new Date(
        Date.now() + txs.length * 1000 * 60 * 60 * 24
      ).toISOString(),
      memo: "",
      success: true,
      fees: [],
      details: {
        from: ["cosmosvaloper123"],
        to: ["cosmosvaloper456"],
        proposalType: "cosmos-sdk/TextProposal",
        proposalTitle: "Lunie was here!",
        proposalDescription: "Blah blah blah and blah blah blah ...",
        proposalId: 17,
        voteOption: "Yes",
        initialDeposit: {
          denom: "ATOM",
          amount: "10",
        },
        amount: {
          denom: "ATOM",
          amount: "10",
        },
      },
    })
  }

  beforeEach(() => {
    wrapper = shallowMount(EventList, {
      propsData: {
        events: txs,
        moreAvailable: true,
      },
      directives: {
        infiniteScroll: () => jest.fn(),
      },
      slots: {
        default: `<div />`,
      },
    })
  })

  it(`calls loadMore script on scroll`, () => {
    const self = {
      $emit: jest.fn(),
      events: txs,
      moreAvailable: true,
      maxReached: false,
      showing: 1,
    }
    EventList.methods.loadMore.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`loadMore`)
  })

  it(`doesn't call loadMore if not more available`, () => {
    const self = {
      $emit: jest.fn(),
      events: txs,
      moreAvailable: false,
      maxReached: false,
    }
    EventList.methods.loadMore.call(self)
    expect(self.$emit).not.toHaveBeenCalledWith(`loadMore`)
  })

  it(`doesn't call loadMore if already having enough`, () => {
    const self = {
      $emit: jest.fn(),
      moreAvailable: false,
      maxReached: false,
      events: new Array(20),
      showing: 20,
    }
    EventList.methods.loadMore.call(self)
    expect(self.$emit).not.toHaveBeenCalledWith(`loadMore`)
  })

  it(`renders a list of event items`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
