const CosmosV2Reducer = require('../../lib/reducers/cosmosV2-reducers')

describe('Cosmos V2 Reducer', function () {
  describe('transactionReducerV2', function () {
    it('on partially failed txs', () => {
      const network = {
        id: `cosmos-hub-mainnet`,
        getCoinLookup() {
          return {
            chainDenom: 'uatom',
            viewDenom: 'ATOM',
            chainToViewConversionFactor: 0.000001
          }
        }
      }
      //Arrange
      const transaction = {
        id: '8A5713CFA4A3106F7D17D945E661BA7509F7038B7960D2B078B972732BD6FEAD',
        height: '1546139',
        txhash:
          '8A5713CFA4A3106F7D17D945E661BA7509F7038B7960D2B078B972732BD6FEAD',
        raw_log:
          '[{"msg_index":0,"success":true,"log":"","events":[{"type":"message","attributes":[{"key":"module","value":"distribution"},{"key":"sender","value":"cosmos1fh44aqn7m4v570ujtjlmt3dytq80qyfwj07ckc"},{"key":"action","value":"withdraw_delegator_reward"}]},{"type":"withdraw_rewards","attributes":[{"key":"amount"},{"key":"validator","value":"cosmosvaloper1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8"}]}]}]',
        logs: [
          {
            msg_index: 0,
            success: true,
            log: '',
            events: [
              {
                type: 'message',
                attributes: [
                  {
                    key: 'module',
                    value: 'distribution'
                  },
                  {
                    key: 'sender',
                    value: 'cosmos1fh44aqn7m4v570ujtjlmt3dytq80qyfwj07ckc'
                  },
                  {
                    key: 'action',
                    value: 'withdraw_delegator_reward'
                  }
                ]
              },
              {
                type: 'withdraw_rewards',
                attributes: [
                  {
                    key: 'amount'
                  },
                  {
                    key: 'validator',
                    value:
                      'cosmosvaloper1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8'
                  }
                ]
              }
            ]
          }
        ],
        gas_wanted: '600000',
        gas_used: '67891',
        tx: {
          type: 'cosmos-sdk/StdTx',
          value: {
            msg: [
              {
                type: 'cosmos-sdk/MsgWithdrawDelegationReward',
                value: {
                  delegator_address:
                    'cosmos1fh44aqn7m4v570ujtjlmt3dytq80qyfwj07ckc',
                  validator_address:
                    'cosmosvaloper1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8'
                }
              }
            ],
            fee: {
              amount: [
                {
                  denom: 'uatom',
                  amount: '2500'
                }
              ],
              gas: '600000'
            },
            signatures: [
              {
                pub_key: {
                  type: 'tendermint/PubKeySecp256k1',
                  value: 'A1nDrB5BMyQQ11NEo5yjQ1ELCqbM0CmjT0oT5AOhasKO'
                },
                signature:
                  'Ao4INIcpJzUkE9ZFUTD6nbE/geVpFtoXKv71WxjC6Go38TX0h/KiVdO9oKBgYB7Pv0PuVtEM+7elFJELXasH/g=='
              }
            ],
            memo: ''
          }
        },
        timestamp: '2020-04-16T21:55:10Z',
        events: [
          {
            type: 'message',
            attributes: [
              {
                key: 'module',
                value: 'distribution'
              },
              {
                key: 'sender',
                value: 'cosmos1fh44aqn7m4v570ujtjlmt3dytq80qyfwj07ckc'
              },
              {
                key: 'action',
                value: 'withdraw_delegator_reward'
              }
            ]
          },
          {
            type: 'withdraw_rewards',
            attributes: [
              {
                key: 'amount'
              },
              {
                key: 'validator',
                value: 'cosmosvaloper1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8'
              }
            ]
          }
        ]
      }

      //Act
      const result = CosmosV2Reducer.transactionReducerV2(
        network,
        transaction,
        CosmosV2Reducer
      )

      //Assert
      expect(result).toMatchSnapshot()
    })
  })
})
