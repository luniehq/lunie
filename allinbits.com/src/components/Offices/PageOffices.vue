<template>
  <page-split class="PageOffices">
    <page-header
      :title="metadata.title"
      :subtitle="metadata.desc"
      type="split"
      slot="header">
    </page-header>
    <card-office :offices="allOffices">
    </card-office>
  </page-split>
</template>

<script>
  import { mapGetters } from 'vuex'
  import CardOffice from './CardOffice'
  import NiSection from '../NiSection'
  import PageHeader from '@nylira/vue-page-header'
  import PageSplit from '@nylira/vue-page-split'

  export default {
    name: 'PageOffices',
    components: {
      NiSection,
      PageHeader,
      PageSplit,
      CardOffice
    },
    computed: {
      ...mapGetters(['allOffices'])
    },
    data () {
      return {
        metadata: {
          title: 'Offices',
          desc: 'All In Bits, Inc. has offices in San Francisco, Toronto, and Berlin.'
        }
      }
    },
    head: {
      title () {
        return {
          inner: this.metadata.title,
          separator: '-',
          complement: 'All In Bits, Inc.'
        }
      }
    }
  }
</script>

