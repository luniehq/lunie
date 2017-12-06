<template lang="pug">
page(icon="storage" :title="validator.pub_key.data")
  div(slot="menu"): tool-bar
    router-link(to="/validators" exact)
      i.material-icons arrow_back
      .label Back

  part(title="Validator Profile")
    list-item(dt="Total Vote Power" :dd="validator.voting_power"
      :to="{ name: 'validator-power', params: { validator: validatorSlug }}")
    list-item(dt="Vote History" dd="37 Votes"
      :to="{ name: 'validator-votes', params: { validator: validatorSlug }}")
    list-item(dt="Proposals" dd="13"
      :to="{ name: 'validator-proposals', params: { validator: validatorSlug }}")
    list-item(dt="Slashes" dd="6"
      :to="{ name: 'validator-slashes', params: { validator: validatorSlug }}")

  part(title="Staking")
    list-item(dt="Earn Rate" dd="8.1K ATOM / day")
    list-item(dt="Total Earnings" dd="301.8K ATOM")

  part(title="Public Key")
    li-copy(:value="tmpValidator.pub_key")
</template>

<script>
import { mapGetters } from 'vuex'
import LiCopy from 'common/NiLiCopy'
import ListItem from 'common/NiListItem'
import ToolBar from 'common/NiToolBar'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
export default {
  name: 'page-validator-index',
  components: {
    LiCopy,
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
          d => this.urlsafeIp(d.pub_key.data) ===
          this.$route.params.validator)
      } else {
        return this.tmpValidator
      }
    },
    validatorSlug () {
      return this.urlsafeIp(this.validator.pub_key.data)
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
