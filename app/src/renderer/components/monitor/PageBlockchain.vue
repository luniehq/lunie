<template lang="pug">
page(title='Blocks')
  div(slot="menu"): tool-bar
  template
    part(title='Latest Block')
      list-item(dt='Block Height' :dd='num.prettyInt(lastHeader.height)' :to="{ name: 'block', params: { block: lastHeader.height} }")
      list-item(dt='Latest Block Time' :dd='latestBlockTime')
      list-item(dt='Latest Block Hash' :dd='status.latest_block_hash')

    part(title='Block Explorer')
      list-item.column-header(dt="Block Height" dd="# of Transactions")
      list-item(
        v-for="block in blocks"
        :key="block.header.height"
        :subtitle="block.data.txs.length"
        :dt="block.header.height"
        :dd="block.data.txs.length"
        :to="{ name: 'block', params: { block: block.header.height} }")
</template>

<script>
import moment from 'moment'
import num from 'scripts/num'
import { mapGetters } from 'vuex'
import ListItem from 'common/NiListItem'
import DataError from 'common/NiDataError'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-blockchain',
  components: {
    ListItem,
    DataError,
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(['blockchain', 'validators', 'lastHeader']),
    status () {
      return this.blockchain.status
    },
    latestBlockTime () {
      return moment(this.status.latest_block_time).format('MMMM Do YYYY — hh:mm:ss')
    },
    blocks () {
      return this.blockchain.blocks
    }
   },
  data: () => ({
    moment: moment,
    num: num
  })
}
</script>
<style lang="stylus">
@require '~variables'

.column-header
  .ni-li-dd,
  .ni-li-dt
    font-size sm
    color dim
</style>
