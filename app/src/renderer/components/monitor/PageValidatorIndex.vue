<template lang="pug">
page(title="Validator Profile")
  div(slot="menu"): tool-bar
    router-link(to="/validators" exact)
      i.material-icons arrow_back
      .label Back
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
