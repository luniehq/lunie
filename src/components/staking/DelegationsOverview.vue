<template>
  <div>
    <div v-if="!$apollo.queries.delegations.loading && delegations.length > 0">
      <TableValidators
        :validators="delegations.map(({ validator }) => validator)"
        :delegations="delegations"
        show-on-mobile="expectedReturns"
      />
    </div>
    <TmDataMsg
      v-else-if="delegations.length === 0"
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
import { mapState } from "vuex"
import TmDataMsg from "common/TmDataMsg"
import TableValidators from "staking/TableValidators"
import { DelegationsForDelegator } from "src/gql"

export default {
  name: `delegations-overview`,
  components: {
    TableValidators,
    TmDataMsg
  },
  data: () => ({
    delegations: []
  }),
  computed: {
    ...mapState(["session"]),
    ...mapState({ network: state => state.connection.network })
  },
  apollo: {
    delegations: {
      query() {
        /* istanbul ignore next */
        return DelegationsForDelegator(this.network)
      },
      variables() {
        /* istanbul ignore next */
        return {
          delegatorAddress: this.session.address
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.delegations
      }
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
