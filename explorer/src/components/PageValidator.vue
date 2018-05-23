<template lang="pug">
page(:title="`Node: ${getIp(validator)}`")
  tool-bar
    router-link(to="/validators" exact): i.material-icons arrow_back
    anchor-copy(:value="validator.node_info.id" icon="content_copy")

  part(title='ID')
    list-item(dt="Moniker" :dd="validator.node_info.moniker")
    list-item(dt="Listen Address" :dd="validator.node_info.listen_addr")
    list-item(dt="Start Date" :dd="validator.connection_status && readableDate(validator.connection_status.SendMonitor.Start)")

  part(title='Pub Key')
    list-item(dt="Value" :dd="validator.node_info.id")

  part(title='Network')
    list-item(dt="Network" :dd="validator.node_info.network")
    list-item(dt="Version" :dd="validator.node_info.version")
    list-item(dt="Channels" :dd="validator.node_info.channels")

  part(title='Profile')
    list-item(dt="Total Vote Power" :dd="validator.validator ? validator.validator.voting_power : 0 + ' ATOM'" to="/vote-power")
    //list-item(dt="Solo Vote Power" dd="1M ATOM (19%)")
    //list-item(dt="Delg. Vote Power" dd="3.2M ATOM (81%)")
    //list-item(dt="Vote History" dd="37 Votes" to="/votes")
    //list-item(dt="Proposals" dd="13" to="/proposals")
    //list-item(dt="Slashes" dd="6" to="/slashes")

  //part(title='Staking')
    list-item(dt="Delegators" dd="" to="/delegators")
    list-item(dt="Earn Rate" dd="8.1K ATOM / day'")
    list-item(dt="Total Earnings" dd="301.8K ATOM")
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import ListItem from './NiListItem'
import ToolBar from './NiToolBar'
import Page from './NiPage'
import Part from './NiPart'
import AnchorCopy from './AnchorCopy'
export default {
  name: 'page-validator',
  components: {
    AnchorCopy,
    ListItem,
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(['peers']),
    validator () {
      if (this.peers && this.peers.length > 0) {
        return this.peers.find(
          v =>
            this.urlsafeIp(v.node_info.listen_addr) ===
            this.$route.params.validator + ':46656'
        )
      } else {
        return this.tmpValidator
      }
    }
  },
  data: () => ({
    tmpValidator: {
      node_info: {
        moniker: 'Loading...',
        pub_key: 'todoreplacemewithvalidatorpubkey'
      }
    }
  }),
  methods: {
    urlsafeIp (ip) {
      return ip.split('.').join('-')
    },
    getIp (validator) {
      return validator.node_info.listen_addr && validator.node_info.listen_addr.split(':')[0]
    },
    readableDate (ms) {
      return moment(ms).format('YYYY-MM-DD h:mm:ss A')
    }
  },
  mounted () {
    // setInterval(console.log(this.validator), 1000)
  }
}
</script>
