<template lang="pug">
page(title='Blocks')
  div(slot="menu"): tool-bar
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search

  modal-search(type="blockchain")

  template
    part(title='Latest Block')
      list-item(dt='Block Height' :dd='num.prettyInt(lastHeader.height)' :to="{ name: 'block', params: { block: lastHeader.height} }")
      list-item(dt='Latest Block Time' :dd='latestBlockTime')
      list-item(dt='Latest Block Hash' :dd='status.latest_block_hash')

    part(title='Block Explorer')
      list-item.column-header(dt="Block Height" dd="# of Transactions")
      list-item(
        v-for="block in filteredBlocks"
        :key="block.header.height"
        :dt="block.header.height"
        :dd="block.data.txs.length"
        :to="{ name: 'block', params: { block: block.header.height} }")
</template>

<script>
import moment from 'moment'
import num from 'scripts/num'
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import ListItem from 'common/NiListItem'
import DataError from 'common/NiDataError'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import ToolBar from 'common/NiToolBar'
import ModalSearch from 'common/NiModalSearch'
export default {
  name: 'page-blockchain',
  components: {
    ListItem,
    DataError,
    Page,
    Part,
    ToolBar,
    ModalSearch
  },
  computed: {
    ...mapGetters(['blockchain', 'validators', 'lastHeader', 'filters']),
    status () {
      return this.blockchain.status
    },
    latestBlockTime () {
      return moment(this.status.latest_block_time).format('MMMM Do YYYY — hh:mm:ss')
    },
    blocks () {
      return this.blockchain.blocks
    },
    filteredBlocks () {
      let query = this.filters.blockchain.search.query
      let list = this.blocks

      if (this.filters.blockchain.search.visible && query) {
        return list.filter(i => includes(i.header.height, query))
      } else {
        return list
      }
    }
  },
  methods: {
    setSearch (bool) { this.$store.commit('setSearchVisible', ['blockchain', bool]) }
  },
  mounted () {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => this.setSearch(true))
    Mousetrap.bind('esc', () => this.setSearch(false))
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
