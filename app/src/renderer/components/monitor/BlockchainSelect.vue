<template lang='pug'>
field(type='select' :options='blockchainOptions' v-model='blockchainName')
</template>

<script>
import Field from '@nylira/vue-field'
import { mapGetters } from 'vuex'
export default {
  name: 'blockchain-select',
  components: {
    Field
  },
  computed: {
    ...mapGetters(['blockchain'])
  },
  data: () => ({
    blockchainName: '',
    blockchainOptions: [
      {
        key: 'mercury',
        value: 'mercury'
      },
      {
        key: 'hermes',
        value: 'hermes'
      },
      {
        key: 'venus',
        value: 'venus'
      }
    ]
  }),
  mounted () {
    let blockchainName = this.blockchain.status.node_info.network
    if (this.blockchainName !== blockchainName) {
      this.blockchainName = this.blockchain.status.node_info.network
    }
  },
  watch: {
    'blockchainName' (val, oldVal) {
      if (oldVal !== '') {
        console.log('blockchainName ->', val, oldVal)
        this.$store.commit('notify', {
          title: 'Blockchain Changed', body: `Now monitoring the '${val}' blockchain...`})
        this.$store.commit('setValidatorBlockchainName', val)
        this.$store.commit('setBlockchainName', val)
      }
    }
  }
}
</script>
