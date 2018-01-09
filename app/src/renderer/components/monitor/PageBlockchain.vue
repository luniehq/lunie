<template lang="pug">
page(title='Blockchain')
  div(slot="menu"): tool-bar
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search

  template(v-if="blockchain")
    part(title='Metadata')
      list-item(dt='Network Name' :dd='status.node_info.network')
      list-item(dt='App Version' :dd='version')
      list-item(dt='Tendermint Version' :dd='status.node_info.version')

    part(title='Block')
      list-item(dt='Block Height' :dd='num.prettyInt(status.latest_block_height)'
        :to="{ name: 'block', params: { block: status.latest_block_height} }")
      list-item(dt='Latest Block Time' :dd='latestBlockTime')
      list-item(dt='Latest Block Hash' :dd='status.latest_block_hash')

    part(title='Nodes')
      list-item(dt='Active Nodes' :dd='validators.length')

  data-error(v-else)
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
    ...mapGetters(['blockchain', 'config', 'validators']),
    status () {
      console.log(this.config)
      console.log(this.validators)
      return this.blockchain.status
    },
    version () {
      return this.blockchain.abciInfo.response.data.substring(10, this.blockchain.abciInfo.response.length)
    },
    currentRate () {
      let txs = 0
      // this.validators.reduce(txs, v => (txs += v.connection_status.SendMonitor.CurRate))
      for (let i = 0; i < this.validators.length; i++) {
        console.log(this.validators[i])
        txs += this.validators[i].connection_status.SendMonitor.CurRate
      }
      let average = Math.round(txs / this.validators.length)
      return average
    },
    averageRate () {
      let txs = 0
      for (let i = 0; i < this.validators.length; i++) {
        txs += this.validators[i].connection_status.SendMonitor.AvgRate
      }
      let average = Math.round(txs / this.validators.length)
      return average
    },
    latestBlockTime () {
      return moment(this.status.latest_block_time).format('MMMM Do YYYY — hh:mm:ss')
    }
  },
  data: () => ({
    moment: moment,
    num: num
  }),
  methods: {
    setSearch (bool) {
      this.$store.commit('setSearchVisible', ['balances', bool])
    },
  }
}
</script>
