import { shallowMount } from "@vue/test-utils"
import MultiSendMessageDetails from "src/components/transactions/message-view/MultiSendMessageDetails"

describe(`MultiSendMessageDetails`, () => {
  let wrapper
  const tx = {
    height: 2000000,
    value: {
      inputs: [
        {
          address: `cosmos1ahtlr29s38w23xxq7slcwmmz4c8x9efmr8qmee`,
          coins: [
            {
              amount: "20000000000",
              denom: "uatom"
            }
          ]
        }
      ],
      outputs: [
        {
          address: `cosmos1ahtlr29s38w23xxq7slcwmmz4c8x9efmr8qmee`,
          coins: [
            {
              amount: "10000000000",
              denom: "uatom"
            }
          ]
        },
        {
          address: `cosmos1clpqr4nrk4khgkxj78fcwwh6dl3uw4ep4tgu9q`,
          coins: [
            {
              amount: "10000000000",
              denom: "uatom"
            }
          ]
        }
      ]
    },
    fee: {
      amount: "37",
      denom: "uatom"
    },
    hash: `ABCD1234`,
    group: `banking`,
    key: "keyhash",
    memo: "(Sent via Lunie)",
    timestamp: 123456789,
    liquidDate: null,
    type: `cosmos-sdk/MsgMultiSend`
  }

  const tx2 = {
    height: 2000000,
    value: {
      inputs: [
        {
          address: `cosmos1ahtlr29s38w23xxq7slcwmmz4c8x9efmr8qmee`,
          coins: [
            {
              amount: "20000000000",
              denom: "uatom"
            }
          ]
        }
      ],
      outputs: [
        {
          address: `cosmos14kn0kk33szpwus9nh8n87fjel8djx0y0mmswhp`,
          coins: [
            {
              amount: "10000000000",
              denom: "uatom"
            }
          ]
        },
        {
          address: `cosmos1clpqr4nrk4khgkxj78fcwwh6dl3uw4ep4tgu9q`,
          coins: [
            {
              amount: "10000000000",
              denom: "uatom"
            }
          ]
        }
      ]
    },
    fee: {
      amount: "37",
      denom: "uatom"
    },
    hash: `ABCD1234`,
    group: `banking`,
    key: "keyhash",
    memo: "(Sent via Lunie)",
    timestamp: 123456789,
    liquidDate: null,
    type: `cosmos-sdk/MsgMultiSend`
  }

  it(`renders a sent transaction message`, () => {
    wrapper = shallowMount(MultiSendMessageDetails, {
      propsData: {
        transaction: tx,
        sessionAddress: "cosmos1ahtlr29s38w23xxq7slcwmmz4c8x9efmr8qmee"
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`renders a received transaction message`, () => {
    wrapper = shallowMount(MultiSendMessageDetails, {
      propsData: {
        transaction: tx,
        sessionAddress: "cosmos1clpqr4nrk4khgkxj78fcwwh6dl3uw4ep4tgu9q"
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`renders a sent transaction message (send to yourself)`, () => {
    wrapper = shallowMount(MultiSendMessageDetails, {
      propsData: {
        transaction: tx,
        sessionAddress: "cosmos1ahtlr29s38w23xxq7slcwmmz4c8x9efmr8qmee"
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  // it(`renders a sent transaction message (sent to another address)`, () => {
  //   wrapper = shallowMount(MultiSendMessageDetails, {
  //     propsData: {
  //       transaction: tx2,
  //       sessionAddress: "cosmos1ahtlr29s38w23xxq7slcwmmz4c8x9efmr8qmee"
  //     }
  //   })
  //   expect(wrapper.element).toMatchSnapshot()
  // })
  //

  // it(`renders a send transaction details message (send to another address)`, () => {
  //   wrapper = shallowMount(MultiSendMessageDetails, {
  //     propsData: {
  //       transaction: tx,
  //       show: `details`,
  //       sessionAddress: "cosmos1clpqr4nrk4khgkxj78fcwwh6dl3uw4ep4tgu9q"
  //     }
  //   })
  //   expect(wrapper.element).toMatchSnapshot()
  // })

  // it(`renders a received transaction caption message`, () => {
  //   wrapper = shallowMount(MultiSendMessageDetails, {
  //     propsData: {
  //       transaction: tx,
  //       show: `caption`,
  //       sessionAddress: "cosmos1clpqr4nrk4khgkxj78fcwwh6dl3uw4ep4tgu9q"
  //     }
  //   })
  //   expect(wrapper.element).toMatchSnapshot()
  // })

  // it(`renders a multi send received transaction details message (to yourself)`, () => {
  //   wrapper = shallowMount(MultiSendMessageDetails, {
  //     propsData: {
  //       transaction: tx,
  //       show: `details`,
  //       sessionAddress: "cosmos1ahtlr29s38w23xxq7slcwmmz4c8x9efmr8qmee"
  //     }
  //   })
  //   expect(wrapper.element).toMatchSnapshot()
  // })

  // it(`renders a multi send received transaction details message (to another address)`, () => {
  //   wrapper = shallowMount(MultiSendMessageDetails, {
  //     propsData: {
  //       transaction: tx,
  //       show: `details`,
  //       sessionAddress: "cosmos1clpqr4nrk4khgkxj78fcwwh6dl3uw4ep4tgu9q"
  //     }
  //   })
  //   expect(wrapper.element).toMatchSnapshot()
  // })

})
