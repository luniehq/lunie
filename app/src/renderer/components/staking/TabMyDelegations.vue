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
    <div v-if="delegation.loaded && undelegatedValidators.length > 0">
      <h3 class="tab-header">
        Unbonding validators
        <i v-tooltip.top="unbondInfo" class="material-icons info-button"
          >info_outline</i
        >
      </h3>
      <table-validators :validators="undelegatedValidators" />
    </div>
    <div v-if="delegation.loaded && undelegatedValidators.length > 0">
      <h3 class="tab-header transactions">
        Unbonding transactions
        <i
          v-tooltip.top="unbondTransactions"
          class="material-icons info-button"
        >
          info_outline
        </i>
      </h3>
      <template v-for="transaction in unbondingTransactions">
        <tm-li-stake-transaction
          :transaction="transaction"
          :validators="undelegatedValidators"
          :bonding-denom="bondingDenom"
          :key="transaction.hash"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"
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
    unbondTransactions: `The transactions currently in unbouding period`
  }),
  computed: {
    ...mapState([`transactions`]),
    ...mapGetters([
      `delegates`,
      `delegation`,
      `committedDelegations`,
      `bondingDenom`,
      `connected`
    ]),
    undelegatedValidators(
      { delegates: { delegates }, delegation: { unbondingDelegations } } = this
    ) {
      return delegates.filter(
        ({ operator_address }) => operator_address in unbondingDelegations
      )
    },
    yourValidators({ committedDelegations, delegates: { delegates } } = this) {
      return delegates.filter(
        ({ operator_address }) => operator_address in committedDelegations
      )
    },
    unbondingTransactions: ({ transactions, delegation } = this) =>
      transactions.staking
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
  margin: 2rem;
}

.info-button {
  color: var(--link);
}

.check-out-message {
  background: var(--app-fg);
  border: 1px solid var(--bc-dim);
  border-radius: 0.25rem;
  font-size: var(--sm);
  margin-bottom: 4rem;
  margin-left: 2rem;
  padding: 0.5rem;
  text-align: center;
}
</style>
