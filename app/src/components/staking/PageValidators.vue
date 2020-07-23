<template>
  <TmPage
    :loading="$apollo.queries.validators.loading && !loaded"
    :loader-path="`/img/validator-list-loading.svg`"
  >
    <template>
      <div class="filterContainer">
        <TmField
          v-model="searchTerm"
          class="searchField"
          placeholder="Search"
        />
        <Toggle
          :toggle-options="toggleOptions"
          :current-selection="currentSelection"
          @sort="sort($event)"
        />
      </div>

      <TableValidators
        :validators="validators"
        :delegations="delegations"
        show-on-mobile="expectedReturns"
      />
      <div
        v-if="validators && validators.length === 0 && searchTerm"
        class="no-results"
      >
        No results for these search terms
      </div>
    </template>
  </TmPage>
</template>

<script>
import { mapGetters } from "vuex"
import TableValidators from "staking/TableValidators"
import TmPage from "common/TmPage"
import TmField from "common/TmField"
import Toggle from "common/Toggle"
import gql from "graphql-tag"

export default {
  name: `page-validators`,
  components: {
    TableValidators,
    TmPage,
    TmField,
    Toggle,
  },
  data: () => ({
    searchTerm: ``,
    currentSelection: `popular`,
    popularSort: true,
    allValidators: false,
    activeOnly: false,
    validators: [],
    loaded: false,
    toggleOptions: [`popular`, `all`, `active`],
  }),
  computed: {
    ...mapGetters([`address`, `network`]),
  },
  methods: {
    sort(option) {
      this.currentSelection = option

      this.popularSort = false
      this.allValidators = false
      this.activeOnly = false

      if (option === this.currentSelection) {
        this.popularSort = true
      }
      if (option === `all`) {
        this.allValidators = true
      }
      if (option === `active`) {
        this.activeOnly = true
      }
    },
  },
  apollo: {
    validators: {
      /* istanbul ignore next */
      query: gql`
        query validators(
          $networkId: String!
          $searchTerm: String
          $activeOnly: Boolean
          $popularSort: Boolean
        ) {
          validators(
            networkId: $networkId
            searchTerm: $searchTerm
            activeOnly: $activeOnly
            popularSort: $popularSort
          ) {
            id
            name
            operatorAddress
            consensusPubkey
            votingPower
            status
            statusDetailed
            picture
            expectedReturns
            popularity
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          activeOnly: this.activeOnly,
          searchTerm: this.searchTerm,
          popularSort: this.popularSort,
        }
      },
      /* istanbul ignore next */
      update: function (result) {
        /* istanbul ignore next */
        if (!Array.isArray(result.validators)) {
          return []
        }

        this.loaded = true
        /* istanbul ignore next */
        return this.activeOnly
          ? result.validators.filter(({ status }) => status === `ACTIVE`)
          : result.validators
      },
    },
    /* istanbul ignore next */
    delegations: {
      query: gql`
        query delegations($networkId: String!, $delegatorAddress: String!) {
          delegations(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
          ) {
            id
            amount
            validator {
              id
              operatorAddress
            }
          }
        }
      `,
      /* istanbul ignore next */
      skip() {
        return !this.address
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.address,
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.delegations
      },
    },
  },
}
</script>

<style scoped>
.filterContainer {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  margin: 0.5em 2em 1em;
}

input {
  max-width: 300px;
}

.no-results {
  text-align: center;
  margin: 3em;
  color: var(--dim);
}

.searchField {
  padding: 0.75rem 1rem;
  background: var(--app-fg);
  border-color: var(--app-fg);
  border-radius: 0.25rem;
}

@media screen and (max-width: 768px) {
  .filterContainer {
    margin: 0.5rem 2rem 0 2rem;
  }

  .btn-radio {
    min-width: 75px;
  }

  .filterContainer input {
    max-width: 100%;
  }

  .filterOptions {
    padding: 1.5em 0.5em 0.5em;
    width: 100%;
  }
}

@media screen and (max-width: 360px) {
  .filterContainer {
    margin: 0.5em 1em 0.5em;
  }
}
</style>
