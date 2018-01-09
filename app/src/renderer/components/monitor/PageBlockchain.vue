<template lang="pug">
page(title='Monitor')
  div(slot="menu"): tool-bar
  template
    part(title='Latest Block')
      list-item(dt='Block Height' :dd='num.prettyInt(lastHeader.height)'
        :to="{ name: 'block', params: { block: lastHeader.height} }")
      list-item(dt='Latest Block Time' :dd='latestBlockTime')
      list-item(dt='Latest Block Hash' :dd='status.latest_block_hash')
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
    }
  },
  data: () => ({
    moment: moment,
    num: num
  })
}
</script>
