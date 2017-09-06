<template lang="pug">
page(icon="computer" :title="delegator.id")
  tool-bar
    router-link(to="/delegators" exact): i.material-icons arrow_back
    anchor-copy(:value="delegator.pub_key" icon="content_copy")

  part(title='Delegator Profile')
    list-item(dt="Vote Power" dd="12.2K ATOM" to="/vote-power")
    list-item(dt="Vote History" dd="35 Votes" to="/votes")
    list-item(dt="Proposals" dd="5" to="/proposals")
    list-item(dt="Slashes" dd="2" to="/slashes")

  part(title='Staking')
    list-item(dt="Validators" dd="3" to="/validators")
    list-item(dt="Earn Rate" dd="520.1 ATOM/Day")
    list-item(dt="Total Earnings" dd="2,428 ATOM")
</template>

<script>
import { mapGetters } from 'vuex'
import AnchorCopy from '../common/AnchorCopy'
import ListItem from '../common/NiListItem'
import ToolBar from '../common/NiToolBar'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
export default {
  name: 'page-delegator',
  components: {
    AnchorCopy,
    ListItem,
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(['delegators']),
    delegator () {
      if (this.delegators) {
        return this.delegators.find(d => d.id === this.$route.params.delegator)
      } else {
        return this.tmpDelegator
      }
    }
  },
  data: () => ({
    tmpDelegator: {
      id: 'Loading',
      pub_key: '',
      info: '',
      type: 'user',
      created_at: 0,
      online_at: 0
    }
  })
}
</script>
