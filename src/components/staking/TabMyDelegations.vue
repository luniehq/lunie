<template>
  <div>
    <CardSignInRequired v-if="!session.signedIn" />
    <div v-else-if="delegation.loaded && validators.length > 0">
      <TableValidators
        :validators="validators"
        show-on-mobile="my_delegations"
      />
    </div>
    <TmDataConnecting v-else-if="!delegation.loaded && !connected" />
    <TmDataLoading v-else-if="!delegation.loaded && delegation.loading" />
    <TmDataMsg
      v-else-if="validators.length === 0"
      icon="sentiment_dissatisfied"
    >
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
            :validators="yourValidatorsAddressMap"
          />
          <br />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import { viewDenom } from "scripts/num"
import { isPendingUndelegation } from "scripts/transaction-utils"
import { SomeValidators, AllValidatorsResult } from "src/gql"

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
    validators: []
  }),
  computed: {
    ...mapState([`delegates`, `delegation`, `session`]),
    ...mapGetters([
      `committedDelegations`,
      `bondDenom`,
      `connected`,
      `flatOrderedTransactionList`,
      `yourValidators`
    ]),
    yourValidatorsAddressMap() {
      const names = {}
      this.validators.forEach(item => {
        names[item.operator_address] = item
      })
      return names
    },
    pendingUndelegations() {
      return this.flatOrderedTransactionList.filter(isPendingUndelegation)
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
  },
  apollo: {
    validators: {
      query: SomeValidators,
      variables() {
        return {
          addressList: Object.keys(this.committedDelegations)
        }
      },
      update: AllValidatorsResult
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
