<template>
  <div>
    <data-empty-search
      v-if="!delegates.loading && sortedFilteredEnrichedDelegates.length === 0"
    />
    <table v-else class="data-table">
      <thead>
        <panel-sort :sort="sort" :properties="properties" />
      </thead>
      <tbody>
        <li-validator
          v-for="i in sortedFilteredEnrichedDelegates"
          :disabled="!userCanDelegate"
          :key="i.id"
          :validator="i"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import { includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import LiValidator from "staking/LiValidator"
import DataEmptySearch from "common/TmDataEmptySearch"
import { calculateTokens } from "scripts/common"
import ModalSearch from "common/TmModalSearch"
import PanelSort from "staking/PanelSort"
import VmToolBar from "common/VmToolBar"
export default {
  name: `table-validators`,
  components: {
    LiValidator,
    DataEmptySearch,
    ModalSearch,
    PanelSort,
    VmToolBar
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
      property: `percent_of_vote`,
      order: `desc`
    }
  }),
  computed: {
    ...mapGetters([
      `delegates`,
      `delegation`,
      `filters`,
      `committedDelegations`,
      `config`,
      `user`,
      `connected`,
      `bondingDenom`,
      `keybase`
    ]),
    address() {
      return this.user.address
    },
    somethingToSearch() {
      return !!this.validators.length
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
    sortedFilteredEnrichedDelegates() {
      let query = this.filters.delegates.search.query || ``
      let sortedEnrichedDelegates = orderBy(
        this.enrichedDelegates.slice(0),
        [this.sort.property, `small_moniker`],
        [this.sort.order, `asc`]
      )
      if (this.filters.delegates.search.visible) {
        return sortedEnrichedDelegates.filter(i =>
          includes(JSON.stringify(i).toLowerCase(), query.toLowerCase())
        )
      } else {
        return sortedEnrichedDelegates
      }
    },
    userCanDelegate() {
      return this.user.atoms > 0 && this.delegation.loaded
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
          title: `Delegated ${this.bondingDenom}`,
          value: `your_votes`,
          tooltip: `Number of ${
            this.bondingDenom
          } you have delegated to the validator`,
          class: `your-votes`
        },
        {
          title: `Rewards`,
          value: `your_rewards`, // TODO: use real rewards
          tooltip: `Rewards of ${
            this.bondingDenom
          } you have gained from the validator`,
          class: `your-rewards` // TODO: use real rewards
        },
        {
          title: `Voting Power`,
          value: `percent_of_vote`,
          tooltip: `Percentage of ${
            this.bondingDenom
          } the validator has on The Cosmos Hub`,
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
    address: function(address) {
      address && this.updateDelegates()
    }
  },
  async mounted() {
    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch(true))
    Mousetrap.bind(`esc`, () => this.setSearch(false))

    // XXX temporary because querying the shares shows old shares after bonding
    // this.updateDelegates()
  },
  methods: {
    updateDelegates() {
      this.$store.dispatch(`updateDelegates`)
    },
    setSearch(
      bool = !this.filters[`delegates`].search.visible,
      { somethingToSearch, $store } = this
    ) {
      if (somethingToSearch) {
        $store.commit(`setSearchVisible`, [`delegates`, bool])
      }
    }
  }
}
</script>
