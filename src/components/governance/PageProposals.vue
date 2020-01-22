<template>
  <TmPage
    data-title="Proposals"
    :managed="true"
    hide-header
    :loading="$apollo.queries.proposals.loading && !loaded"
  >
    <div v-if="loaded" class="button-container">
      <TmBtn
        v-if="
          connection.network === 'cosmos-hub-mainnet' ||
            connection.network === 'cosmos-hub-testnet'
        "
        id="tutorial-btn"
        class="tutorial-btn"
        value="How Cosmos Governance Works"
        type="secondary"
        @click.native="openTutorial()"
      />
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
            There are currently no governance proposals to display. Click the
            'Create Proposal' button to submit the first network proposal!
          </div>
        </TmDataMsg>
      </div>
    </div>
    <TableProposals v-else :proposals="proposals" />
    <ModalTutorial
      v-if="
        showTutorial &&
          session.experimentalMode &&
          (connection.network === 'cosmos-hub-mainnet' ||
            connection.network === 'cosmos-hub-testnet')
      "
      :steps="cosmosGovernanceTutorial.steps"
      :fullguide="cosmosGovernanceTutorial.fullguide"
      :background="cosmosGovernanceTutorial.background"
      :close="hideTutorial"
    />
  </TmPage>
</template>

<script>
import ModalPropose from "src/ActionModal/components/ModalPropose"
import TableProposals from "governance/TableProposals"
import TmPage from "common/TmPage"
import TmBtn from "common/TmBtn"
import TmDataMsg from "common/TmDataMsg"
import { mapGetters, mapState } from "vuex"
import { GovernanceParameters } from "src/gql"
import gql from "graphql-tag"
import ModalTutorial from "common/ModalTutorial"

export default {
  name: `page-proposals`,
  components: {
    ModalPropose,
    TableProposals,
    TmDataMsg,
    TmBtn,
    TmPage,
    ModalTutorial
  },
  data: () => ({
    proposals: [],
    parameters: {
      depositDenom: "xxx"
    },
    loaded: false,
    showTutorial: false,
    cosmosGovernanceTutorial: {
      fullguide: `http://lunie.io`,
      background: `lightblue`,
      steps: [
        {
          title: "How Cosmos Governance Works",
          // Each content array item will be enclosed in a span (newline)
          content: [
            "If you are staking your ATOM on Cosmos, you should also consider participating in it’s on-chain governance. Here we’ll show you how to explore some of the unique governance features that Lunie gives you access to."
          ]
        },
        {
          title: "Do you have something at stake?",
          content: [
            "If you have tokens staked on this network, you’re eligible to participate in the network’s governance system. If you don’t have tokens yet, check out the “How to get tokens” guide in Lunie website"
          ]
        },
        {
          title: "Proposals",
          content: [
            "In the Proposals view you will see all past and present proposals as well as the “Create Proposal” button to create your own. If you believe in this network and what it stands for, you should participate!!"
          ]
        },
        {
          title: "Deposit Period",
          content: [
            "If a proposal is in the “Deposit Period” you will be able to contribute ATOM to the proposal if you wish to see it move to a voting stage."
          ]
        },
        {
          title: "Vote!",
          content: [
            "If a proposal is in the voting stage you can vote on whether you support it or not."
          ]
        }
      ]
    }
  }),
  computed: {
    ...mapState([`session`, `connection`]),
    ...mapGetters([`network`])
  },
  methods: {
    onPropose() {
      this.$refs.modalPropose.open()
    },
    afterPropose() {
      this.$apollo.queries.proposals.refetch()
    },
    openTutorial() {
      this.showTutorial = true
    },
    hideTutorial() {
      this.showTutorial = false
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
        /* istanbul ignore next */
        return {
          networkId: this.network
        }
      },
      update(data) {
        /* istanbul ignore next */
        this.loaded = true
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
    },
    $subscribe: {
      blockAdded: {
        variables() {
          /* istanbul ignore next */
          return {
            networkId: this.network
          }
        },
        query() {
          /* istanbul ignore next */
          return gql`
            subscription($networkId: String!) {
              blockAdded(networkId: $networkId) {
                height
              }
            }
          `
        },
        result() {
          /* istanbul ignore next */
          this.$apollo.queries.proposals.refetch()
        }
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

.tutorial-btn {
  margin-right: 1rem;
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
