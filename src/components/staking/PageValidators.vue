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
        <div class="toggles">
          <TmBtn	       
            color="primary"
            value="All"
            class="btn-radio"
            :type="!activeOnly ? `primary` : `secondary`"
            @click.native="activeOnly = !activeOnly"	  
          />        
          <TmBtn
            color="primary"
            value="Active"
            class="btn-radio"
            :type="activeOnly ? `primary` : `secondary`"
            @click.native="activeOnly = !activeOnly"	  
          />
        </div>
        <TmField
          v-model="searchTerm"
          class="searchField"
          size="14px"
          placeholder="Search"
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
    activeOnly: true,
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
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;
  margin: 1rem;

  input {
    margin-left: 1rem;
  }

  label {
    cursor: pointer;
  }
}

.filterOptions .btn-radio:last-child {
  border-radius: 0 0.5rem 0.5rem 0;
  border-left: none;
  outline: red;
}

.filterOptions .btn-radio:first-child {
  border-radius: 0.5rem 0 0 0.5rem;
  border-right: none;
}

.filterOptions .btn-radio {
  border-radius: 0;
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
