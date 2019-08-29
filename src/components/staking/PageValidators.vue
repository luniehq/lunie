<template>
  <TmPage
    :managed="true"
    :loading="$apollo.queries.validators.loading"
    :loaded="!$apollo.queries.validators.loading"
    :error="$apollo.queries.validators.error"
    :data-empty="validators.length === 0"
    hide-header
  >
    <template slot="managed-body">
      <TableValidators
        :validators="validators"
        show-on-mobile="expectedReturns"
      />
    </template>
  </TmPage>
</template>

<script>
import { AllValidators, AllValidatorsResult } from "src/gql"
import TableValidators from "staking/TableValidators"
import TmPage from "common/TmPage"

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    TmPage
  },
  data: () => ({
    lastUpdate: 0,
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
