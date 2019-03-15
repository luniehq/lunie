<template>
  <div>
    <table class="data-table">
      <thead>
        <panel-sort :sort="sort" :properties="properties" />
      </thead>
      <tbody>
        <li-validator
          v-for="i in sortedEnrichedDelegates"
          :key="i.operator_address"
          :disabled="!userCanDelegate"
          :validator="i"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import { orderBy } from "lodash"
import LiValidator from "staking/LiValidator"
import { calculateTokens } from "scripts/common"
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
      `liquidAtoms`,
      `connected`,
      `bondDenom`,
      `keybase`
    ]),
    vpTotal() {
      return this.validators
        .slice(0)
        .map(v => {
          v.voting_power = v.voting_power ? Number(v.voting_power) : 0
          return v
        })
        .sort((a, b) => b.voting_power - a.voting_power)
        .slice(0, 100)
        .reduce((sum, v) => sum + v.voting_power, 0)
    },
    enrichedDelegates() {
      return this.validators.map(v =>
        Object.assign({}, v, {
          small_moniker: v.description.moniker.toLowerCase(),
          percent_of_vote: v.voting_power / this.vpTotal,
          your_votes: this.num.full(
            calculateTokens(v, this.committedDelegations[v.id])
          ),
          commission: v.commission.rate,
          keybase: this.keybase[v.description.identity],
          uptime: v.signing_info
            ? (this.rollingWindow - v.signing_info.missed_blocks_counter)
            / this.rollingWindow : 0
        })
      )
    },
    sortedEnrichedDelegates() {
      return orderBy(
        this.enrichedDelegates.slice(0),
        [this.sort.property],
        [this.sort.order]
      )
    },
    userCanDelegate() {
      return this.liquidAtoms > 0 && this.delegation.loaded
    },
    properties() {
      return [
        {
          title: `Moniker`,
          value: `small_moniker`,
          tooltip: `The validator's moniker`,
          class: `name`
        },
        {
          title: `My Delegations`,
          value: `your_votes`,
          tooltip: `Number of ${
            this.bondDenom
          } you have delegated to this validator`,
          class: `your-votes`
        },
        {
          title: `Voting Power`,
          value: `percent_of_vote`,
          tooltip: `Percentage of voting shares`,
          class: `percent_of_vote`
        },
        {
          title: `Commission`,
          value: `commission`,
          tooltip: `The validator's commission`,
          class: `commission`
        },
        {
          title: `Uptime`,
          value: `uptime`,
          tooltip: `Ratio of blocks signed within the last 10k blocks`,
          class: `uptime`
        },
      ]
    }
  },
  watch: {
    address: function() {
      this.session.address && this.$store.dispatch(`updateDelegates`)
    },
    validators: function(validators) {
      if (!validators || validators.length === 0 || !this.session.signedIn) {
        return
      }

      this.$store.dispatch(`getRewardsFromAllValidators`, validators)
    }
  }
}
</script>
