<template>
  <div>
    <table class="data-table">
      <thead>
        <PanelSort :properties="properties" show-on-mobile="endTime" />
      </thead>
      <tbody infinite-scroll-distance="400" name="flip-list">
        <LiUndelegation
          v-for="(undelegation, index) in undelegations"
          :key="undelegation.validatorAddress + undelegation.startHeight"
          :index="index"
          :validator="undelegation.validator"
          :undelegation="undelegation"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import LiUndelegation from "staking/LiUndelegation"
import PanelSort from "staking/PanelSort"

export default {
  name: `table-undelegations`,
  components: {
    LiUndelegation,
    PanelSort
  },
  props: {
    undelegations: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    query: ``,
    sort: {
      property: `endTime`,
      order: `desc`
    },
    showing: 15,
    rollingWindow: 10000 // param of slashing period
  }),
  computed: {
    properties() {
      return [
        {
          title: `Name`,
          value: `smallMoniker`,
          tooltip: `The validator's moniker`
        },
        {
          title: `End Time`,
          value: `endTime`,
          tooltip: `Time until the undelegation is re-added to your balance`
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

.data-table >>> th:first-child {
  width: 5%;
  color: var(--dim);
  font-size: var(--sm);
}

.data-table >>> th:nth-child(2) {
  width: 75%;
}
</style>
