<template lang="pug">
page(:title="'Validator: ' + validator.node_info.moniker")
  tool-bar
    router-link(to="/validators" exact): i.material-icons arrow_back
    anchor-copy(:value="tmpValidator.pub_key" icon="content_copy")

  part(title='Profile')
    list-item(dt="Total Vote Power" dd="4.2M ATOM" to="/vote-power")
    list-item(dt="Solo Vote Power" dd="1M ATOM (19%)")
    list-item(dt="Delg. Vote Power" dd="3.2M ATOM (81%)")
    list-item(dt="Vote History" dd="37 Votes" to="/votes")
    list-item(dt="Proposals" dd="13" to="/proposals")
    list-item(dt="Slashes" dd="6" to="/slashes")

  part(title='Staking')
    list-item(dt="Delegators" dd="137" to="/delegators")
    list-item(dt="Earn Rate" dd="8.1K ATOM / day")
    list-item(dt="Total Earnings" dd="301.8K ATOM")
</template>

<script>
import { mapGetters } from 'vuex'
import ListItem from '../common/NiListItem'
import ToolBar from '../common/NiToolBar'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
import AnchorCopy from '../common/AnchorCopy'
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
    ...mapGetters(['validators']),
    validator () {
      if (this.validators && this.validators.length > 0) {
        return this.validators.find(
          d => this.urlsafeIp(d.node_info.moniker) ===
            this.$route.params.validator)
      } else {
        return this.tmpValidator
      }
    }
  },
  data: () => ({
    tmpValidator: {
      node_info: {
        moniker: 'Loading...'
      },
      pub_key: 'todoreplacemewithvalidatorpubkey'
    }
  }),
  methods: {
    urlsafeIp (ip) {
      return ip.split('.').join('-')
    }
  }
}
</script>
