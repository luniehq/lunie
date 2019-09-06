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
import { mapState } from "vuex"
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
  computed: {
    ...mapState({ network: state => state.connection.network })
  },
  apollo: {
    validators: {
      query() {
        /* istanbul ignore next */
        return ValidatorByName(this.network)(this.activeOnly)
      },
      update(data) {
        /* istanbul ignore next */
        return AllValidatorsResult(this.network)(data)
      },
      variables() {
        /* istanbul ignore next */
        return {
          monikerName: `%${this.searchTerm}%`
        }
      }
    }
  }
}
</script>

<style lang="scss">
.filterOptions {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  margin: 1rem;

  .toggles {
    margin-top: 1rem;
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
    justify-content: flex-end;
    .toggles {
      order: -1;
      margin-top: 0;
    }
    input {
      margin-left: 1rem;
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
