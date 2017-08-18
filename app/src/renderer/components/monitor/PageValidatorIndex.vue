<template lang="pug">
page(icon="storage" :title="validator.node_info.moniker")
  tool-bar
    router-link(to="/validators" exact): i.material-icons arrow_back
    anchor-copy(:value="tmpValidator.pub_key" icon="content_copy")

  part(title="Validator Profile")
    list-item(dt="Total Vote Power" dd="4.2M ATOM"
      :to="{ name: 'validator-power', params: { validator: validatorSlug }}")
    list-item(dt="Vote History" dd="37 Votes"
      :to="{ name: 'validator-votes', params: { validator: validatorSlug }}")
    list-item(dt="Proposals" dd="13"
      :to="{ name: 'validator-proposals', params: { validator: validatorSlug }}")
    list-item(dt="Slashes" dd="6"
      :to="{ name: 'validator-slashes', params: { validator: validatorSlug }}")

  part(title="Staking")
    list-item(dt="Delegators" dd="137"
      :to="{ name: 'validator-delegators', params: { validator: validatorSlug }}")
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
  name: 'page-validator-index',
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
    },
    validatorSlug () {
      return this.urlsafeIp(this.validator.node_info.moniker)
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
  },
  mounted () {
    console.log(this.$route.params)
  }
}
</script>
