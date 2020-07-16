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
        <div class="filterOptions">
          <div class="toggles">
            <TmBtn
              value="Popular"
              class="btn-radio"
              :type="popularSort ? `active` : `secondary`"
              @click.native="defaultSelectorsController(`popularSort`)"
            />
            <TmBtn
              value="All"
              class="btn-radio"
              :type="allValidators ? `active` : `secondary`"
              @click.native="defaultSelectorsController(`allValidators`)"
            />
            <TmBtn
              value="Active"
              class="btn-radio"
              :type="activeOnly ? `active` : `secondary`"
              @click.native="defaultSelectorsController(`activeOnly`)"
            />
          </div>
          <div class="show-mobile-sorting">
            <i
              :class="{ active: showMobileSorting }"
              class="filter-toggle material-icons notranslate"
              @click="toggleMobileSorting"
              >filter_list</i
            >
          </div>
        </div>
      </div>

      <TableValidators
        :validators="validators"
        :delegations="delegations"
        :show-mobile-sorting="showMobileSorting"
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
import TmBtn from "common/TmBtn"
import gql from "graphql-tag"

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    TmPage,
    TmField,
    TmBtn,
  },
  data: () => ({
    searchTerm: "",
    activeOnly: false,
    allValidators: false,
    popularSort: true,
    validators: [],
    loaded: false,
    showMobileSorting: false,
  }),
  computed: {
    ...mapGetters([`address`, `network`]),
  },
  methods: {
    defaultSelectorsController(selector) {
      this.popularSort = false
      this.allValidators = false
      this.activeOnly = false

      if (selector === `popularSort`) {
        this.popularSort = true
      }
      if (selector === `allValidators`) {
        this.allValidators = true
      }
      if (selector === `activeOnly`) {
        this.activeOnly = true
      }
    },
    toggleMobileSorting() {
      this.showMobileSorting = !this.showMobileSorting
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

<style lang="scss" scoped>
.filterContainer {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  margin: 0.5em 2em 1em;

  .toggles {
    margin-bottom: 0;
    display: inline-flex;
  }

  input {
    max-width: 300px;
  }

  .btn-radio {
    min-width: 100px;
    border-radius: 0;
  }
}

.filterContainer .btn-radio:last-child {
  border-radius: 0 0.5em 0.5em 0;
  margin-left: -1px;
}

.filterContainer .btn-radio:first-child {
  border-radius: 0.5em 0 0 0.5em;
  margin-right: -1px;
}

.show-mobile-sorting {
  display: none;
  cursor: pointer;
}

.show-mobile-sorting.active {
  color: var(--highlight);
}

.filterOptions {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-flow: row wrap;
  flex-flow: row wrap;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
}

.filter-toggle {
  margin-left: 1em;
}

.no-results {
  text-align: center;
  margin: 3em;
  color: var(--dim);
}

@media screen and (max-width: 768px) {
  .filterContainer {
    margin: 0.5rem 2rem 0 2rem;

    .btn-radio {
      min-width: 75px;
    }
  }

  .filterContainer input {
    max-width: 100%;
  }

  .filterOptions {
    padding: 1.5em 0.5em 0.5em;
    width: 100%;
  }

  .show-mobile-sorting {
    display: block;
  }
}

@media screen and (max-width: 360px) {
  .filterContainer {
    margin: 0.5em 1em 0.5em;
  }
}
</style>
