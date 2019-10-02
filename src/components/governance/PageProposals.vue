<template>
  <PageContainer
    data-title="Proposals"
    :managed="true"
    :loading="$apollo.queries.proposals.loading"
    :loaded="!$apollo.queries.proposals.loading"
    :error="$apollo.queries.proposals.error"
    hide-header
  >
    <template slot="no-data">
      <!-- duplicated, I have no proper way of refactoring this -->
      <div class="button-container">
        <TmBtn
          id="propose-btn"
          value="Create Proposal"
          type="secondary"
          @click.native="onPropose"
        />
      </div>
      <TmDataMsg
        title="No Governance Proposals"
        subtitle="There are currently no governance proposals to display.
    Click the 'Create Proposal' button to submit a proposal."
        icon="gavel"
      />
    </template>
    <template slot="managed-body">
      <!-- duplicated, I have no proper way of refactoring this -->
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
  </PageContainer>
</template>

<script>
import ModalPropose from "src/ActionModal/components/ModalPropose"
import TableProposals from "governance/TableProposals"
import TmBtn from "common/TmBtn"
import PageContainer from "common/PageContainer"
import TmDataMsg from "common/TmDataMsg"
import { mapState, mapGetters } from "vuex"
import { ProposalList, proposalListResult } from "src/gql"

export default {
  name: `page-proposals`,
  components: {
    ModalPropose,
    TableProposals,
    TmDataMsg,
    TmBtn,
    PageContainer
  },
  data: () => ({
    proposals: []
  }),
  computed: {
    ...mapState({ network: state => state.connection.network }),
    ...mapGetters([`depositDenom`])
  },
  mounted() {
    // this.$store.dispatch(`getProposals`)
  },
  methods: {
    onPropose() {
      this.$refs.modalPropose.open()
    }
  },
  apollo: {
    proposals: {
      query() {
        /* istanbul ignore next */
        return ProposalList(this.network)
      },
      update(data) {
        /* istanbul ignore next */
        return proposalListResult(this.network)(data)
      }
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
