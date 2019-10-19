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
          :show-on-mobile="showOnMobile"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import orderBy from "lodash.orderby"
import LiValidator from "staking/LiValidator"
import PanelSort from "staking/PanelSort"

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
    showOnMobile: {
      type: String,
      default: () => "returns"
    }
  },
  data: () => ({
    sort: {
      property: `expectedReturns`,
      order: `desc`
    },
    showing: 15
  }),
  computed: {
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
</style>
