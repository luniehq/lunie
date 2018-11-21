import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import TabMyDelegations from "renderer/components/staking/TabMyDelegations"

const delegates = lcdClientMock.candidates

it(`undelegatedValidators`, () => {
  expect(
    TabMyDelegations.computed.undelegatedValidators({
      delegation: {
        unbondingDelegations: {
          [delegates[1].operator_address]: 1,
          [delegates[2].operator_address]: 2
        }
      },
      delegates: { delegates }
    })
  ).toEqual([delegates[1], delegates[2]])
})

it(`yourValidators`, () => {
  expect(
    TabMyDelegations.computed.yourValidators({
      committedDelegations: {
        [delegates[0].operator_address]: 1,
        [delegates[2].operator_address]: 2
      },
      delegates: { delegates }
    })
  ).toEqual([delegates[0], delegates[2]])
})
