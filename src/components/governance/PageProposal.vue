<template>
  <TmPage data-title="Proposal" hide-header class="small">
    <!-- <TmDataLoading
      v-if="!$apollo.queries.proposal.loading || !governanceParameters.loaded"
    /> -->
    <!-- <TmDataError v-else-if="!proposal" /> -->
    <template>
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
            {{ totalDeposit ? totalDeposit.amount : `0` }}
            /
            {{
              num.atoms(
                governanceParameters.parameters.deposit.min_deposit[0].amount
              )
            }}
            {{ totalDeposit.denom }}
          </span>
        </li>
      </ul>

      <ul v-if="proposal.status !== `DepositPeriod`" class="row">
        <li>
          <h4>Total Vote Count</h4>
          <span>
            {{ totalVotePercentage }} /
            {{ num.shortDecimals(num.atoms(totalVotes)) }}
          </span>
        </li>
        <li>
          <h4>Yes</h4>
          <span>
            {{ proposal.final_tally_yes / totalVotes * 100 | shortDecimals }} /
            {{ num.shortDecimals(num.atoms(tally.final_tally_yes)) }}
          </span>
        </li>
        <li>
          <h4>No</h4>
          <span>
            {{ noPercentage }} /
            {{ num.shortDecimals(num.atoms(tally.final_tally_no)) }}
          </span>
        </li>
        <li>
          <h4>No with Veto</h4>
          <span>
            {{ noWithVetoPercentage }} /
            {{ num.shortDecimals(num.atoms(tally.final_tally_no_with_veto)) }}
          </span>
        </li>
        <li>
          <h4>Abstain</h4>
          <span>
            {{ abstainPercentage }} /
            {{ num.shortDecimals(num.atoms(tally.final_tally_abstain)) }}
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
          <span>{{ proposal.submit_time }}</span>
        </li>
        <li>
          <h4>Voting Start Date</h4>
          <span>{{ proposal.voting_start_time }}</span>
        </li>
        <li v-if="proposal.voting_end_time">
          <h4>Voting End Date</h4>
          <span>{{ proposal.voting_end_time }}</span>
        </li>
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
import BigNumber from "bignumber.js"
import { mapState, mapGetters } from "vuex"
import num, { shortDecimals } from "scripts/num"
import TmBtn from "common/TmBtn"
import TmDataError from "common/TmDataError"
import TmDataLoading from "common/TmDataLoading"
import TextBlock from "common/TextBlock"
import ModalDeposit from "src/ActionModal/components/ModalDeposit"
import ModalVote from "src/ActionModal/components/ModalVote"
import TmPage from "common/TmPage"
import { getProposalStatus } from "scripts/proposal-status"
import { ProposalItem, proposalResult } from "src/gql"

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
  props: {
    proposalId: {
      type: String,
      required: true
    }
  },
  filters: {
    shortDecimals
  },
  data: () => ({
    num,
    lastVote: undefined,
    proposal: {}
  }),
  computed: {
    ...mapState([
      `governanceParameters`,
      `pool`,
      // `proposals`,
      `session`,
      `wallet`
    ]),
    ...mapState({ votes: state => state.votes.votes }),
    ...mapState({ network: state => state.connection.network }),
    ...mapGetters([`depositDenom`, `connected`]),
    // proposal() {
    // return this.proposals.proposals[this.proposalId]
    // },
    description() {
      return this.proposal.description
    },
    submittedAgo() {
      return moment(this.proposal.submit_time).format("MMMM Do YYYY, HH:mm")
    },
    endDate() {
      return moment(this.proposal.voting_end_time).format("MMMM Do YYYY, HH:mm")
    },
    displayEndDate({ governanceParameters } = this) {
      if (
        this.proposal.status !== "DepositPeriod" &&
        this.proposal.total_deposit[0].amount >=
          Number(governanceParameters.parameters.deposit.min_deposit[0].amount)
      ) {
        return true
      } else {
        return false
      }
    },
    votingStartedAgo() {
      return moment(this.proposal.voting_start_time).format(
        "MMMM Do YYYY, HH:mm"
      )
    },
    depositEndsIn() {
      return moment(new Date(this.proposal.deposit_end_time)).fromNow()
    },
    totalVotes({ tally: { final_tally_yes, final_tally_no, final_tally_no_with_veto, final_tally_abstain } } = this) {
      console.log()
      return BigNumber(final_tally_yes)
        .plus(final_tally_no)
        .plus(final_tally_no_with_veto)
        .plus(final_tally_abstain)
        .toNumber()
    },
    totalVotePercentage({ pool, totalVotes }) {
      const totalPossibleVotes = pool.pool.bonded_tokens
      return num.percentInt(totalVotes / totalPossibleVotes)
    },
    yesPercentage({ tally, totalVotes } = this) {
      return num.percentInt(totalVotes === 0 ? 0 : tally.final_tally_yes / totalVotes)
    },
    noPercentage({ tally, totalVotes } = this) {
      return num.percentInt(totalVotes === 0 ? 0 : tally.final_tally_no / totalVotes)
    },
    noWithVetoPercentage({ tally, totalVotes } = this) {
      return num.percentInt(
        totalVotes === 0 ? 0 : tally.final_tally_no_with_veto / totalVotes
      )
    },
    abstainPercentage({ tally, totalVotes } = this) {
      return num.percentInt(totalVotes === 0 ? 0 : tally.final_tally_abstain / totalVotes)
    },
    tally() {
      const {
        final_tally_yes,
        final_tally_no,
        final_tally_abstain,
        final_tally_no_with_veto
      } = this.proposal

      console.log(        final_tally_yes,
        final_tally_no,
        final_tally_abstain,
        final_tally_no_with_veto)
      return {
        final_tally_yes: BigNumber(final_tally_yes),
        final_tally_no: BigNumber(final_tally_no),
        final_tally_abstain: BigNumber(final_tally_abstain),
        final_tally_no_with_veto: BigNumber(final_tally_no_with_veto)
      }
    },
    status() {
      return getProposalStatus(this.proposal)
    },
    totalDeposit() {
      return this.proposal.total_deposit
        ? num.createDisplayCoin(this.proposal.total_deposit[0])
        : null
    }
  },
  async mounted(
    { proposals, proposalId, governanceParameters, $store } = this
  ) {
    console.log("pageproposal", this.proposalId, typeof +this.proposalId)
    // if (!proposals[proposalId]) {
    //   $store.dispatch(`getProposal`, proposalId)
    // }
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
        return proposalResult(this.network)(data)
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
