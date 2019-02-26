<template>
  <div>
    <table class="data-table">
      <thead>
        <panel-sort :sort="sort" :properties="properties" />
      </thead>
      <tbody>
        <li-validator
          v-for="i in sortedEnrichedDelegates"
          :key="i.id"
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
    // TODO do we really need to make this a prop? the component takes everything else from the store
    validators: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    num: num,
    query: ``,
    sort: {
      property: `percent_of_vote`,
      order: `desc`
    }
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
    signedIn() {
      return this.session.signedIn
    },
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
          percent_of_vote: num.percent(v.voting_power / this.vpTotal),
          your_votes: this.num.full(
            calculateTokens(v, this.committedDelegations[v.id])
          ),
          keybase: this.keybase[v.description.identity]
        })
      )
    },
    sortedEnrichedDelegates() {
      return orderBy(
        this.enrichedDelegates.slice(0),
        [this.sort.property, `small_moniker`],
        [this.sort.order, `asc`]
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
          title: `Rewards`,
          value: `your_rewards`, // TODO: use real rewards
          tooltip: `Rewards you have earned from this validator`,
          class: `your-rewards`
        },
        {
          title: `Voting Power`,
          value: `percent_of_vote`,
          tooltip: `Percentage of voting shares`,
          class: `percent_of_vote`
        },
        {
          title: `Uptime`,
          value: `uptime`,
          tooltip: `Ratio of blocks signed within the last 10k blocks`,
          class: `uptime`
        },
        {
          title: `Commission`,
          value: `commission`,
          tooltip: `The validator's commission`,
          class: `commission`
        },
        {
          title: `Slashes`,
          value: `slashes`, // TODO: use real slashes
          tooltip: `The validator's slashes`,
          class: `slashes`
        }
      ]
    }
  },
  watch: {
    signedIn: function(signedIn) {
      signedIn && this.updateDelegates()
    }
  },
  mounted() {
    this.updateDelegates()
  },
  methods: {
    updateDelegates() {
      this.$store.dispatch(`updateDelegates`)
    }
  }
}
</script>
