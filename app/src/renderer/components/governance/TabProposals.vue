<template>
  <data-view
    :loaded="proposals.loaded"
    :loading="proposals.loading"
    :error="proposals.error"
    :data-empty="Object.keys(proposals.proposals).length === 0"
  >
    <tm-data-empty
      slot="no-data"
      title="No Governance Proposals"
      subtitle="There are currently no governance proposals to display.
      Click the 'Create Proposal' button to submit a proposal."
      icon="gavel"
    />
    <table-proposals
      slot="data"
      :proposals="proposals.proposals"
    />
  </data-view>
</template>

<script>
import TableProposals from "./TableProposals"
import TmDataEmpty from "common/TmDataEmpty"
import DataView from "common/DataView"
import { mapGetters } from "vuex"
export default {
  name: `tab-proposals`,
  components: {
    TableProposals,
    DataView,
    TmDataEmpty
  },
  computed: {
    ...mapGetters([`proposals`, `connected`])
  },
  mounted() {
    this.$store.dispatch(`getProposals`)
  }
}
</script>
