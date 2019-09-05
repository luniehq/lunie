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
      <div class="filterOptions">
        <TmField
          v-model="searchTerm"
          class="searchField"
          size="14px"
          placeholder="Search"
        />
        <TmBtn
          color="primary"
          value="Active Only"
          class="activeOnlybutton"
          :type="activeOnly ? `primary` : `secondary`"
          @click.native="activeOnly = !activeOnly"
        />
      </div>
      <TableValidators
        :validators="validators"
        show-on-mobile="expectedReturns"
      />
      <div v-if="validators.length === 0 && searchTerm" class="no-results">
        No results for these search terms
      </div>
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
      query() {
        /* istanbul ignore next */
        return ValidatorByName(this.activeOnly)
      },
      variables() {
        /* istanbul ignore next */
        return {
          monikerName: `%${this.searchTerm}%`
        }
      },
      update: AllValidatorsResult
    }
  }
}
</script>

<style lang="scss">
.filterOptions {
  margin: 1rem;

  input {
    margin-bottom: 1rem;
  }
}

@media screen and (min-width: 1024px) {
  .filterOptions {
    max-width: 300px;
    margin: 2rem;
  }
}

.no-results {
  text-align: center;
  margin: 3rem;
  color: var(--dim);
}
</style>
