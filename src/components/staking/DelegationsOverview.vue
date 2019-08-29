<template>
  <div>
    <div v-if="!$apollo.queries.validators.loading && validators.length > 0">
      <TableValidators
        :validators="validators"
        show-on-mobile="expectedReturns"
      />
    </div>
    <TmDataMsg
      v-else-if="validators.length === 0"
      icon="sentiment_dissatisfied"
    >
      <div slot="title">
        No validators in your portfolio
      </div>
      <div slot="subtitle">
        Head over to the
        <router-link to="/validators"> validator list </router-link>&nbsp;to get
        staking!
      </div>
    </TmDataMsg>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TmDataMsg from "common/TmDataMsg"
import TableValidators from "staking/TableValidators"
import { SomeValidators, AllValidatorsResult } from "src/gql"

export default {
  name: `delegations-overview`,
  components: {
    TableValidators,
    TmDataMsg
  },
  data: () => ({
    validators: []
  }),
  computed: {
    ...mapGetters([`committedDelegations`, `flatOrderedTransactionList`])
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
<style scoped>
.tab-header {
  color: var(--dim);
  font-size: 14px;
  font-weight: 500;
  margin: 1.5rem 0.5rem 0.5rem;
}

@media screen and (min-width: 1023) {
  .tab-header {
    margin: 3rem 0.5rem 0.5rem;
  }
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
