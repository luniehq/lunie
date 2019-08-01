<template>
  <div>
    <CardSignInRequired v-if="!session.signedIn" />
    <div v-else-if="delegation.loaded && yourValidators.length > 0">
      <TableValidators :validators="yourValidators" show-on-mobile="my_delegations" />
    </div>
    <TmDataConnecting v-else-if="!delegation.loaded && !connected" />
    <TmDataLoading v-else-if="!delegation.loaded && delegation.loading" />
    <TmDataMsg v-else-if="yourValidators.length === 0" icon="sentiment_dissatisfied">
      <div slot="title">No Active Delegations</div>
      <div slot="subtitle">
        Looks like you haven't delegated any {{ bondDenom | viewDenom }}s yet.
        Head over to the
        <router-link :to="{ name: 'Validators' }">validator list</router-link>to
        make your first delegation!
      </div>
    </TmDataMsg>
    <div v-if="delegation.loaded && pendingUndelegations.length > 0">
      <h3 class="tab-header transactions">Pending Undelegations</h3>
      <div class="unbonding-transactions">
        <template>
          <TransactionList
            :transactions="pendingUndelegations"
            :address="session.address"
            :validators="validators"
          />
          <br />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { viewDenom } from "scripts/num"
import TmDataMsg from "common/TmDataMsg"
import CardSignInRequired from "common/CardSignInRequired"
import TmDataLoading from "common/TmDataLoading"
import TableValidators from "staking/TableValidators"
import TmDataConnecting from "common/TmDataConnecting"
import TransactionList from "transactions/TransactionList"

export default {
  name: `tab-my-delegations`,
  components: {
    TableValidators,
    TmDataMsg,
    TmDataConnecting,
    TmDataLoading,
    CardSignInRequired,
    TransactionList
  },
  filters: {
    viewDenom
  },
  data: () => ({
    unbondTransactions: `Transactions currently in the undelegation period`
  }),
  computed: {
    ...mapGetters([
      `transactions`,
      `delegates`,
      `delegation`,
      `committedDelegations`,
      `unbondingTransactions`,
      `pendingUndelegations`,
      `bondDenom`,
      `connected`,
      `session`,
      `lastHeader`,
      `validators`
    ]),
    yourValidators() {
      return (
        this.session.signedIn &&
        this.delegates.delegates.filter(
          ({ operator_address }) =>
            operator_address in this.committedDelegations
        )
      )
    }
  },
  watch: {
    "session.signedIn": function() {
      this.loadStakingTxs()
    }
  },
  async created() {
    this.loadStakingTxs()
  },
  methods: {
    async loadStakingTxs() {
      if (this.session.signedIn) {
        await this.$store.dispatch(`getAllTxs`)
      }
    }
  }
}
</script>
<style>
.tab-header {
  color: var(--dim);
  font-size: 14px;
  font-weight: 500;
  margin: 3rem 0.5rem 0.5rem;
}

.info-button {
  color: var(--link);
}

.unbonding-transactions .tm-li-tx::before {
  position: absolute;
  width: 2rem;
  text-align: right;
  color: var(--dim);
  left: 0;
}
</style>
