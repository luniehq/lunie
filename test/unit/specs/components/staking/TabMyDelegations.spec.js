import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import TabMyDelegations from "renderer/components/staking/TabMyDelegations"

const delegates = lcdClientMock.candidates

test(`undelegatedValidators`, () => {
  expect(
    TabMyDelegations.computed.undelegatedValidators({
      delegation: {
        unbondingDelegations: {
          cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au: 3
        }
      },
      delegates: { delegates }
    })
  ).toEqual([delegates[1]])
})

test(`yourValidators`, () => {
  expect(
    TabMyDelegations.computed.yourValidators({
      committedDelegations: {
        cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au: 3
      },
      delegates: { delegates }
    })
  ).toEqual([delegates[1]])
})
