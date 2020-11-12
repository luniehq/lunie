<template>
  <TmPage
    data-title="Proposals"
    :loading="
      $apollo.queries.proposals.loading ||
      !proposalsLoaded ||
      !governanceOverviewLoaded
    "
    class="proposals"
  >
    <div class="overview-header">
      <div v-if="governanceOverviewLoaded" class="overview-top">
        <h1>Governance Overview</h1>
        <div>
          <TmBtn
            v-if="currentNetwork.network_type === `cosmos`"
            id="propose-btn"
            value="Create Proposal"
            type="secondary"
            @click.native="onPropose"
          />
          <TmBtn
            v-if="currentNetwork.slug === `cosmos-hub`"
            id="tutorial-btn"
            class="tutorial-btn"
            value="Want to learn how governance works?"
            type="secondary"
            @click.native="openTutorial()"
          />
        </div>
      </div>

      <div class="data-row">
        <div>
          <h4>{{ fundTitle }}</h4>
          <p>
            {{ governanceOverview.treasurySize | prettyInt }} {{ stakingDenom }}
          </p>
        </div>
        <div>
          <h4>Total Staked</h4>
          <p>
            {{ governanceOverview.totalStakedAssets | prettyInt }}
            {{ stakingDenom }}
          </p>
        </div>
        <div v-if="governanceOverview.totalVoters">
          <h4>Total Voters</h4>
          <p>{{ governanceOverview.totalVoters | prettyInt }}</p>
        </div>
      </div>
    </div>

    <!-- v-ifing ModalPropose until we enable the "propose" action in Substrate -->
    <ModalPropose
      v-if="parameters && Object.keys(parameters).length > 0"
      ref="modalPropose"
      :denom="parameters.depositDenom || currentNetwork.stakingDenom"
      @success="() => afterPropose()"
    />

    <div v-if="!$apollo.loading && proposals.length === 0">
      <div>
        <TmDataMsg icon="gavel">
          <div slot="title">No Governance Proposals</div>
          <div slot="subtitle">
            There are currently no governance proposals to display.
            {{
              currentNetwork.network_type === `polkadot`
                ? ``
                : `Click the
            'Create Proposal' button to submit the first network proposal!`
            }}
          </div>
        </TmDataMsg>
      </div>
    </div>

    <template v-else>
      <h4>Proposals</h4>
      <LiProposal
        v-for="proposal in proposals"
        :key="proposal.id"
        :proposal="proposal"
      />
    </template>

    <ParticipantList
      v-if="
        governanceOverview.topVoters && governanceOverview.topVoters.length > 0
      "
      :title="participantListTitle"
      :participants="governanceOverview.topVoters"
    />

    <ProposalDescription
      v-if="governanceOverview.links && governanceOverview.links.length > 0"
      :supporting-links="governanceOverview.links"
    />

    <ModalTutorial
      v-if="showTutorial && currentNetwork.network_type === `cosmos`"
      :steps="cosmosGovernanceTutorial.steps"
      :fullguide="cosmosGovernanceTutorial.fullguide"
      :background="cosmosGovernanceTutorial.background"
      :close="hideTutorial"
    />
  </TmPage>
</template>

<script>
import ModalPropose from "src/ActionModal/components/ModalPropose"
import LiProposal from "governance/LiProposal"
import TmPage from "common/TmPage"
import TmBtn from "common/TmBtn"
import TmDataMsg from "common/TmDataMsg"
import ParticipantList from "governance/ParticipantList"
import ProposalDescription from "governance/ProposalDescription"
import { mapGetters, mapState } from "vuex"
import { GovernanceParameters } from "src/gql"
import gql from "graphql-tag"
import ModalTutorial from "common/ModalTutorial"
import { prettyInt } from "src/scripts/num"

export default {
  name: `page-proposals`,
  components: {
    ModalPropose,
    LiProposal,
    TmDataMsg,
    TmBtn,
    TmPage,
    ModalTutorial,
    ProposalDescription,
    ParticipantList,
  },
  filters: {
    prettyInt,
  },
  data: () => ({
    proposals: [],
    governanceOverview: {},
    parameters: {
      depositDenom: "",
    },
    proposalsLoaded: false,
    governanceOverviewLoaded: false,
    showTutorial: false,
    cosmosGovernanceTutorial: {
      fullguide: `https://lunie.io/guides/how-cosmos-governance-works/`,
      background: `lightblue`,
      steps: [
        {
          title: "Intro to governance",
          // Each content array item will be enclosed in a span (newline)
          content: [
            "If you have staked ATOMs on the Cosmos Hub, you can submit your own improvement proposal and vote on what others have proposed.",
          ],
        },
        {
          title: "Proposals",
          content: [
            "Proposals are submitted by community members and typically include ideas for how to improve the underlying protocols. Proposals are stored 'on-chain'.",
          ],
        },
        {
          title: "Deposit Period",
          content: [
            "Proposals start in the 'Deposit Period' and require a certain number of deposits, before the proposal can be voted on. This is both a spam prevention and signalling mechanism.",
          ],
        },
        {
          title: "The Vote!",
          content: [
            "Validators have an obligation to vote and do so on behalf of the people who 'staked' tokens with them. As a token holder, you can vote independently of your validators if you wish.",
          ],
        },
        {
          title: "Have more questions?",
          content: [
            "Check out our full governance guide for an in depth explanation of all things governance.",
          ],
        },
      ],
    },
  }),
  computed: {
    ...mapState([`connection`]),
    ...mapGetters([`currentNetwork`, `stakingDenom`]),
    fundTitle() {
      return this.currentNetwork.network_type === `polkadot`
        ? `Treasury`
        : `Community Pool`
    },
    participantListTitle() {
      return this.currentNetwork.network_type === `polkadot`
        ? `Council Members`
        : `Top Voters`
    },
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
    },
  },
  apollo: {
    proposals: {
      /* istanbul ignore next */
      query() {
        return gql`
          query proposals($networkId: String!) {
            proposals(networkId: $networkId) {
              id
              proposalId
              type
              title
              status
              creationTime
            }
          }
        `
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.currentNetwork.id,
        }
      },
      /* istanbul ignore next */
      update(data) {
        this.proposalsLoaded = true
        return data.proposals
      },
    },
    governanceOverview: {
      /* istanbul ignore next */
      query() {
        return gql`
          query governanceOverview($networkId: String!) {
            governanceOverview(networkId: $networkId) {
              totalStakedAssets
              totalVoters
              treasurySize
              topVoters {
                name
                address
                votingPower
                picture
                validator {
                  name
                  picture
                  operatorAddress
                }
              }
              links {
                title
                link
              }
            }
          }
        `
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.currentNetwork.id,
        }
      },
      /* istanbul ignore next */
      update(data) {
        this.governanceOverviewLoaded = true
        return data.governanceOverview
      },
    },
    parameters: {
      /* istanbul ignore next */
      query() {
        return GovernanceParameters(this.currentNetwork.id)
      },
      /* istanbul ignore next */
      update(data) {
        return data.governanceParameters || {}
      },
      /* istanbul ignore next */
      skip() {
        // only Tendermint networks have this network-wide "governance parameters" logic
        return this.currentNetwork.network_type !== `cosmos`
      },
    },
    $subscribe: {
      blockAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.currentNetwork.id,
          }
        },
        /* istanbul ignore next */
        query() {
          return gql`
            subscription($networkId: String!) {
              blockAdded(networkId: $networkId) {
                height
              }
            }
          `
        },
        /* istanbul ignore next */
        result() {
          this.$apollo.queries.proposals.refetch()
        },
      },
    },
  },
}
</script>

<style scoped>
.proposals {
  padding: 0 1rem;
}

h1 {
  font-size: 32px;
  max-width: 500px;
  color: var(--bright);
}

h4 {
  font-size: 12px;
  color: var(--dim);
  font-weight: 400;
  max-width: 1024px;
  margin: 0 auto;
  width: 100%;
}

.overview-header {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 0 4rem;
  width: 100%;
}

.overview-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.overview-top div {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.overview-top .button {
  margin-left: 1rem;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-row div {
  font-size: 22px;
  color: var(--txt);
  padding: 1rem;
  border: 2px solid var(--bc);
  border-radius: 0.25rem;
  width: 100%;
  margin: 0 0.5rem;
  white-space: nowrap;
}

.data-row div:first-child {
  margin-left: 0;
}

.data-row div:last-child {
  margin-right: 0;
}

@media screen and (max-width: 1023px) {
  .tutorial-btn {
    display: none;
  }

  #propose-btn {
    margin: 2rem 0 0;
  }

  .overview-top {
    justify-content: center;
    flex-direction: column;
    padding-top: 2rem;
  }

  .data-row {
    flex-direction: column;
  }

  .data-row div {
    margin: -2px 0 0;
    border-radius: 0;
  }
}
</style>
