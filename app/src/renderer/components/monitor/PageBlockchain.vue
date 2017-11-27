<template lang="pug">
page(title='Blockchain')
  div(slot="menu"): tool-bar
    router-link(to="/search" exact)
      i.material-icons search
      .label Search
    a(@click='toggleBlockchainSelect')
      i.material-icons(v-if='!config.blockchainSelect') filter_list
      i.material-icons(v-else='') close
      .label Switch Blockchain

  blockchain-select-modal

  template(v-if="bc")
    part(title='Metadata')
      list-item(dt='Network' :dd='bc.status.node_info.network')
      list-item(dt='App Version' :dd='version')
      list-item(dt='Tendermint Version' :dd='bc.status.node_info.version')

    part(title='Block')
      list-item(dt='Block Height' :dd='num.prettyInt(bc.status.latest_block_height)'
        :to="{ name: 'block', params: { block: bc.status.latest_block_height} }")
      list-item(dt='Latest Block Time' :dd='readableDate(bc.status.latest_block_time)')
      list-item(dt='Latest Block Hash' :dd='bc.status.latest_block_hash')

    part(title='Nodes')
      list-item(dt='Active Nodes' :dd='validators.length')
      list-item(dt='Current Rate' :dd="currentRate + ' bytes/s'")
      list-item(dt='Average Rate' :dd="averageRate + ' bytes/s'")
  template(v-else)
    p Nothing!
</template>

<script>
import moment from 'moment'
import num from 'scripts/num'
import { mapGetters } from 'vuex'
import BlockchainSelectModal from 'monitor/BlockchainSelectModal'
import ListItem from 'common/NiListItem'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-blockchain',
  components: {
    BlockchainSelectModal,
    ListItem,
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(['blockchain', 'config', 'validators']),
    bc () { return this.blockchain },
    version () {
      let v
      if (this.bc.blockchainName === 'venus') {
        v = this.bc.abciInfo.data
      } else {
        v = this.bc.abciInfo.data.substring(10, this.bc.abciInfo.data.length)
      }
      return v
    },
    avgTxThroughput () {
      return Math.round(this.bc.network.avg_tx_throughput * 1000) / 1000
    },
    currentRate () {
      let txs = 0
      // this.validators.reduce(txs, v => (txs += v.connection_status.SendMonitor.CurRate))
      for (let i = 0; i < this.validators.length; i++) {
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
    }
  },
  data: () => ({
    moment: moment,
    num: num
  }),
  methods: {
    readableDate (ms) {
      return moment(ms / 1000000).format('HH:mm:ss.SSS')
    },
    toggleBlockchainSelect () {
      this.$store.commit('SET_CONFIG_BLOCKCHAIN_SELECT', !this.config.blockchainSelect)
    }
  }
}
</script>
