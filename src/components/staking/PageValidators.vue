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
      <TmBtn
        color="primary"
        value="Active Only"
        :type="activeOnly ? `primary` : `secondary`"
        @click.native="activeOnly = !activeOnly"
      />
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
import TmBtn from "common/TmBtn"

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    PageContainer,
    TmField,
    TmBtn
  },
  data: () => ({
    searchTerm: "",
    activeOnly: false,
    validators: []
  }),
  apollo: {
    validators: {
      query: ValidatorByName,
      variables() {
        return {
          monikerName: `%${this.searchTerm}%`,
          activeOnly: this.activeOnly
        }
      },
      update: AllValidatorsResult
    }
  }
}
</script>
