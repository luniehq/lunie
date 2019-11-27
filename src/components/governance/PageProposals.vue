<template>
  <TmPage
    data-title="Proposals"
    :managed="false">
    <div class="button-container">
      <TmBtn
        id="propose-btn"
        value="Create Proposal"
        type="secondary"
        @click.native="onPropose"
      />
    </div>
    <ModalPropose
      ref="modalPropose"
      :denom="parameters.depositDenom"
      @success="() => afterPropose()"
    />
    <div v-if="!$apollo.loading && proposals.length === 0">     
      <div>
        <TmDataMsg icon="gavel">
          <div slot="title">
            No Governance Proposals
          </div>
          <div slot="subtitle">
            There are currently no governance proposals to display.
            Click the 'Create Proposal' button to submit the first network proposal!
          </div>
        </TmDataMsg>
      </div>
    </div>
    <div v-else-if="!$apollo.loading && proposals.length > 0">
      <TmDataLoading v-if="$apollo.loading" />
      <TableProposals v-else :proposals="proposals" />
    </div>
  </TmPage>
</template>

<script>
import ModalPropose from "src/ActionModal/components/ModalPropose"
import TableProposals from "governance/TableProposals"
import TmPage from "common/TmPage"
import TmBtn from "common/TmBtn"
import TmDataMsg from "common/TmDataMsg"
import TmDataLoading from "common/TmDataLoading"
import { mapGetters } from "vuex"
import { GovernanceParameters } from "src/gql"
import gql from "graphql-tag"

export default {
  name: `page-proposals`,
  components: {
    ModalPropose,
    TableProposals,
    TmDataMsg,
    TmDataLoading,
    TmBtn,
    TmPage
  },
  data: () => ({
    proposals: [],
    parameters: {
      depositDenom: "xxx"
    }
  }),
  computed: {
    ...mapGetters([`network`])
  },
  methods: {
    onPropose() {
      this.$refs.modalPropose.open()
    },
    afterPropose() {
      this.$apollo.queries.proposals.refetch()
      this.$store.commit("invalidateCache", [`overview`, `transactions`])
    }
  },
  apollo: {
    proposals: {
      query() {
        /* istanbul ignore next */
        return gql`
          query proposals($networkId: String!) {
            proposals(networkId: $networkId) {
              id
              type
              title
              description
              status
            }
          }
        `
      },
      variables() {
        return {
          networkId: this.network
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.proposals
      }
    },
    parameters: {
      query() {
        /* istanbul ignore next */
        return GovernanceParameters(this.network)
      },
      update(data) {
        /* istanbul ignore next */
        return data.governanceParameters
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
