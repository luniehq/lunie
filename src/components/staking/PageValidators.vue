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
        <label
          color="primary"
          class="activeOnlybutton"
          for="activeOnlyToggle"
          @click.native="activeOnly = !activeOnly"
        >
          <input
            id="activeOnlyToggle"
            v-model="activeOnly"
            color="primary"
            type="checkbox"
          />
          Active Only
        </label>
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

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    PageContainer,
    TmField
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
  display: flex;
  flex-flow: column wrap;
  margin: 1rem;

  input {
    margin-bottom: 1rem;
  }

  label {
    cursor: pointer;
  }
}

@media screen and (min-width: 1024px) {
  .filterOptions {
    input {
      max-width: 300px;
    }
    margin: 2rem;
  }
}

.no-results {
  text-align: center;
  margin: 3rem;
  color: var(--dim);
}
</style>
