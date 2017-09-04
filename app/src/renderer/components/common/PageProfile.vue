<template lang="pug">
page(title="Your Profile")
  tool-bar
    anchor-copy(:value="user.pubkey" icon="content_copy")
    a(@click.native='signOut') Sign Out

  part(title='Profile')
    list-item(dt="Total Vote Power" :dd="user.atoms" to="/vote-power")
    list-item(dt="Solo Vote Power" dd="31.2M ATOM (19%)")
    list-item(dt="Delg. Vote Power" dd="33.8M ATOM (81%)")
    list-item(dt="Vote History" dd="37 Votes" to="/votes")
    list-item(dt="Proposals" dd="13" to="/proposals")
    list-item(dt="Slashes" dd="6" to="/slashes")

  part(title='Staking')
    list-item(dt="Delegators" dd="137" to="/delegators")
    list-item(dt="Earn Rate" dd="8.1K ATOM / day")
    list-item(dt="Total Earnings" dd="301.8K ATOM")
</template>

<script>
import ListItem from './NiListItem'
import ToolBar from './NiToolBar'
import Page from './NiPage'
import Part from './NiPart'
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
  created () {
    if (!this.user.signedIn) { this.$store.commit('notifyAuthRequired') }
  },
  methods: {
    signOut () {
      this.$store.commit('signOut')
      this.$store.commit('notifySignOut')
    }
  }
}
</script>
