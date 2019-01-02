<template>
  <div>
    <div v-if="delegation.loaded && yourValidators.length > 0">
      <h3 class="tab-header">
        My active validators
        <i v-tooltip.top="unbondInfo" class="material-icons info-button">
          info_outline
        </i>
      </h3>
      <table-validators :validators="yourValidators" />
    </div>
    <tm-data-connecting v-if="!delegation.loaded && !connected" />
    <tm-data-loading v-else-if="!delegation.loaded && delegation.loading" />
    <tm-data-msg v-else-if="yourValidators.length === 0" icon="info_outline">
      <div slot="title">No Active Delegations</div>
      <div slot="subtitle">
        Looks like you haven't delegated any {{ bondingDenom }}s yet. Head over
        to the
        <router-link :to="{ name: 'Validators' }">validator list</router-link>
        to make your first delegation!
      </div>
    </tm-data-msg>
    <div
      v-if="delegation.loaded && yourValidators.length > 0"
      class="check-out-message"
    >
      Check out
      <router-link :to="{ name: 'Validators' }">the validator list</router-link>
      to find other validators to delegate to.
    </div>
    <div v-if="delegation.loaded && unbondingTransactions.length > 0">
      <h3 class="tab-header transactions">
        Unbonding transactions
        <i
          v-tooltip.top="unbondTransactions"
          class="material-icons info-button"
        >
          info_outline
        </i>
      </h3>
      <div class="transactions">
        <template v-for="transaction in unbondingTransactions">
          <tm-li-stake-transaction
            :transaction="transaction"
            :validators="yourValidators"
            :bonding-denom="bondingDenom"
            :key="transaction.hash"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { TmDataMsg, TmDataLoading, TmLiStakeTransaction } from "@tendermint/ui"
import TableValidators from "staking/TableValidators"
import TmDataConnecting from "common/TmDataConnecting"
import moment from "moment"

export default {
  name: `tab-my-delegations`,
  components: {
    TableValidators,
    TmDataMsg,
    TmDataConnecting,
    TmDataLoading,
    TmLiStakeTransaction
  },
  data: () => ({
    bondInfo: `Validators you are currently bonded to`,
    unbondInfo: `Your bonded validators in unbonding process`,
    unbondTransactions: `The transactions currently in unbonding period`
  }),
  computed: {
    ...mapGetters([
      `allTransactions`,
      `delegates`,
      `delegation`,
      `committedDelegations`,
      `bondingDenom`,
      `connected`
    ]),
    yourValidators({ committedDelegations, delegates: { delegates } } = this) {
      return delegates.filter(
        ({ operator_address }) => operator_address in committedDelegations
      )
    },
    unbondingTransactions: ({ allTransactions, delegation } = this) =>
      allTransactions
        .filter(
          transaction =>
            transaction.tx.value.msg[0].type === `cosmos-sdk/BeginUnbonding`
        )
        .map(transaction => ({
          ...transaction,
          unbondingDelegation:
            delegation.unbondingDelegations[
              transaction.tx.value.msg[0].value.validator_addr
            ]
        }))
  },
  methods: {
    timeDiff: min_time => moment(min_time).fromNow()
  }
}
</script>
<style>
.tab-header {
  color: var(--dim);
  font-size: 14px;
  font-weight: 500;
  margin: 1rem 1rem 0 2rem;
}
.tab-header.transactions {
  margin: 2rem 0 1rem 2rem;
}

.info-button {
  color: var(--link);
}

.check-out-message {
  background: var(--app-fg);
  border: 1px solid var(--bc-dim);
  border-radius: 0.25rem;
  font-size: var(--sm);
  margin-left: 2rem;
  padding: 0.5rem;
  text-align: center;
}

.transactions {
  margin-left: 2rem;
  counter-reset: transaction;
}
.transactions .tm-li-tx {
  counter-increment: transaction;
}
.tm-li-tx::before {
  content: counter(transaction);
  position: absolute;
  width: 2rem;
  text-align: right;
  color: var(--dim);
  left: 0;
}
</style>
