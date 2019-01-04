<template>
  <managed-body
    :connected="connected"
    :loading="delegation.loading"
    :loaded="delegation.loaded"
    :error="delegation.error"
    :data="yourValidators"
    :filtered-data="filteredValidators"
    :search="{ type: `delegation` }"
  >
    <tm-data-msg slot="no-data">
      <div slot="title">No Active Delegations</div>
      <div slot="subtitle">
        Looks like you haven't delegated any {{ bondingDenom }}s yet. Head over
        to the
        <router-link :to="{ name: 'Validators' }">validator list</router-link>
        to make your first delegation!
      </div>
    </tm-data-msg>
    <div slot="data-body">
      <table-validators :validators="filteredValidators" />
      <div class="check-out-message">
        Check out&nbsp;
        <router-link :to="{ name: 'Validators' }">
          the validator list
        </router-link>
        &nbsp;to find other validators to delegate to.
      </div>

      <div v-if="unbondingTransactions.length > 0">
        <h3 class="tab-header transactions">
          Unbonding transactions
          <i
            v-tooltip.top="unbondTransactions"
            class="material-icons info-button"
          >
            info_outline
          </i>
        </h3>
        <div class="unbonding-transactions">
          <template v-for="transaction in unbondingTransactions">
            <tm-li-stake-transaction
              :transaction="transaction"
              :validators="yourValidators"
              :bonding-denom="bondingDenom"
              :key="transaction.hash"
              :url="validatorURL"
              :unbonding-time="
                time.getUnbondingTime(
                  transaction,
                  delegation.unbondingDelegations
                )
              "
            />
          </template>
        </div>
      </div>
    </div>
  </managed-body>
</template>

<script>
import { mapGetters } from "vuex"
import TmLiStakeTransaction from "../transactions/TmLiStakeTransaction"
import TmDataMsg from "common/TmDataMsg"
import TmDataLoading from "common/TmDataLoading"
import TableValidators from "staking/TableValidators"
import TmDataConnecting from "common/TmDataConnecting"
import time from "scripts/time"
import ManagedBody from "../common/ManagedBody"
import { includes } from "lodash"

export default {
  name: `tab-my-delegations`,
  components: {
    TableValidators,
    TmLiStakeTransaction,
    TmDataMsg,
    TmDataConnecting,
    TmDataLoading,
    ManagedBody
  },
  data: () => ({
    bondInfo: `Validators you are currently bonded to`,
    unbondInfo: `Your bonded validators in undelegation process`,
    unbondTransactions: `The transactions currently in undelegation period`,
    validatorURL: `/staking/validators`,
    time
  }),
  computed: {
    ...mapGetters([
      `allTransactions`,
      `delegates`,
      `delegation`,
      `committedDelegations`,
      `bondingDenom`,
      `connected`,
      `filters`
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
            // Checking the type of transaction
            transaction.tx.value.msg[0].type === `cosmos-sdk/BeginUnbonding` &&
            // getting the unbonding time and checking if it has passed already
            time.getUnbondingTime(
              transaction,
              delegation.unbondingDelegations
            ) >= Date.now()
        )
        .map(transaction => ({
          ...transaction,
          unbondingDelegation:
            delegation.unbondingDelegations[
              transaction.tx.value.msg[0].value.validator_addr
            ]
        })),
    filteredValidators() {
      const validators = this.yourValidators
      if (this.filters.delegates.search.visible) {
        let query = this.filters.delegates.search.query || ``
        return validators.filter(i =>
          includes(JSON.stringify(i).toLowerCase(), query.toLowerCase())
        )
      }
      return validators
    }
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

.unbonding-transactions {
  margin-left: 2rem;
  counter-reset: transaction;
}
.unbonding-transactions .tm-li-tx {
  counter-increment: transaction;
}
.unbonding-transactions .tm-li-tx::before {
  content: counter(transaction);
  position: absolute;
  width: 2rem;
  text-align: right;
  color: var(--dim);
  left: 0;
}
</style>
