<template lang="pug">
tm-page(title='Block Explorer')
  div(slot="menu"): tool-bar
    a(@click='setSearch()' v-tooltip.bottom="'Search Block'" :disabled="!somethingToSearch")
      i.material-icons search

  modal-search(type="blocks" v-if="somethingToSearch")

  data-loading(v-if="blockchain.syncing" title="Node is syncing blockchain…")
  data-loading(v-if="!blockchain.syncing && !blockchain.subscription")

  tm-part(title='Current Block' v-if="blockchain.subscription")
    tm-list-item(dt='Block Height' :dd='num.prettyInt(lastHeader.height)' :to="{ name: 'block', params: { block: lastHeader.height} }")
    tm-list-item(dt='Block Time' :dd='latestBlockTime')
    tm-list-item(dt='Block Hash' :dd='latestBlockHash')

  tm-part(title='Latest Blocks' v-if="blockchain.subscription")
    tm-list-item.column-header(dt="Block Height" dd="# of Transactions")
    tm-list-item(
      v-for="block in blocks"
      :key="block.header.height"
      :dt="num.prettyInt(block.header.height)"
      :dd="(block.data.txs || []).length"
      :to="{ name: 'block', params: { block: block.header.height} }")
</template>

<script>
import moment from "moment"
import Mousetrap from "mousetrap"
import num from "scripts/num"
import { mapGetters } from "vuex"
import { TmListItem, TmPage, TmPart } from "@tendermint-ui"
import DataError from "common/NiDataError"
import DataLoading from "common/NiDataLoading"
import ToolBar from "common/VrToolBar"
import ModalSearch from "common/NiModalSearch"
export default {
  name: "page-blocks",
  components: {
    TmListItem,
    DataError,
    DataLoading,
    TmPage,
    TmPart,
    ToolBar,
    ModalSearch
  },
  computed: {
    ...mapGetters(["blockchain", "lastHeader", "filters"]),
    somethingToSearch() {
      return !this.blockchain.syncing && !!this.blocks.length
    },
    latestBlockTime() {
      return moment(this.lastHeader.time).format("MMMM Do YYYY — hh:mm:ss")
    },
    latestBlockHash() {
      return this.lastHeader.last_block_id.hash
    },
    blocks() {
      return this.blockchain.blocks
    }
  },
  data: () => ({
    moment: moment,
    num: num
  }),
  methods: {
    setSearch(bool = !this.filters["blocks"].search.visible) {
      if (!this.somethingToSearch) return false
      this.$store.commit("setSearchVisible", ["blocks", bool])
    }
  },
  mounted() {
    Mousetrap.bind(["command+f", "ctrl+f"], () => this.setSearch(true))
    Mousetrap.bind("esc", () => this.setSearch(false))
  }
}
</script>

<style lang="stylus">
@require '~variables'

.column-header
  .tm-li-dd,
  .tm-li-dt
    font-size sm
    color var(--dim)
</style>
