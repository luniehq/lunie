<template>
  <div>
    <transition name="fade">
      <ul v-if="showMobileSorting" class="sortingOptions">
        <li
          :class="{ active: isSortedBy(`popularity`) }"
          @click="sortBy(`popularity`)"
        >
          <i class="sorting-icon material-icons notranslate">star_rate</i>
          Popular on Lunie
          <i
            :class="{ inactive: !isSortedBy(`popularity`) }"
            class="sorting-check material-icons notranslate"
            >check</i
          >
        </li>
        <li
          :class="{ active: isSortedBy(`votingPower`) }"
          @click="sortBy(`votingPower`)"
        >
          <i class="sorting-icon material-icons notranslate">flash_on</i> Voting
          Power
          <i
            :class="{ inactive: !isSortedBy(`votingPower`) }"
            class="sorting-check material-icons notranslate"
            >check</i
          >
        </li>
        <li
          :class="{ active: isSortedBy(`expectedReturns`) }"
          @click="sortBy(`expectedReturns`)"
        >
          <i class="sorting-icon material-icons notranslate">emoji_events</i>
          Most Rewards
          <i
            :class="{ inactive: !isSortedBy(`expectedReturns`) }"
            class="sorting-check material-icons notranslate"
            >check</i
          >
        </li>
      </ul>
    </transition>
    <table class="data-table">
      <thead :class="{ shrinked: showMobileSorting }">
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
          :staking-denom="stakingDenom"
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
import gql from "graphql-tag"

export default {
  name: `table-validators`,
  components: {
    LiValidator,
    PanelSort,
  },
  props: {
    validators: {
      type: Array,
      required: true,
    },
    delegations: {
      type: Array,
      default: () => [],
    },
    showOnMobile: {
      type: String,
      default: () => "returns",
    },
    showMobileSorting: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    rewards: [],
    sort: {
      property: ``,
      order: `desc`,
    },
    showing: 15,
  }),
  computed: {
    ...mapGetters([`address`, `network`, `stakingDenom`]),
    sortedEnrichedValidators() {
      const orderedValidators = orderBy(
        this.validators.map((validator) => ({
          ...validator,
          smallName: validator.name ? validator.name.toLowerCase() : "",
        })),
        [this.sort.property],
        [this.sort.order]
      )
      return orderedValidators
    },
    showingValidators() {
      return this.sortedEnrichedValidators.slice(0, this.showing)
    },
    properties() {
      return [
        {
          title: `Status`,
          value: `status`,
          tooltip: `Validation status of the validator`,
        },
        {
          title: `Name`,
          value: `smallName`,
          tooltip: `The validator's name`,
        },
        {
          title: `Rewards`,
          value: `expectedReturns`,
          tooltip: `Approximate annualized reward`,
        },
        {
          title: `Voting Power`,
          value: `votingPower`,
          tooltip: `Percentage of voting shares`,
        },
      ]
    },
  },
  watch: {
    address: {
      handler() {
        if (!this.address) {
          this.rewards = []
        }
      },
    },
  },
  mounted() {
    this.$apollo.queries.rewards.startPolling(1000 * 60 * 5)
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
      if (this.rewards) {
        return (
          this.rewards
            /* istanbul ignore next */
            .filter(
              ({ validator }) => validator.operatorAddress === operatorAddress
            )
        )
      }
    },
    sortBy(property) {
      if (this.sort.property === property) {
        this.sort.property = ``
        this.sort.order = `desc`
      } else {
        this.sort.property = property
        this.sort.order = `desc`
      }
    },
    isSortedBy(property) {
      return this.sort.property === property
    },
  },
  apollo: {
    rewards: {
      query: gql`
        query rewards($networkId: String!, $delegatorAddress: String!) {
          rewards(networkId: $networkId, delegatorAddress: $delegatorAddress) {
            id
            validator {
              operatorAddress
            }
            amount
            denom
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
      update: (result) => {
        return result.rewards || []
      },
    },
    $subscribe: {
      blockAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.network,
          }
        },
        /* istanbul ignore next */
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
        /* istanbul ignore next */
        result() {
          this.$apollo.queries.rewards.refetch()
        },
      },
    },
  },
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

.sortingOptions {
  margin: 0.5rem 1rem;
}

.sortingOptions li.active {
  color: var(--highlight);
}

.sortingOptions li {
  padding: 1rem 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.sorting-check {
  justify-content: space-between;
}

.sorting-check.inactive {
  color: var(--app-bg);
}

.sortingOptions .material-icons {
  font-size: 22px;
  width: 2rem;
  vertical-align: text-bottom;
}

.shrinked .panel-sort-container {
  visibility: collapse;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

@media screen and (min-width: 768px) {
  .sortingOptions {
    display: none;
  }

  .shrinked .panel-sort-container {
    visibility: initial;
  }
}
</style>
