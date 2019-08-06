<template>
  <TmPage
    data-title="Proposals"
    hide-header
    :managed="true"
    :loading="proposals.loading"
    :loaded="proposals.loaded"
    :error="proposals.error"
    :data-empty="proposals.length === 0"
  >
    <TmDataEmpty
      slot="no-data"
      title="No Governance Proposals"
      subtitle="There are currently no governance proposals to display.
    Click the 'Create Proposal' button to submit a proposal."
      icon="gavel"
    />
    <template slot="managed-body">
      <TableProposals
        :proposals="proposals.proposals"
        :loading="proposals.loading"
      />
    </template>
  </TmPage>
</template>

<script>
import TableProposals from "./TableProposals"
import TmPage from "common/TmPage"
import TmDataEmpty from "common/TmDataEmpty"
import { mapGetters } from "vuex"
export default {
  name: `tab-proposals`,
  components: {
    TableProposals,
    TmDataEmpty,
    TmPage
  },
  computed: {
    ...mapGetters([`proposals`, `connected`])
  },
  mounted() {
    this.$store.dispatch(`getProposals`)
  }
}
</script>
