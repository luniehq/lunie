<template>
  <TmPage
    data-title="Proposals"
    :managed="true"
    :loading="$apollo.queries.proposals.loading"
    :loaded="!$apollo.queries.proposals.loading"
    :error="$apollo.queries.proposals.error"
    :data-empty="proposals.length === 0"
    hide-header
  >
    <TmDataEmpty
      slot="no-data"
      title="No Governance Proposals"
      subtitle="There are currently no governance proposals to display.
    Click the 'Create Proposal' button to submit a proposal."
      icon="gavel"
    />
    <template slot="managed-body">
      <div class="button-container">
        <TmBtn
          id="propose-btn"
          value="Create Proposal"
          type="secondary"
          @click.native="onPropose"
        />
      </div>
      <TableProposals
        :proposals="proposals"
        :loading="$apollo.queries.proposals.loading"
      />
    </template>

    <ModalPropose ref="modalPropose" :denom="depositDenom" />
  </TmPage>
</template>

<script>
import ModalPropose from "src/ActionModal/components/ModalPropose"
import TableProposals from "governance/TableProposals"
import TmBtn from "common/TmBtn"
import TmPage from "common/TmPage"
import TmDataEmpty from "common/TmDataEmpty"
import { mapGetters } from "vuex"
import { allProposals, allProposalsUpdate } from "src/gql"

export default {
  name: `tab-proposals`,
  components: {
    ModalPropose,
    TableProposals,
    TmDataEmpty,
    TmBtn,
    TmPage
  },
  data: () => ({
    proposals: []
  }),
  computed: {
    ...mapGetters([`depositDenom`])
  },
  methods: {
    onPropose() {
      this.$refs.modalPropose.open()
    }
  },
  apollo: {
    proposals: {
      query: allProposals,
      update: allProposalsUpdate
    }
  }
}
</script>
<style scoped>
.button-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding: 1rem 1rem 0 1rem;
  max-width: 680px;
  margin: 0 auto;
}

@media screen and (max-width: 667px) {
  .button-container {
    justify-content: center;
  }

  .button-container button {
    width: 50%;
  }
}
</style>
