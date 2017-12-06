<template lang="pug">
page(title="Profile: CosmosUser01")
  div(slot="menu"): tool-bar
    a(@click="signOut")
      i.material-icons exit_to_app
      .label Sign Out
    a(@click="openSettings")
      i.material-icons settings
      .label Settings

  part(title='Profile')
    list-item(dt="Total Vote Power" dd="TODO: USER.ATOMS")
    list-item(dt="Solo Vote Power" dd="31.2M ATOM (19%)")
    list-item(dt="Delg. Vote Power" dd="33.8M ATOM (81%)")
    list-item(dt="Vote History" dd="37 Votes")
    list-item(dt="Proposals" dd="13")
    list-item(dt="Slashes" dd="6")

  part(title='Staking')
    list-item(dt="Earn Rate" dd="8.1K ATOM / day")
    list-item(dt="Total Earnings" dd="301.8K ATOM")
</template>

<script>
import ListItem from 'common/NiListItem'
import ToolBar from 'common/NiToolBar'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
export default {
  name: 'page-validator',
  components: {
    ListItem,
    Page,
    Part,
    ToolBar
  },
  created () {
    // if (!this.user.signedIn) { this.$store.commit('notifyAuthRequired') }
  },
  methods: {
    signOut () {
      this.$store.commit('signOut')
      this.$store.commit('notifySignOut')
    },
    openSettings () { window.alert('TODO: open user settings') }
  }
}
</script>
