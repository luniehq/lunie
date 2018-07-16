<template lang="pug">
tm-page(:title="pageBlockTitle")
  tm-data-loading(v-if="blockchain.blockLoading")
  tm-data-empty(v-else-if="!block || !block.header || !blockMeta")
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
    tm-block(:blockMeta="blockMeta", :block="block", :loading="blockchain.blockLoading", :txs="txs")
</template>

<script>
import { mapGetters } from "vuex"
import moment from "moment"
import num from "scripts/num"
import ToolBar from "common/TmToolBar"
import { TmPage, TmDataEmpty, TmDataLoading, TmBlock } from "@tendermint/ui"
export default {
  name: "page-block",
  components: {
    TmDataLoading,
    TmDataEmpty,
    ToolBar,
    TmPage,
    TmBlock
  },
  computed: {
    ...mapGetters(["blockchain", "blockTxInfo", "config"]),
    blockchainHeight() {
      return this.blockchain.blocks.length > 0
        ? this.blockchain.blocks[0].header.height
        : 0
    },
    txs() {
      return this.blockTxInfo
    },
    block() {
      return this.blockchain.block
    },
    blockHeaderTime() {
      if (this.block.header) {
        console.log("1 - moment", moment)
        console.log("1 - now", moment().format())
        console.log("1 - time", this.block.header.time)
        console.log(
          moment(this.block.header.time).format("MMMM Do YYYY — hh:mm:ss")
        )

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
    fetchBlock() {
      this.$store.dispatch("getBlock", parseInt(this.$route.params.block))
    }
  },
  mounted() {
    this.fetchBlock()
  },
  watch: {
    $route() {
      this.fetchBlock()
    }
  }
}
</script>
