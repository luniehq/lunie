<template>
  <div>
    <TmDataConnecting v-if="!connected && $apollo.queries.validators.loading" />
    <TmDataLoading v-else-if="$apollo.queries.validators.loading" />
    <TmDataEmpty
      v-else-if="!$apollo.queries.validators.loading && validators.length === 0"
    />
    <TableValidators
      v-else
      :validators="validators"
      show-on-mobile="expectedReturns"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { AllValidators, AllValidatorsResult } from "src/gql"
import TableValidators from "staking/TableValidators"
import TmDataEmpty from "common/TmDataEmpty"
import TmDataLoading from "common/TmDataLoading"
import TmDataConnecting from "common/TmDataConnecting"

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    TmDataEmpty,
    TmDataLoading,
    TmDataConnecting
  },
  data: () => ({
    lastUpdate: 0,
    validators: []
  }),
  computed: {
    ...mapGetters([`connected`])
  },
  apollo: {
    validators: {
      query: AllValidators,
      update: AllValidatorsResult
    }
  }
}
</script>
