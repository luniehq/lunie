<template>
  <div>
    <div v-if="yourValidators.length > 0">
      <table-validators :validators="yourValidators" />
    </div>
    <tm-data-msg v-if="yourValidators.length < 1" icon="info_outline">
      <div slot="title">No Active Delegations</div>
      <div slot="subtitle">
        Looks like you haven't delegated any {{ bondingDenom }}s yet. Head over
        to the
        <router-link :to="{ name: 'Validators' }">validator list</router-link>
        to make your first delegation!
      </div>
    </tm-data-msg>
    <div v-if="yourValidators.length > 0" class="check-out-message">
      Check out
      <router-link :to="{ name: 'Validators' }">the validator list</router-link>
      to find other validators to delegate to.
    </div>
    <div v-if="undelegatedValidators.length">
      <h3 class="tab-header">
        Inactive Delegations
        <i v-tooltip.top="unbondInfo" class="material-icons info-button"
          >info_outline</i
        >
      </h3>
      <table-validators :validators="undelegatedValidators" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { TmDataMsg } from "@tendermint/ui"
import TableValidators from "staking/TableValidators"

export default {
  name: `tab-my-delegations`,
  components: { TableValidators, TmDataMsg },
  data: () => ({
    bondInfo: `Validators you are currently bonded to`,
    unbondInfo: `Your bonded validators in unbonding process`
  }),
  computed: {
    ...mapGetters([
      `delegates`,
      `delegation`,
      `committedDelegations`,
      `bondingDenom`
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
