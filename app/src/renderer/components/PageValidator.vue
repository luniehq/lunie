<template>
  <div class="page-validator">
    <page-header :title="validator.id">
      <btn theme="cosmos" type="link" to="/" icon="angle-left" value="Back"></btn>
      <btn theme="cosmos" icon="check" value="Stake Atoms"></btn>
    </page-header>
    <div class="scrollable-area">
      <key-values>
        <key-value>
          <div slot="key">Atoms</div>
          <div slot="value">{{ validator.atoms }}</div>
        </key-value>
        <key-value>
          <div slot="key">Delegators</div>
          <div slot="value">{{ validator.delegators }}</div>
        </key-value>
      </key-values>
      <key-values>
        <key-value>
          <div slot="key">Description</div>
          <div slot="value">{{ validator.description }}</div>
        </key-value>
        <key-value>
          <div slot="key">URL</div>
          <div slot="value">{{ validator.url }}</div>
        </key-value>
      </key-values>
      <key-values>
        <key-value>
          <div slot="key">Start Date</div>
          <div slot="value">{{ validator.startDate }}</div>
        </key-value>
        <key-value>
          <div slot="key">Commission</div>
          <div slot="value">{{ validator.commission * 100 }}%</div>
        </key-value>
      </key-values>
      <key-values>
        <key-value>
          <div slot="key">Slashes</div>
          <div slot="value">{{ validator.slashes.length }}</div>
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
  name: 'page-validator',
  components: {
    Btn,
    PageHeader,
    KeyValue,
    KeyValues
  },
  computed: {
    ...mapGetters(['validators']),
    validator () {
      let value = {}
      if (this.validators) {
        value = this.validators.find(v => v.id === this.$route.params.validator)
      }
      return value
    }
  },
  data: () => ({
  })
}
</script>
