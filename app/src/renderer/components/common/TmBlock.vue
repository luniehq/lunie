<template lang="pug">
  div
    tm-part(title='')
      tm-list-item(dt="Block Hash" :dd="blockMeta.block_id.hash")
    tm-part(title='Header')
      tm-list-item(dt="Chain ID" :dd="block.header.chain_id")
      tm-list-item(dt="Time" :dd="blockHeaderTime")
      tm-list-item(dt="Transactions" :dd="block.header.num_txs")
      tm-list-item(dt="Last Commit Hash" :dd="block.header.last_commit_hash")
      tm-list-item(dt="Validators Hash" :dd="block.header.validators_hash")
      tm-list-item(dt="App Hash" :dd="block.header.app_hash")
    tm-part(title='Last Block')
      tm-list-item(dt="Hash" :dd="block.header.last_block_id.hash")
      tm-list-item(dt="Parts Total"
        :dd="block.header.last_block_id.parts.total")
      tm-list-item(dt="Parts Hash" :dd="block.header.last_block_id.parts.hash")
    tm-part(title="Precommit"
      v-for="p in block.last_commit.precommits"
      :key="p.validator_address" v-if="p !== null")
      tm-list-item(dt="Address" :dd="p.validator_address")
      tm-list-item(dt="Index" :dd="p.validator_index")
      tm-list-item(dt="Round" :dd="p.round")
      tm-list-item(:dt="`Sig (${p.signature.type})`"
      :dd="p.signature.data")
    tm-part(title='Transactions')
      tm-data-loading(v-if="loading")
      tm-data-empty(v-else-if="block.header.num_txs === 0" title="Empty Block" subtitle="There were no transactions in this block.")
      template(
        v-else-if="txs.length"
        )
        tm-li-transaction(
          :key="tkey + '-tx'"
          v-for="(tx, tkey) in txs"
          v-if="isObj(tx)"
          :transaction-value="transactionValueify(tx)"
          :address="tx.tx.msg.inputs[0].address"
          )
</template>
<script>
import {
  TmPart,
  TmListItem,
  TmDataEmpty,
  TmDataLoading,
  TmLiTransaction
} from "@tendermint/ui"
import moment from "moment"

export default {
  name: "tm-blocks",
  components: {
    TmPart,
    TmListItem,
    TmDataEmpty,
    TmDataLoading,
    TmLiTransaction
  },
  props: {
    loading: {
      type: Boolean,
      default: true
    },
    blockMeta: {
      type: Object,
      default: {
        block_id: {
          hash: null
        }
      }
    },
    txs: {
      type: Array,
      default: [
        {
          tx: {
            msg: {
              inputs: [{ address: null }],
              outputs: null
            }
          }
        }
      ]
    },
    block: {
      type: Object,
      default: {
        header: {
          chain_id: null,
          time: null,
          num_txs: null,
          last_commit_hash: null,
          validators_hash: null,
          app_hash: null,
          last_block_id: {
            hash: null,
            parts: {
              total: null,
              hash: null
            }
          }
        },
        last_commit: {
          precommits: [
            {
              validator_address: null,
              validator_index: null,
              round: null,
              signature: {
                type: null,
                data: null
              }
            }
          ]
        }
      }
    }
  },
  computed: {
    blockHeaderTime() {
      if (this.block.header) {
        return moment(this.block.header.time).format("MMMM Do YYYY — hh:mm:ss")
      } else {
        return "Loading..."
      }
    }
  },
  methods: {
    isObj(thing) {
      return typeof thing === "object"
    },

    transactionValueify(tv) {
      tv = JSON.parse(JSON.stringify(tv))
      tv.tx.inputs = tv.tx.msg.inputs
      tv.tx.outputs = tv.tx.msg.outputs
      tv.time = this.block && this.block.blockHeaderTime
      return tv
    }
  }
}
</script>
