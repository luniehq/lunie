<template>
  <TmPage data-title="Proposal" hide-header class="small">
    <TmDataLoading v-if="!proposals.loaded || !governanceParameters.loaded" />
    <TmDataError v-else-if="!proposal" />
    <template v-else>
      <div class="proposal">
        <div class="page-profile__header__info">
          <span :class="status.color" class="proposal-status">
            {{ status.badge }}
          </span>
          <div class="proposal-title__row">
            <router-link
              :to="`/proposals/` + getPrevProposalId"
              :style="{
                visibility:
                  getPrevProposalId !== proposal.proposal_id
                   ? 'visible' : 'hidden'
              }"
              class="read-more-link"
            >
              <i class="material-icons">chevron_left</i>
            </router-link>
            <h2 class="proposal-title">{{ title }}</h2>
            <router-link
              :to="`/proposals/` + getNextProposalId"
              :style="{
                visibility:
                  getNextProposalId !== proposal.proposal_id
                   ? 'visible' : 'hidden'
              }"
              class="read-more-link"
            >
              <i class="material-icons">chevron_right</i>
            </router-link>
          </div>
        </div>
        <div class="button-container">
          <TmBtn
            v-if="proposal.proposal_status !== 'Passed'"
            id="deposit-btn"
            :value="connected ? 'Deposit' : 'Connecting...'"
            :disabled="proposal.proposal_status !== 'DepositPeriod'"
            color="primary"
            @click.native="onDeposit"
          />
          <TmBtn
            id="vote-btn"
            :value="connected ? 'Vote' : 'Connecting...'"
            :disabled="proposal.proposal_status !== 'VotingPeriod'"
            color="primary"
            @click.native="() => onVote()"
          />
        </div>
      </div>

      <TextBlock :content="description" />

      <ul v-if="proposal.proposal_status === 'DepositPeriod'" class="row">
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

      <ul v-if="proposal.proposal_status !== `DepositPeriod`" class="row">
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
            {{ yesPercentage }} /
            {{ num.shortDecimals(num.atoms(tally.yes)) }}
          </span>
        </li>
        <li>
          <h4>No</h4>
          <span>
            {{ noPercentage }} /
            {{ num.shortDecimals(num.atoms(tally.no)) }}
          </span>
        </li>
        <li>
          <h4>No with Veto</h4>
          <span>
            {{ noWithVetoPercentage }} /
            {{ num.shortDecimals(num.atoms(tally.no_with_veto)) }}
          </span>
        </li>
        <li>
          <h4>Abstain</h4>
          <span>
            {{ abstainPercentage }} /
            {{ num.shortDecimals(num.atoms(tally.abstain)) }}
          </span>
        </li>
      </ul>

      <ul class="row">
        <li>
          <h4>Proposal ID</h4>
          <span>{{ proposal.proposal_id }}</span>
        </li>
        <li>
          <h4>Submitted</h4>
          <span>{{ submittedAgo }}</span>
        </li>
        <li>
          <h4>Voting Start Date</h4>
          <span>{{ votingStartedAgo }}</span>
        </li>
        <li v-if="displayEndDate">
          <h4>Voting End Date</h4>
          <span>{{ endDate }}</span>
        </li>
      </ul>

      <ModalDeposit
        ref="modalDeposit"
        :proposal-id="proposalId"
        :proposal-title="title"
        :denom="depositDenom"
      />
      <ModalVote
        ref="modalVote"
        :proposal-id="proposalId"
        :proposal-title="title"
        :last-vote-option="lastVote && lastVote.option"
      />
    </template>
  </TmPage>
</template>

<script>
import moment from "moment"
import BigNumber from "bignumber.js"
import { mapState, mapGetters } from "vuex"
import num from "scripts/num"
import TmBtn from "common/TmBtn"
import TmDataError from "common/TmDataError"
import TmDataLoading from "common/TmDataLoading"
import TextBlock from "common/TextBlock"
import ModalDeposit from "src/ActionModal/components/ModalDeposit"
import ModalVote from "src/ActionModal/components/ModalVote"
import TmPage from "common/TmPage"
import { getProposalStatus } from "scripts/proposal-status"
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
  data: () => ({
    num,
    lastVote: undefined
  }),
  computed: {
    ...mapState([
      `governanceParameters`,
      `pool`,
      `proposals`,
      `session`,
      `wallet`
    ]),
    ...mapState({ votes: state => state.votes.votes }),
    ...mapGetters([`depositDenom`, `connected`]),
    proposal() {
      return this.proposals.proposals[this.proposalId]
    },
    getNextProposalId() {
      let id = this.getProposalIndex(`+1`)
      if (id !== undefined) {
        return id
      } else {
        return this.proposalId
      }
    },
    getPrevProposalId() {
      let id = this.getProposalIndex(`-1`)
      if (id !== undefined) {
        return id
      } else {
        return this.proposalId
      }
    },
    title({ proposal } = this) {
      return proposal.proposal_content.value.title
    },
    description({ proposal } = this) {
      return proposal.proposal_content.value.description
    },
    submittedAgo({ proposal } = this) {
      return moment(proposal.submit_time).format("MMMM Do YYYY, HH:mm")
    },
    endDate({ proposal } = this) {
      return moment(proposal.voting_end_time).format("MMMM Do YYYY, HH:mm")
    },
    displayEndDate({ proposal, governanceParameters } = this) {
      if (
        proposal.proposal_status !== "DepositPeriod" &&
        proposal.total_deposit[0].amount >=
          Number(governanceParameters.parameters.deposit.min_deposit[0].amount)
      ) {
        return true
      } else {
        return false
      }
    },
    votingStartedAgo({ proposal } = this) {
      return moment(proposal.voting_start_time).format("MMMM Do YYYY, HH:mm")
    },
    depositEndsIn({ proposal } = this) {
      return moment(new Date(proposal.deposit_end_time)).fromNow()
    },
    totalVotes({ tally: { yes, no, no_with_veto, abstain } } = this) {
      return BigNumber(yes)
        .plus(no)
        .plus(no_with_veto)
        .plus(abstain)
        .toNumber()
    },
    totalVotePercentage({ pool, totalVotes }) {
      const totalPossibleVotes = pool.pool.bonded_tokens
      return num.percentInt(totalVotes / totalPossibleVotes)
    },
    yesPercentage({ tally, totalVotes } = this) {
      return num.percentInt(totalVotes === 0 ? 0 : tally.yes / totalVotes)
    },
    noPercentage({ tally, totalVotes } = this) {
      return num.percentInt(totalVotes === 0 ? 0 : tally.no / totalVotes)
    },
    noWithVetoPercentage({ tally, totalVotes } = this) {
      return num.percentInt(
        totalVotes === 0 ? 0 : tally.no_with_veto / totalVotes
      )
    },
    abstainPercentage({ tally, totalVotes } = this) {
      return num.percentInt(totalVotes === 0 ? 0 : tally.abstain / totalVotes)
    },
    tally({ proposals, proposalId } = this) {
      const { yes, no, abstain, no_with_veto } =
        proposals.tallies[proposalId] || {}
      return {
        yes: yes || BigNumber(0),
        no: no || BigNumber(0),
        abstain: abstain || BigNumber(0),
        no_with_veto: no_with_veto || BigNumber(0)
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
    if (!proposals[proposalId]) {
      $store.dispatch(`getProposal`, proposalId)
    }
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
    },
    getProposalIndex(sign) {
      let proposalsObj = this.proposals.proposals
      let proposalsArr = Object.keys(proposalsObj).map(key => proposalsObj[key])
      let proposalsIdArr = proposalsArr.map(proposal => proposal.proposal_id)
      return proposalsIdArr[
        proposalsIdArr.indexOf(this.proposalId) + Number(sign)
      ]
    }
  }
}
</script>
<style scoped>
.proposal-title__row {
  color: var(--bright);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.proposal-title__row a {
  color: var(--bright);
  padding-top: 1rem;
}

.proposal-title__row a:hover {
  color: var(--link-hover);
  padding-top: 1rem;
}

.proposal-title {
  text-align: center;
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
