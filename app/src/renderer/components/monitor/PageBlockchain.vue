<template lang="pug">
page(title='Monitor')
  div(slot="menu"): tool-bar
  template(v-if="blockchain")
    part(title='Versions')
      list-item(dt='Network Name' :dd='lastHeader.chain_id')
      list-item(dt='ABCI Version' :dd='abciVersion')
      list-item(dt='Tendermint Version' :dd='tendermintVersion')

    part(title='Latest Block')
      list-item(dt='Block Height' :dd='num.prettyInt(status.latest_block_height)'
        :to="{ name: 'block', params: { block: status.latest_block_height} }")
      list-item(dt='Latest Block Time' :dd='latestBlockTime')
      list-item(dt='Latest Block Hash' :dd='status.latest_block_hash')

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
    ...mapGetters(['blockchain', 'validators', 'lastHeader']),
    status () {
      return this.blockchain.status
    },
    abciVersion () {
      return this.blockchain.abciInfo.response.data.substring(6, this.blockchain.abciInfo.response.length)
    },
    tendermintVersion () {
      return this.status.node_info.version.substring(0, 6)
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
  })
}
</script>
