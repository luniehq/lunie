export default ({ commit, node }) => {
  let state = {
    // account nonce number, used to prevent replay attacks
    nonce: 0,
    // queue of transactions to be sent
    queue: [],
    sending: false,
    loading: false
  }

  const mutations = {
    queueSend (state, sendReq) {
      state.queue.push(sendReq)
    },
    shiftSendQueue (state) {
      state.queue = state.queue.slice(1)
    },
    setSending (state, sending) {
      state.sending = sending
    },
    setNonce (state, nonce) {
      state.nonce = nonce
    }
  }

  let actions = {
    reconnected ({ state, dispatch, rootState }) {
      if (state.loading) {
        dispatch('queryNonce', rootState.user.address)
      }
    },
    // queries for our account's nonce
    async queryNonce ({ state, commit }, address) {
      state.loading = true
      let res = await node.queryNonce(address)
      if (!res) return
      commit('setNonce', res.data)
      state.loading = false
    },

    // builds, signs, and broadcasts a tx of any type
    sendTx ({ state, dispatch, commit, rootState }, args) {
      // wait until the current send operation is done
      if (state.sending) {
        args.done = new Promise((resolve, reject) => {
          args.resolve = resolve
          args.reject = reject
        })
        commit('queueSend', args)
        return args.done
      }

      return new Promise((resolve, reject) => {
        commit('setSending', true)

        // once done, do next send in queue
        function done (err, res) {
          commit('setSending', false)

          if (state.queue.length > 0) {
            // do next send
            let send = state.queue[0]
            commit('shiftSendQueue')
            dispatch('sendTx', send)
          }

          if (err) {
            reject(err)
            if (args.reject) args.reject(err)
          } else {
            resolve(res)
            if (args.resolve) args.resolve(res)
          }
        }

        args.sequence = state.nonce + 1
        args.from = {
          chain: '',
          app: 'sigs',
          addr: rootState.wallet.key.address
        };

        (async function () {
          // build tx
          let tx = await node[args.type](args)

          // sign tx
          let signedTx = await node.sign({
            name: rootState.user.account,
            password: rootState.user.password,
            tx
          })

          // broadcast tx
          let res = await node.postTx(signedTx)

          // check response code
          if (res.check_tx.code || res.deliver_tx.code) {
            let message = res.check_tx.log || res.deliver_tx.log
            throw new Error('Error sending transaction: ' + message)
          }
        })().then(() => {
          commit('setNonce', state.nonce + 1)
          done(null, args)
          dispatch('queryWalletBalances')
        }, (err) => {
          done(err || Error('Error sending transaction'))
        })
      })
    }
  }

  return {
    state, mutations, actions
  }
}
