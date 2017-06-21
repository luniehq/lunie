<template lang='pug'>
  .page.page-profile
    page-header
      div(slot='title') Your Profile
      btn(theme='cosmos' icon='sign-out' value='Sign Out' @click.native='signOut')
    key-values
      key-value
        div(slot='key') Public Key
        div(slot='value') {{ user.pubkey }}
      key-value
        div(slot='key') Atoms
        div(slot='value') {{ user.atoms }}
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import PageHeader from './PageHeader'
import KeyValue from './NiKeyValue'
import KeyValues from './NiKeyValues'
export default {
  name: 'page-profile',
  components: {
    Btn,
    PageHeader,
    KeyValue,
    KeyValues
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
