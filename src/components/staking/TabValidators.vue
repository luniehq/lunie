<template>
  <div>
    <TmDataLoading v-if="$apollo.queries.validators.loading" />
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
import { AllValidators, AllValidatorsResult } from "src/gql"
import TableValidators from "staking/TableValidators"
import TmDataEmpty from "common/TmDataEmpty"
import TmDataLoading from "common/TmDataLoading"

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    TmDataEmpty,
    TmDataLoading
  },
  data: () => ({
    validators: []
  }),
  apollo: {
    validators: {
      query: AllValidators,
      update: AllValidatorsResult
    }
  }
}
</script>
