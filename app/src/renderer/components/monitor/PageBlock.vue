<template lang="pug">
page(:title="pageBlockTitle")
  data-loading(v-if="blockchain.blockLoading")
  data-empty(v-else-if="!block || !block.header || !blockMeta")
  template(v-else)
    div(slot="menu"): tool-bar
      router-link(:to="{ name: 'block', params: { block: block.header.height - 1 }}"
        :disabled="block.header.height === 0"
        :event="block.header.height === 0 ? '' : 'click'"
        v-tooltip.bottom="'Older Block'")
        i.material-icons chevron_left
      router-link(:to="{ name: 'block', params: { block: block.header.height + 1 }}"
        :disabled="!nextBlockAvailable"
        :event="nextBlockAvailable ? 'click' : ''"
        v-tooltip.bottom="'Newer Block'")
        i.material-icons chevron_right

    part(title='')
      list-item(dt="Block Hash" :dd="blockMeta.block_id.hash")

    part(title='Header')
      list-item(dt="Chain ID" :dd="block.header.chain_id")
      list-item(dt="Time" :dd="blockHeaderTime")
      list-item(dt="Transactions" :dd="block.header.num_txs")
      list-item(dt="Last Commit Hash" :dd="block.header.last_commit_hash")
      list-item(dt="Validators Hash" :dd="block.header.validators_hash")
      list-item(dt="App Hash" :dd="block.header.app_hash")

    part(title='Last Block')
      list-item(dt="Hash" :dd="block.header.last_block_id.hash")
      list-item(dt="Parts Total"
        :dd="block.header.last_block_id.parts.total")
      list-item(dt="Parts Hash" :dd="block.header.last_block_id.parts.hash")

    part(title="Precommit"
      v-for="p in block.last_commit.precommits"
      :key="p.validator_address" v-if="p !== null")
      list-item(dt="Address" :dd="p.validator_address")
      list-item(dt="Index" :dd="p.validator_index")
      list-item(dt="Round" :dd="p.round")
      list-item(:dt="`Sig (${p.signature.type})`"
      :dd="p.signature.data")

    part(title='Transactions')
      data-loading(v-if="blockchain.blockLoading")
      data-empty(v-else-if="block.header.num_txs === 0" title="Empty Block" subtitle="There were no transactions in this block.")
      template(
        v-else-if="txs.length"
        )
        li-transaction(
          :key="tkey + '-tx'"
          v-for="(tx, tkey) in txs"
          v-if="isObj(tx)"
          :transaction-value="transactionValueify(tx)"
          :address="tx.tx.msg.inputs[0].address"
          :devMode="config.devMode")
</template>

<script>
import { mapGetters } from "vuex"
import moment from "moment"
import num from "scripts/num"
import LiTransaction from "wallet/LiTransaction"
import DataLoading from "common/NiDataLoading"
import DataEmpty from "common/NiDataEmpty"
import ToolBar from "common/NiToolBar"
import ListItem from "common/NiListItem"
import Part from "common/NiPart"
import Page from "common/NiPage"
export default {
  name: "page-block",
  components: {
    LiTransaction,
    DataLoading,
    DataEmpty,
    ToolBar,
    ListItem,
    Part,
    Page
  },
  computed: {
    ...mapGetters(["blockchain", "blockTxInfo", "config"]),
    blockchainHeight() {
      return this.blockchain.blocks.length > 0
        ? this.blockchain.blocks[0].header.height
        : 0
    },
    txs() {
      return this.blockTxInfo || (this.block.data && this.block.data.txs)
    },
    block() {
      return this.blockchain.block
    },
    blockHeaderTime() {
      if (this.block.header) {
        return moment(this.block.header.time).format("MMMM Do YYYY — hh:mm:ss")
      } else {
        return "Loading..."
      }
    },
    blockMeta() {
      return this.blockchain.blockMetaInfo
    },
    pageBlockTitle() {
      if (this.block && this.block.header) {
        return "Block #" + num.prettyInt(this.block.header.height)
      } else {
        return "Loading..."
      }
    },
    nextBlockAvailable() {
      return (
        this.block &&
        this.block.header &&
        this.block.header.height < this.blockchainHeight
      )
    }
  },
  methods: {
    isObj(thing) {
      return typeof thing === "object"
    },
    fetchBlock() {
      this.$store.dispatch("getBlock", parseInt(this.$route.params.block))
    },
    transactionValueify(tv) {
      tv = JSON.parse(JSON.stringify(tv))
      tv.tx.inputs = tv.tx.msg.inputs
      tv.tx.outputs = tv.tx.msg.outputs
      tv.time = this.block && this.block.blockHeaderTime
      return tv
    }
  },
  mounted() {
    this.fetchBlock()
  },
  watch: {
    $route(to, from) {
      this.fetchBlock()
    }
  }
}
</script>
