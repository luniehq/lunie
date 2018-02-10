<template lang="pug">
page(:title="pageBlockTitle" v-if="block.header")
  div(slot="menu"): tool-bar
    a(:href="blockUrl" target="_blank")
      i.material-icons code
      .label JSON
    router-link(:to="{ name: 'block', params: { block: block.header.height - 1 }}")
      i.material-icons chevron_left
      .label Previous Block
    router-link(:to="{ name: 'block', params: { block: block.header.height + 1 }}")
      i.material-icons chevron_right
      .label Next Block

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
    list-item(v-else v-for="tx in block.data.txs" :key="tx.id" dt="Transaction" :dd="TODO")
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import num from 'scripts/num'
import DataLoading from 'common/NiDataLoading'
import DataEmpty from 'common/NiDataEmpty'
import ToolBar from 'common/NiToolBar'
import ListItem from 'common/NiListItem'
import Part from 'common/NiPart'
import Page from 'common/NiPage'
export default {
  name: 'page-block',
  components: {
    DataLoading,
    DataEmpty,
    ToolBar,
    ListItem,
    Part,
    Page
  },
  computed: {
    ...mapGetters(['blockchain']),
    block () {
      if (this.blockchain.block.block) {
        return this.blockchain.block.block
      } else {
        return {}
      }
    },
    blockUrl () {
      return this.blockchain.url
    },
    blockHeaderTime () {
      if (this.block.header.time) {
        return moment(this.block.header.time).format('MMMM Do YYYY — hh:mm:ss')
      } else {
        return 'Loading...'
      }
    },
    blockMeta () {
      if (this.block) {
        return this.blockchain.block.block_meta
      } else {
        return {}
      }
    },
    pageBlockTitle () {
      if (this.block.header) {
        return 'Block #' + num.prettyInt(this.block.header.height)
      } else {
        return 'Loading...'
      }
    }
  },
  methods: {
    fetchBlock () {
      this.$store.dispatch('getBlock', this.$route.params.block)
    }
  },
  mounted () {
    this.fetchBlock()
  },
  watch: {
    '$route' (to, from) {
      this.fetchBlock()
    }
  }
}
</script>
