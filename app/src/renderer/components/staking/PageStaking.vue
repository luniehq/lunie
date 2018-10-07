<template lang="pug">
tm-page(data-title="Staking", :title="config.devMode ? '' : 'Staking'")
  template(slot="menu-body")
    tm-balance(:tabs="tabs")

  div(slot="menu"): vm-tool-bar
    a(@click='connected && updateDelegates()' v-tooltip.bottom="'Refresh'" :disabled="!connected")
      i.material-icons refresh
    a(@click='setSearch()' v-tooltip.bottom="'Search'" :disabled="!somethingToSearch")
      i.search.material-icons search

  modal-search(type="delegates" v-if="somethingToSearch")

  router-view
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import { includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import { TmBtn, TmPage, TmDataEmpty, TmDataLoading } from "@tendermint/ui"
import DataEmptySearch from "common/TmDataEmptySearch"
import { calculateTokens } from "scripts/common"
import ModalSearch from "common/TmModalSearch"
import PanelSort from "staking/PanelSort"
import VmToolBar from "common/VmToolBar"
import TmBalance from "common/TmBalance"
export default {
  name: `page-staking`,
  components: {
    TmBtn,
    TmDataEmpty,
    DataEmptySearch,
    TmDataLoading,
    ModalSearch,
    TmPage,
    TmBalance,
    PanelSort,
    VmToolBar
  },
  data: () => ({
    num: num,
    query: ``,
    sort: {
      property: `percent_of_vote`,
      order: `desc`
    },
    tabs: [`My Delegations`, `Validators`]
  }),
  computed: {
    ...mapGetters([
      `delegates`,
      `delegation`,
      `filters`,
      `committedDelegations`,
      `config`,
      `connected`,
      `bondingDenom`,
      `keybase`
    ]),
    somethingToSearch() {
      return !!this.delegates.delegates.length
    },
    vpTotal() {
      return this.delegates.delegates
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
      return !this.somethingToSearch
        ? []
        : this.delegates.delegates.map(v => {
            v.small_moniker = v.description.moniker.toLowerCase()
            v.percent_of_vote = num.percent(v.voting_power / this.vpTotal)
            v.your_votes = this.num.pretty(
              calculateTokens(v, this.committedDelegations[v.id])
            )
            v.keybase = this.keybase[v.description.identity]
            return v
          })
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
    properties() {
      return [
        {
          title: `Moniker`,
          value: `small_moniker`,
          tooltip: `The validator's moniker`,
          class: `name`
        },
        {
          title: `Bonded ${this.bondingDenom}`,
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
          value: `uptime`, // TODO: use real uptime
          tooltip: `The validator's uptime`,
          class: `uptime`
        },
        {
          title: `Commission`,
          value: `commission`, // TODO: use real commission
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
  methods: {
    setSearch(bool = !this.filters[`delegates`].search.visible) {
      if (!this.somethingToSearch) return false
      this.$store.commit(`setSearchVisible`, [`delegates`, bool])
    }
  },
  async mounted() {
    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch(true))
    Mousetrap.bind(`esc`, () => this.setSearch(false))

    // XXX temporary because querying the shares shows old shares after bonding
    // this.updateDelegates()
  }
}
</script>
<style lang="stylus">
@require '~variables'

.fixed-button-bar
  background var(--app-fg)
  bottom 3rem + px
  display flex
  justify-content space-between
  left 0
  padding 0.5rem 1rem
  position fixed
  right 0
  z-index z(toolBar)

  .label
    color var(--txt)
    line-height 2rem

    strong
      font-weight bold

@media screen and (min-width: 768px)
  padding-bottom 4rem

.fixed-button-bar
  padding 1rem 1rem 1rem 2rem

@media screen and (min-width: 1024px)
  .fixed-button-bar
    margin-left width-side
</style>
