<template>
  <tm-data-connecting v-if="proposals.loading && !connected" />
  <tm-data-loading v-else-if="loading" />
  <tm-data-empty v-else-if="Object.keys(proposals.proposals).length === 0" />
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
