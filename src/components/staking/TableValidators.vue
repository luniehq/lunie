<template>
  <div>
    <table class="data-table">
      <thead>
        <PanelSort
          :sort="sort"
          :properties="properties"
          :show-on-mobile="showOnMobile"
        />
      </thead>
      <tbody
        v-infinite-scroll="loadMore"
        infinite-scroll-distance="400"
        name="flip-list"
      >
        <LiValidator
          v-for="(validator, index) in showingValidators"
          :key="validator.operatorAddress"
          :index="index"
          :validator="validator"
          :delegation="getDelegation(validator)"
          :rewards="getRewards(validator)"
          :show-on-mobile="showOnMobile"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import orderBy from "lodash.orderby"
import LiValidator from "staking/LiValidator"
import PanelSort from "staking/PanelSort"
import { UserTransactionAdded } from "src/gql"
import gql from "graphql-tag"

export default {
  name: `table-validators`,
  components: {
    LiValidator,
    PanelSort
  },
  props: {
    validators: {
      type: Array,
      required: true
    },
    delegations: {
      type: Array,
      default: () => []
    },
    showOnMobile: {
      type: String,
      default: () => "returns"
    }
  },
  data: () => ({
    rewards: [],
    sort: {
      property: `expectedReturns`,
      order: `desc`
    },
    showing: 15
  }),
  computed: {
    ...mapGetters([`address`, `network`]),
    sortedEnrichedValidators() {
      return orderBy(
        this.validators.slice(0, this.showing),
        [this.sort.property],
        [this.sort.order]
      )
    },
    showingValidators() {
      return this.sortedEnrichedValidators.map(validator => ({
        ...validator,
        smallName: validator.name ? validator.name.toLowerCase() : ""
      }))
    },
    properties() {
      return [
        {
          title: `Status`,
          value: `status`,
          tooltip: `Validation status of the validator`
        },
        {
          title: `Name`,
          value: `smallName`,
          tooltip: `The validator's name`
        },
        {
          title: `Rewards`,
          value: `expectedReturns`,
          tooltip: `Approximate annualized reward`
        },
        {
          title: `Voting Power`,
          value: `votingPower`,
          tooltip: `Percentage of voting shares`
        }
      ]
    }
  },
  watch: {
    "sort.property": function() {
      this.showing = 15
    },
    "sort.order": function() {
      this.showing = 15
    }
  },
  methods: {
    loadMore() {
      this.showing += 10
    },
    getDelegation({ operatorAddress }) {
      return this.delegations.find(
        ({ validator }) => validator.operatorAddress === operatorAddress
      )
    },
    getRewards({ operatorAddress }) {
      return this.rewards.find(
        ({ validator }) => validator.operatorAddress === operatorAddress
      )
    }
  },
  apollo: {
    rewards: {
      query: gql`
        query Rewards($networkId: String!, $delegatorAddress: String!) {
          rewards(networkId: $networkId, delegatorAddress: $delegatorAddress) {
            validator {
              operatorAddress
            }
            amount
          }
        }
      `,
      skip() {
        return !this.address
      },
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.address
        }
      },
      update: result => result.rewards || []
    },
    $subscribe: {
      blockAdded: {
        variables() {
          return {
            networkId: this.network
          }
        },
        query() {
          return gql`
            subscription($networkId: String!) {
              blockAdded(networkId: $networkId) {
                height
                chainId
              }
            }
          `
        },
        result() {
          this.$apollo.queries.rewards.refetch()
        }
      }
    }
  }
}
</script>
<style scoped>
@media screen and (max-width: 550px) {
  .data-table td {
    overflow: hidden;
  }

  .data-table__row__info {
    max-width: 22rem;
  }
}

.flip-list-move {
  transition: transform 0.3s;
}

.data-table >>> th:first-child {
  width: 5%;
  color: var(--dim);
  font-size: var(--sm);
}

.data-table >>> th:nth-child(2) {
  width: 10%;
  color: var(--dim);
  font-size: var(--sm);
}

.data-table >>> th:nth-child(3) {
  width: 50%;
}
</style>
