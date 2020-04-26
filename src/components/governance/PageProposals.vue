<template>
  <TmPage
    data-title="Proposals"
    :managed="true"
    hide-header
    :loading="$apollo.queries.proposals.loading && !loaded"
  >
    <div v-if="loaded" class="button-container">
      <TmBtn
        id="propose-btn"
        value="Create Proposal"
        type="secondary"
        @click.native="onPropose"
      />
      <TmBtn
        v-if="
          connection.network === 'cosmos-hub-mainnet' ||
            connection.network === 'cosmos-hub-testnet'
        "
        id="tutorial-btn"
        class="tutorial-btn"
        value="Want to learn how governance works?"
        type="secondary"
        @click.native="openTutorial()"
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
      fullguide: `https://lunie.io/guides/how-cosmos-governance-works/`,
      background: `lightblue`,
      steps: [
        {
          title: "Intro to governance",
          // Each content array item will be enclosed in a span (newline)
          content: [
            "If you have staked ATOMs on the Cosmos Hub, you can submit your own improvement proposal and vote on what others have proposed."
          ]
        },
        {
          title: "Proposals",
          content: [
            "Proposals are submitted by community members and typically include ideas for how to improve the underlying protocols. Proposals are stored 'on-chain'."
          ]
        },
        {
          title: "Deposit Period",
          content: [
            "Proposals start in the 'Deposit Period' and require a certain number of deposits, before the proposal can be voted on. This is both a spam prevention and signalling mechanism."
          ]
        },
        {
          title: "The Vote!",
          content: [
            "Validators have an obligation to vote and do so on behalf of the people who 'staked' tokens with them. As a token holder, you can vote independently of your validators if you wish."
          ]
        },
        {
          title: "Have more questions?",
          content: [
            "Check out our full governance guide for an in depth explanation of all things governance."
          ]
        }
      ]
    }
  }),
  computed: {
    ...mapState([`connection`]),
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
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1rem 0 1rem;
  max-width: 680px;
  margin: 0 auto;
}

@media screen and (max-width: 667px) {
  .button-container {
    padding-top: 0;
    justify-content: center;
    flex-direction: column-reverse;
  }

  .button-container .tutorial-btn {
    margin-bottom: 0.5rem;
  }
}
</style>
