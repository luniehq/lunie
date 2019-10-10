<template>
  <TmPage data-title="Proposal" hide-header class="small">
    <TmDataLoading
      v-if="$apollo.queries.proposal.loading || !governanceParameters.loaded"
    />
    <TmDataError
      v-else-if="$apollo.queries.proposal.error || governanceParameters.error"
    />
    <template v-else>
      <div class="proposal">
        <div class="page-profile__header__info">
          <span :class="status.color" class="proposal-status">
            {{ status.badge }}
          </span>
          <h2 class="proposal-title">{{ proposal.title }}</h2>
        </div>
        <div class="button-container">
          <TmBtn
            v-if="proposal.status !== 'Passed'"
            id="deposit-btn"
            :value="connected ? 'Deposit' : 'Connecting...'"
            :disabled="proposal.status !== 'DepositPeriod'"
            color="primary"
            @click.native="onDeposit"
          />
          <TmBtn
            id="vote-btn"
            :value="connected ? 'Vote' : 'Connecting...'"
            :disabled="proposal.status !== 'VotingPeriod'"
            color="primary"
            @click.native="() => onVote()"
          />
        </div>
      </div>

      <TextBlock :content="description" />

      <ul v-if="proposal.status === 'DepositPeriod'" class="row">
        <li>
          <h4>Deposit Count</h4>
          <span>
            {{ proposal.deposit | atoms }}
            /
            {{
              governanceParameters.parameters.deposit.min_deposit[0].amount
                | atoms
            }}
            {{
              governanceParameters.parameters.deposit.min_deposit[0].amount
                | viewDenom
            }}
          </span>
        </li>
      </ul>

      <ul v-if="proposal.status !== `DepositPeriod`" class="row">
        <li v-if="proposal.status === `VotingPeriod`">
          <h4>Total Vote Count</h4>
          <span>
            {{ totalVotePercentage }} /
            {{ proposal.tally.total | shortDecimals }}
          </span>
        </li>
        <li>
          <h4>Yes</h4>
          <span>
            {{ (proposal.tally.yes / proposal.tally.total) | percent }}
            /
            {{ proposal.tally.yes | shortDecimals }}
          </span>
        </li>
        <li>
          <h4>No</h4>
          <span>
            {{ (proposal.tally.no / proposal.tally.total) | percent }}
            /
            {{ proposal.tally.no | shortDecimals }}
          </span>
        </li>
        <li>
          <h4>Veto</h4>
          <span>
            {{ (proposal.tally.veto / proposal.tally.total) | percent }}
            /
            {{ proposal.tally.veto | shortDecimals }}
          </span>
        </li>
        <li>
          <h4>Abstain</h4>
          <span>
            {{ (proposal.tally.abstain / proposal.tally.total) | percent }}
            /
            {{ proposal.tally.abstain | shortDecimals }}
          </span>
        </li>
      </ul>

      <ul class="row">
        <li>
          <h4>Proposal ID</h4>
          <span>{{ proposal.id }}</span>
        </li>
        <li>
          <h4>Submitted</h4>
          <span>{{ proposal.creationTime | date }}</span>
        </li>
        <template v-if="actionName">
          <li>
            <h4>{{ actionName }} Start Date</h4>
            <span>{{ proposal.statusBeginDate | date }}</span>
          </li>
          <li>
            <h4>{{ actionName }} End Date</h4>
            <span
              >{{ proposal.statusEndDate | date }} /
              {{ proposal.statusEndDate | fromNow }}</span
            >
          </li>
        </template>
        <template v-else>
          <li>
            <h4>Proposal Finalized ({{ proposal.status }})</h4>
            <span>{{ proposal.statusEndDate | date }}</span>
          </li>
        </template>
      </ul>

      <ModalDeposit
        ref="modalDeposit"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :denom="depositDenom"
      />
      <ModalVote
        ref="modalVote"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :last-vote-option="lastVote && lastVote.option"
      />
    </template>
  </TmPage>
</template>

<script>
import moment from "moment"
import { mapState, mapGetters } from "vuex"
import { shortDecimals, viewDenom, atoms, percent } from "scripts/num"
import TmBtn from "common/TmBtn"
import TmDataError from "common/TmDataError"
import TmDataLoading from "common/TmDataLoading"
import TextBlock from "common/TextBlock"
import ModalDeposit from "src/ActionModal/components/ModalDeposit"
import ModalVote from "src/ActionModal/components/ModalVote"
import TmPage from "common/TmPage"
import { getProposalStatus } from "scripts/proposal-status"
import { ProposalItem } from "src/gql"

export default {
  name: `page-proposal`,
  components: {
    TmBtn,
    ModalDeposit,
    ModalVote,
    TmDataError,
    TmDataLoading,
    TmPage,
    TextBlock
  },
  filters: {
    shortDecimals,
    viewDenom,
    atoms,
    percent,
    date: value => moment(value).format("MMMM Do YYYY, HH:mm"),
    fromNow: value => moment(value).fromNow()
  },
  props: {
    proposalId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    lastVote: undefined,
    proposal: {
      tally: {}
    }
  }),
  computed: {
    ...mapState([`governanceParameters`, `pool`, `session`, `wallet`]),
    ...mapState({ network: state => state.connection.network }),
    ...mapGetters([`depositDenom`, `connected`]),
    description() {
      return this.proposal.description
    },
    actionName() {
      if (this.proposal.status === "DepositPeriod") return `Depositing`
      if (this.proposal.status === "VotingPeriod") return `Voting`
      return undefined
    },
    totalVotePercentage({ pool, proposal }) {
      const totalPossibleVotes = pool.pool.bonded_tokens
      return percent(proposal.tally.total / totalPossibleVotes)
    },
    status() {
      return getProposalStatus(this.proposal)
    }
  },
  async mounted({ governanceParameters, $store } = this) {
    if (!governanceParameters.loaded) {
      $store.dispatch(`getGovParameters`)
    }
  },
  methods: {
    async onVote({ $refs, $store, votes, proposalId, wallet } = this) {
      $refs.modalVote.open()
      // The error is already handled with notifyError in votes.js
      await $store.dispatch(`getProposalVotes`, proposalId)
      this.lastVote =
        votes[proposalId] &&
        votes[proposalId].find(e => e.voter === wallet.address)
    },
    onDeposit() {
      this.$refs.modalDeposit.open()
    }
  },
  apollo: {
    proposal: {
      query() {
        /* istanbul ignore next */
        return ProposalItem(this.network)
      },
      update(data) {
        /* istanbul ignore next */
        return data.proposal
      },
      variables() {
        /* istanbul ignore next */
        return {
          id: +this.proposalId
        }
      }
    }
  }
}
</script>
<style scoped>
.proposal-title {
  color: var(--bright);
  font-size: var(--h1);
  line-height: 2.25rem;
  font-weight: 500;
  padding-top: 1rem;
}

.text-block {
  padding: 0 1rem 3rem;
}

.button-container {
  display: flex;
  align-items: flex-end;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--bc-dim);
  border-bottom: 1px solid var(--bc-dim);
}

.page-profile__header__info {
  padding: 1rem;
}

.button-container button:first-child {
  margin-right: 0.5rem;
}

@media screen and (max-width: 667px) {
  .button-container {
    width: 100%;
    padding: 1rem;
  }

  .button-container button {
    width: 50%;
  }
}
</style>
