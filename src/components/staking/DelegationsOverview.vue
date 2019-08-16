<template>
  <div>
    <div v-if="delegation.loaded && yourValidators.length > 0">
      <TableValidators
        :validators="yourValidators"
        show-on-mobile="expectedReturns"
      />
    </div>
    <TmDataMsg
      v-else-if="yourValidators.length === 0"
      icon="sentiment_dissatisfied"
    >
      <div slot="title">No validators in your portfolio</div>
      <div slot="subtitle">
        Head over to the
        <router-link :to="{ name: 'Validators' }">validator list</router-link
        >&nbsp;to get staking!
      </div>
    </TmDataMsg>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import num from "scripts/num"
import TmDataMsg from "common/TmDataMsg"
import TableValidators from "staking/TableValidators"

export default {
  name: `delegations-overview`,
  components: {
    TableValidators,
    TmDataMsg
  },
  data: () => ({
    validatorURL: `/validators`,
    num
  }),
  computed: {
    ...mapState([`delegation`]),
    ...mapGetters([`bondDenom`, `yourValidators`])
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
