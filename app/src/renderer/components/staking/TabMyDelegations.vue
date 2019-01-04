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

      <div>
        <h3 class="tab-header">
          Inactive Delegations
          <i v-tooltip.top="unbondInfo" class="material-icons info-button">
            info_outline
          </i>
        </h3>
        <table-validators :validators="undelegatedValidators" />
      </div>
    </div>
  </managed-body>
</template>

<script>
import { mapGetters } from "vuex"
import TmDataMsg from "common/TmDataMsg"
import TmDataLoading from "common/TmDataLoading"
import TableValidators from "staking/TableValidators"
import TmDataConnecting from "common/TmDataConnecting"
import ManagedBody from "../common/ManagedBody"
import { includes } from "lodash"

export default {
  name: `tab-my-delegations`,
  components: {
    TableValidators,
    TmDataMsg,
    TmDataConnecting,
    TmDataLoading,
    ManagedBody
  },
  data: () => ({
    bondInfo: `Validators you are currently bonded to`,
    unbondInfo: `Your bonded validators in unbonding process`
  }),
  computed: {
    ...mapGetters([
      `delegates`,
      `delegation`,
      `committedDelegations`,
      `bondingDenom`,
      `connected`,
      `filters`
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
