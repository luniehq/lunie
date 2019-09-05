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
        is="transition-group"
        v-infinite-scroll="loadMore"
        infinite-scroll-distance="400"
        name="flip-list"
      >
        <LiValidator
          v-for="(validator, index) in showingValidators"
          :key="validator.operator_address"
          :data-index="index"
          :index="index"
          :validator="validator"
          :show-on-mobile="showOnMobile"
          class="list-complete-item"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import orderBy from "lodash.orderby"
import LiValidator from "staking/LiValidator"
import PanelSort from "staking/PanelSort"
import { expectedReturns } from "scripts/returns"
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
    query: ``,
    sort: {
      property: `expectedReturns`,
      order: `desc`
    },
    showing: 15,
    rollingWindow: 10000 // param of slashing period
  }),
  computed: {
    ...mapState([`distribution`, `pool`, `session`]),
    ...mapState({
      annualProvision: state => state.minting.annualProvision
    }),
    ...mapGetters([`committedDelegations`, `bondDenom`, `lastHeader`]),
    enrichedValidators(
      {
        validators,
        pool,
        annualProvision,
        committedDelegations,
        session,
        distribution
      } = this
    ) {
      return validators.map(v => {
        return Object.assign({}, v, {
          small_moniker: v.moniker.toLowerCase(),
          my_delegations:
            session.signedIn && committedDelegations[v.operator_address] > 0
              ? committedDelegations[v.operator_address]
              : 0,
          rewards:
            session.signedIn && distribution.rewards[v.operator_address]
              ? distribution.rewards[v.operator_address][this.bondDenom]
              : 0,
          expectedReturns: annualProvision
            ? expectedReturns(
                v,
                parseInt(pool.pool.bonded_tokens),
                parseFloat(annualProvision)
              )
            : undefined
        })
      })
    },
    sortedEnrichedValidators() {
      return orderBy(
        this.enrichedValidators.slice(0),
        [this.sort.property],
        [this.sort.order]
      )
    },
    showingValidators() {
      return this.sortedEnrichedValidators.slice(0, this.showing)
    },
    properties() {
      return [
        {
          title: `Name`,
          value: `small_moniker`,
          tooltip: `The validator's moniker`
        },
        {
          title: `Rewards`,
          value: `expectedReturns`,
          tooltip: `Approximate annualized reward`
        },
        {
          title: `Voting Power`,
          value: `voting_power`,
          tooltip: `Percentage of voting shares`
        }
      ]
    }
  },
  watch: {
    lastHeader: {
      immediate: true,
      handler() {
        this.$store.dispatch(`getRewardsFromMyValidators`)
      }
    },
    "sort.property": function() {
      this.showing = 15
    },
    "sort.order": function() {
      this.showing = 15
    }
  },
  mounted() {
    this.$store.dispatch(`getPool`)
    this.$store.dispatch(`getRewardsFromMyValidators`)
    this.$store.dispatch(`getMintingParameters`)
  },
  methods: {
    loadMore() {
      this.showing += 10
    },
    beforeEnter: function(el) {
      el.style.opacity = 0
      el.style.height = 0
    },
    enter: function(el, done) {
      var delay = el.dataset.index * 150
      setTimeout(function() {
        Velocity(el, { opacity: 1, height: "1.6em" }, { complete: done })
      }, delay)
    },
    leave: function(el, done) {
      var delay = el.dataset.index * 150
      setTimeout(function() {
        Velocity(el, { opacity: 0, height: 0 }, { complete: done })
      }, delay)
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
