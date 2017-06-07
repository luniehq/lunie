<template>
  <div class="page page-profile">
    <page-header title="Your Profile"></page-header>
    <div class="scrollable-area">
      <key-values>
        <key-value>
          <div slot="key">Public Key</div>
          <div slot="value">{{ user.pubkey }}</div>
        </key-value>
        <key-value>
          <div slot="key">Atoms</div>
          <div slot="value">{{ user.atoms }}</div>
        </key-value>
        <key-value>
          <div slot="key">Invite Tokens</div>
          <div slot="value">{{ user.invitations }}</div>
        </key-value>
      </key-values>
    </div>
  </div>
</template>

<script>
import casual from 'casual'
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
    user () {
      let value = {
        pubkey: casual.uuid,
        atoms: casual.integer(1000, 1000000),
        invitations: casual.integer(1, 10)
      }
      return value
    }
  }
}
</script>
