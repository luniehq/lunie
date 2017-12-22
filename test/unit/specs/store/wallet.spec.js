import Vuex from 'vuex'
import { createLocalVue } from 'vue-test-utils'

const Wallet = require('renderer/vuex/modules/wallet').default
const notifications = require('renderer/vuex/modules/notifications').default({})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Module: Wallet', () => {
  let store, node

  beforeEach(() => {
    node = require('../../helpers/node_mock')
    store = new Vuex.Store({
      modules: {
        wallet: Wallet({node}),
        notifications
      }
    })
  })

  it('should enrich transaction times', async () => {
    node.coinTxs = () => Promise.resolve([{
      tx: {},
      height: 1
    }, {
      tx: {},
      height: 2
    }, {
      tx: {},
      height: 2
    }])
    node.rpc.blockchain = ({minHeight, maxHeight}, cb) => {
      cb(null, {
        block_metas: [{
          header: {
            height: minHeight,
            time: minHeight
          }
        }]
      })
    }
    jest.spyOn(node.rpc, 'blockchain')
    await store.dispatch('queryWalletHistory')
    expect(node.rpc.blockchain.mock.calls.length).toBe(2)
    expect(store.state.wallet.history[0].time).toBe(1)
    expect(store.state.wallet.history[1].time).toBe(2)
  })
})
