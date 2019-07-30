<template>
  <div>
    <div v-if="delegation.loaded && yourValidators.length > 0">
      <TableValidators :validators="yourValidators" />
    </div>
    <TmDataMsg
      v-else-if="yourValidators.length === 0"
      icon="sentiment_dissatisfied"
    >
      <div slot="title">
        No Active Delegations
      </div>
      <div slot="subtitle">
        Looks like you haven't delegated any {{ num.viewDenom(bondDenom) }}s
        yet. Head over to the
        <router-link :to="{ name: 'Validators' }">
          validator list
        </router-link>
        to make your first delegation!
      </div>
    </TmDataMsg>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import TmDataMsg from "common/TmDataMsg"
import TableValidators from "staking/TableValidators"
import time from "scripts/time"

export default {
  name: `delegations-overview`,
  components: {
    TableValidators,
    TmDataMsg
  },
  data: () => ({
    validatorURL: `/staking/validators`,
    time,
    num
  }),
  computed: {
    ...mapGetters([`delegation`, `bondDenom`, `yourValidators`])
  }
}
</script>
<style>
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
