<template lang="pug">
  .page.page-profile
    page-header(title="Your Profile")
    key-values
      key-value
        div(slot="key") Public Key
        div(slot="value") {{ user.pubkey }}
      key-value
        div(slot="key") Atoms/div
        div(slot="value") {{ user.atoms }}
      key-value
        div(slot="key") Invite Tokens
        div(slot="value") {{ user.invitations }}
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
  }
}
</script>
