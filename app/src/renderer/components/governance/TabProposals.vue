<template>
  <tm-data-connecting v-if="!proposals.loaded && !connected" />
  <tm-data-loading v-else-if="!proposals.loaded && proposals.loading" />
  <tm-data-empty
    v-else-if="Object.keys(proposals.proposals).length === 0"
    title="No Governance Proposals"
    subtitle="There are currently no governance proposals on the Cosmos Hub. Submit a new one by clicking the 'Create Proposal' button above."
  />
  <table-proposals
    v-else
    :proposals="proposals.proposals"
    :loading="proposals.loading"
  />
</template>

<script>
import TableProposals from "./TableProposals"
import TmDataConnecting from "common/TmDataConnecting"
import { TmDataLoading, TmDataEmpty } from "@tendermint/ui"
import { mapGetters } from "vuex"
export default {
  name: `tab-proposals`,
  components: {
    TableProposals,
    TmDataConnecting,
    TmDataLoading,
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
