<template>
  <PageContainer
    :managed="true"
    :loading="$apollo.queries.validators.loading"
    :loaded="!$apollo.queries.validators.loading"
    :error="$apollo.queries.validators.error"
    :data-empty="validators.length === 0"
    hide-header
  >
    <template slot="managed-body">
      <TmField v-model="searchTerm" placeholder="Validator name…" />
      <TableValidators
        :validators="validators"
        show-on-mobile="expectedReturns"
      />
    </template>
  </PageContainer>
</template>

<script>
import { ValidatorByName, AllValidatorsResult } from "src/gql"
import TableValidators from "staking/TableValidators"
import PageContainer from "common/PageContainer"
import TmField from "common/TmField"

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    PageContainer,
    TmField
  },
  data: () => ({
    searchTerm: "",
    validators: []
  }),
  apollo: {
    validators: {
      query: ValidatorByName,
      variables() {
        return {
          monikerName: `%${this.searchTerm}%`
        }
      },
      update: AllValidatorsResult
    }
  }
}
</script>
