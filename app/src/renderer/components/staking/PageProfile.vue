<template lang='pug'>
page(title='Your Profile')
  tool-bar
    a(@click.native='signOut') Sign Out
  part(title='Details')
    list-item(dt='Public Key' dd='user.pubkey')
    list-item(dt='Atoms Key' dd='user.atoms')
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import ListItem from '../common/NiListItem'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
export default {
  name: 'page-profile',
  components: {
    Btn,
    ListItem,
    Page,
    Part
  },
  computed: {
    ...mapGetters(['user'])
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
