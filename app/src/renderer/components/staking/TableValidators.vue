<template>
  <div>
    <table class="data-table">
      <thead>
        <panel-sort :sort="sort" :properties="properties" />
      </thead>
      <tbody>
        <li-validator
          v-for="validator in sortedEnrichedValidators"
          :key="validator.operator_address"
          :validator="validator"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import { orderBy, isEmpty } from "lodash"
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
    }
  },
  data: () => ({
    num: num,
    query: ``,
    sort: {
      property: `commission`,
      order: `asc`
    },
    rollingWindow: 10000 // param of slashing period
  }),
  computed: {
    ...mapGetters([
      `delegation`,
      `committedDelegations`,
      `session`,
      `distribution`,
      `liquidAtoms`,
      `bondDenom`,
      `keybase`,
      `pool`
    ]),
    enrichedValidators() {
      return this.validators.map(v =>
        Object.assign({}, v, {
          small_moniker: v.description.moniker.toLowerCase(),
          percent_of_vote: v.voting_power / this.pool.pool.bonded_tokens,
          my_delegations: this.committedDelegations[v.id] > 0
            ? this.committedDelegations[v.id]
            : 0,
          commission: v.commission.rate,
          keybase: this.keybase[v.description.identity],
          rewards: this.session.signedIn
            && this.distribution.loaded && !isEmpty(this.distribution.rewards)
            ? this.distribution.rewards[v.operator_address]
            : 0,
          uptime: v.signing_info
            ? (this.rollingWindow - v.signing_info.missed_blocks_counter)
            / this.rollingWindow
            : 0
        })
      )
    },
    sortedEnrichedValidators() {
      return orderBy(
        this.enrichedValidators.slice(0),
        [this.sort.property],
        [this.sort.order]
      )
    },
    properties() {
      return [
        {
          title: `Moniker`,
          value: `small_moniker`,
          tooltip: `The validator's moniker`
        },
        {
          title: `My Delegations`,
          value: `my_delegations`,
          tooltip: `Number of ${
            this.bondDenom
          } you have delegated to this validator`
        },
        {
          title: `Rewards`,
          value: `rewards`,
          tooltip: `Rewards you have earned from this validator`
        },
        {
          title: `Voting Power`,
          value: `percent_of_vote`,
          tooltip: `Percentage of voting shares`
        },
        {
          title: `Commission`,
          value: `commission`,
          tooltip: `The validator's commission`
        },
        {
          title: `Uptime`,
          value: `uptime`,
          tooltip: `Ratio of blocks signed within the last 10k blocks`
        },
      ]
    }
  },
  watch: {
  //   address: function() {
  //     this.session.address && this.$store.dispatch(`updateDelegates`)
  //   },
    validators: function(validators) {
      if (!validators || validators.length === 0 || !this.session.signedIn) {
        return
      }
      const yourValidators = validators.filter(
        ({ operator_address }) => operator_address in this.committedDelegations
      )

      this.$store.dispatch(`getRewardsFromAllValidators`, yourValidators)
    }
  },
  mounted() {
    this.$store.dispatch(`getPool`)
  }
}
</script>
