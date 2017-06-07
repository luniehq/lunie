<template>
  <div class="page-candidate">
    <page-header :title="candidate.id">
      <btn theme="cosmos" type="link" to="/" icon="angle-left" value="Back"></btn>
      <btn theme="cosmos" icon="check" value="Stake Atoms"></btn>
    </page-header>
    <div class="scrollable-area">
      <key-values>
        <key-value>
          <div slot="key">Atoms</div>
          <div slot="value">{{ candidate.atoms }}</div>
        </key-value>
        <key-value>
          <div slot="key">Delegators</div>
          <div slot="value">{{ candidate.delegators }}</div>
        </key-value>
      </key-values>
      <key-values>
        <key-value>
          <div slot="key">Description</div>
          <div slot="value">{{ candidate.description }}</div>
        </key-value>
        <key-value>
          <div slot="key">URL</div>
          <div slot="value">{{ candidate.url }}</div>
        </key-value>
      </key-values>
      <key-values>
        <key-value>
          <div slot="key">Start Date</div>
          <div slot="value">{{ candidate.startDate }}</div>
        </key-value>
        <key-value>
          <div slot="key">Commission</div>
          <div slot="value">{{ candidate.commission * 100 }}%</div>
        </key-value>
      </key-values>
      <key-values>
        <key-value>
          <div slot="key">Slashes</div>
          <div slot="value">{{ candidate.slashes.length }}</div>
        </key-value>
      </key-values>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import PageHeader from './PageHeader'
import KeyValue from './NiKeyValue'
import KeyValues from './NiKeyValues'

export default {
  name: 'page-candidate',
  components: {
    Btn,
    PageHeader,
    KeyValue,
    KeyValues
  },
  computed: {
    ...mapGetters(['candidates']),
    candidate () {
      let value = {}
      if (this.candidates) {
        value = this.candidates.find(v => v.id === this.$route.params.candidate)
      }
      return value
    }
  },
  data: () => ({
  })
}
</script>
