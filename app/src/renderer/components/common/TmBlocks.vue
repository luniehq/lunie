<template lang="pug">
  tm-part(title='Latest Blocks' v-if="blocks.length")
    tm-list-item.column-header(dt="Block Height" dd="# of Transactions")
    tm-list-item(
      v-for="block in blocks"
      :key="block.header.height"
      :dt="prettyInt(block.header.height)"
      :dd="(block.data.txs || []).length"
      :to="{ name: 'block', params: { block: block.header.height} }")
</template>
<script>
import numeral from "numeral"
import { TmPart, TmListItem } from "@tendermint/ui"
export default {
  name: "tm-blocks",
  props: {
    blocks: {
      type: Array,
      default: []
    }
  },
  components: {
    TmPart,
    TmListItem
  },
  data: () => ({
    prettyInt(num) {
      return numeral(num).format("0,0")
    }
  })
}
</script>
