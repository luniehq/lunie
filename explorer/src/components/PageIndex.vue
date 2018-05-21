<template lang="pug">
page(title='Blockchain')
  part(title='Blockchain')
    list-item(dt='Network' :dd='bc.status.node_info.network')
    list-item(dt='Tendermint Version' :dd='bc.status.node_info.version')
    list-item(dt='Peer Nodes' :dd='peers.length')

  part(title='Current Block')
    list-item(dt='Block Height' :dd='num.prettyInt(bc.status.sync_info.latest_block_height)'
      :to="{ name: 'block', params: { block: bc.status.sync_info.latest_block_height} }")
    list-item(dt='Latest Block Time' :dd='readableDate(bc.status.latest_block_time)')
    list-item(dt='Latest Block Hash' :dd='bc.status.sync_info.latest_block_hash')

  part(title='Connected Node')
    list-item(dt='Node IP')
      div(slot="dd"): input#node-input(v-model="bc.url")
    list-item(dt='Node Moniker' :dd='bc.status.node_info.moniker')
</template>

<script>
import moment from 'moment'
import num from '../scripts/num'
import { mapGetters } from 'vuex'
import ListItem from './NiListItem'
import Page from './NiPage'
import Part from './NiPart'
export default {
  name: 'page-index',
  components: {
    ListItem,
    Page,
    Part
  },
  computed: {
    ...mapGetters(['bc', 'config', 'peers'])
  },
  data: () => ({
    moment: moment,
    num: num
  }),
  methods: {
    readableDate (ms) {
      return moment(ms).format('YYYY-MM-DD h:mm:ss A')
    },
    toggleBlockchainSelect () {
      this.$store.commit('SET_CONFIG_BLOCKCHAIN_SELECT', !this.config.blockchainSelect)
    }
  }
}
</script>

<style lang='stylus'>
@require '~variables'

input#node-input
  min-width 20rem
  height 2rem
  padding 0 0.5rem
  background transparent
  df()
  #f00
</style
