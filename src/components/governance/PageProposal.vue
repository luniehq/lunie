<template>
  <TmPage data-title="Proposal" hide-header class="small">
    <TmDataLoading
      v-if="
        $apollo.queries.proposal.loading || $apollo.queries.parameters.loading
      "
    />
    <TmDataError v-else-if="error" />
    <template v-else>
      <div class="proposal">
        <div class="page-profile__header__info">
          <span :class="proposal.status | lowerCase" class="proposal-status">
            {{ status.badge }}
          </span>
          <h2 class="proposal-title">{{ proposal.title }}</h2>
          <p class="proposer">
            <template v-if="proposal.validator">
              Proposed by {{ proposal.validator.name }}:
              <Bech32 :address="proposal.proposer" />
            </template>
            <template v-else-if="proposal.proposer !== `unknown`">
              Proposed by
              <Bech32 :address="proposal.proposer" />
            </template>
            <template v-else>
              Unknown proposer
            </template>
          </p>
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

      <TextBlock :content="proposal.description" />

      <ul v-if="proposal.status === 'DepositPeriod'" class="row">
        <li>
          <h4>Deposit Count</h4>
          <span>
            {{ proposal.deposit }}
            /
            {{ parameters.depositThreshold }}
            {{ parameters.depositDenom }}
          </span>
        </li>
      </ul>

      <ul v-if="proposal.status !== `DepositPeriod`" class="row">
        <li v-if="proposal.status === `VotingPeriod`">
          <h4>Total Vote Count</h4>
          <span>
            {{ proposal.tally.totalVotedPercentage | percent }} /
            {{ proposal.tally.total | prettyInt }}
          </span>
        </li>
        <li>
          <h4>Yes</h4>
          <span>
            {{
              noVotes
                ? 0
                : (proposal.tally.yes / proposal.tally.total) | percent
            }}
            /
            {{ proposal.tally.yes | prettyInt }}
          </span>
        </li>
        <li>
          <h4>No</h4>
          <span>
            {{
              noVotes ? 0 : (proposal.tally.no / proposal.tally.total) | percent
            }}
            /
            {{ proposal.tally.no | prettyInt }}
          </span>
        </li>
        <li>
          <h4>Veto</h4>
          <span>
            {{
              noVotes
                ? 0
                : (proposal.tally.veto / proposal.tally.total) | percent
            }}
            /
            {{ proposal.tally.veto | prettyInt }}
          </span>
        </li>
        <li>
          <h4>Abstain</h4>
          <span>
            {{
              noVotes
                ? 0
                : (proposal.tally.abstain / proposal.tally.total) | percent
            }}
            /
            {{ proposal.tally.abstain | prettyInt }}
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
        <template
          v-if="['DepositPeriod', 'VotingPeriod'].includes(proposal.status)"
        >
          <li>
            <h4>{{ status.badge }} Start Date</h4>
            <span>{{ proposal.statusBeginDate | date }}</span>
          </li>
          <li>
            <h4>{{ status.badge }} End Date</h4>
            <span>
              {{ proposal.statusEndDate | date }} /
              {{ proposal.statusEndDate | fromNow }}
            </span>
          </li>
        </template>
        <template v-else>
          <li>
            <h4>Proposal Finalized ({{ status.badge }})</h4>
            <span>{{ proposal.statusEndDate | date }}</span>
          </li>
        </template>
      </ul>

      <ModalDeposit
        ref="modalDeposit"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :denom="parameters.depositDenom"
        @success="() => afterDeposit()"
      />
      <ModalVote
        ref="modalVote"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :last-vote-option="vote"
        @success="() => afterVote()"
      />
    </template>
  </TmPage>
</template>

<script>
import { mapGetters } from "vuex"
import { atoms, percent, prettyInt } from "scripts/num"
import { date, fromNow } from "src/filters"
import TmBtn from "common/TmBtn"
import TmDataError from "common/TmDataError"
import TmDataLoading from "common/TmDataLoading"
import TextBlock from "common/TextBlock"
import ModalDeposit from "src/ActionModal/components/ModalDeposit"
import ModalVote from "src/ActionModal/components/ModalVote"
import TmPage from "common/TmPage"
import { getProposalStatus } from "scripts/proposal-status"
import { ProposalItem, GovernanceParameters, Vote } from "src/gql"
import BigNumber from "bignumber.js"
import Bech32 from "common/Bech32"

export default {
  name: `page-proposal`,
  components: {
    TmBtn,
    ModalDeposit,
    ModalVote,
    TmDataError,
    TmDataLoading,
    TmPage,
    TextBlock,
    Bech32
  },
  filters: {
    prettyInt,
    atoms,
    percent,
    date,
    fromNow,
    lowerCase: text => text.toLowerCase()
  },
  props: {
    proposalId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    vote: undefined,
    proposal: {
      status: "",
      proposer: "",
      tally: {},
      validator: {}
    },
    parameters: {
      depositDenom: "TESTCOIN"
    },
    error: undefined
  }),
  computed: {
    ...mapGetters([`address`, `network`]),
    ...mapGetters([`connected`]),
    status() {
      return getProposalStatus(this.proposal)
    },
    noVotes() {
      return BigNumber(this.proposal.tally.total).eq(0)
    }
  },
  methods: {
    onVote() {
      this.$refs.modalVote.open()
    },
    afterVote() {
      this.$apollo.queries.vote.refetch({
        proposalId: this.proposal.id,
        address: this.address
      })
      this.$store.commit("invalidateCache", [`overview`, `transactions`])
    },
    onDeposit() {
      this.$refs.modalDeposit.open()
    },
    afterDeposit() {
      this.$apollo.queries.proposal.refetch({
        id: this.proposal.id
      })
      this.$store.commit("invalidateCache", [`overview`, `transactions`])
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
      },
      result(data) {
        /* istanbul ignore next */
        this.error = data.error
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
      },
      result(data) {
        /* istanbul ignore next */
        this.error = data.error
      }
    },
    vote: {
      query() {
        /* istanbul ignore next */
        return Vote(this.network)
      },
      variables() {
        /* istanbul ignore next */
        return {
          proposalId: +this.proposalId,
          address: this.address
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.vote.option
      },
      result(data) {
        /* istanbul ignore next */
        this.error = data.error
      }
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

.proposer {
  font-size: 14px;
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
