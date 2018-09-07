<template lang="pug">
tm-page(title='Staking')
  div(slot="menu"): vm-tool-bar
    a(@click='connected && updateDelegates()' v-tooltip.bottom="'Refresh'" :disabled="!connected")
      i.material-icons refresh
    a(@click='setSearch()' v-tooltip.bottom="'Search'" :disabled="!somethingToSearch")
      i.search.material-icons search

  modal-search(type="delegates" v-if="somethingToSearch")
  .delegates-tabs
    .tab(v-for="(tab, i) in tabs",
      :key="'tab-' + i",
      :class="{'tab-selected': i === tabIndex}",
      @click="tabIndex = 1") {{tab}}
  .delegates-container
    tm-data-loading(v-if="delegates.loading && sortedFilteredEnrichedDelegates.length === 0")
    tm-data-empty(v-else-if="!delegates.loading && delegates.delegates.length === 0")
    data-empty-search(v-else-if="!delegates.loading && sortedFilteredEnrichedDelegates.length === 0")
    template(v-else)
      panel-sort(:sort='sort', :properties="properties")
      li-delegate(v-for='i in sortedFilteredEnrichedDelegates' :key='i.id' :delegate='i')

  .fixed-button-bar(v-if="!delegates.loading")
    template(v-if="userCanDelegate")
      .label #[strong {{ shoppingCart.length }}] validators selected
      tm-btn(id="go-to-bonding-btn" type="link" to="/staking/bond" :disabled="shoppingCart.length === 0" icon="chevron_right" icon-pos="right" value="Next" color="primary")
    template(v-else)
      .label You do not have any {{bondingDenom}}s to stake.
      tm-btn(disabled icon="chevron_right" icon-pos="right" value="Next" color="primary")
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import { includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import LiDelegate from "staking/LiDelegate"
import { TmBtn, TmPage, TmDataEmpty, TmDataLoading } from "@tendermint/ui"
import DataEmptySearch from "common/TmDataEmptySearch"

import ModalSearch from "common/TmModalSearch"
import PanelSort from "staking/PanelSort"
import VmToolBar from "common/VmToolBar"
export default {
  name: "page-staking",
  components: {
    LiDelegate,
    TmBtn,
    TmDataEmpty,
    DataEmptySearch,
    TmDataLoading,
    ModalSearch,
    TmPage,
    PanelSort,
    VmToolBar
  },
  data: () => ({
    num: num,
    query: "",
    sort: {
      property: "percent_of_vote",
      order: "desc"
    },
    tabIndex: 0,
    tabs: ["My Stake", "Validators"]
  }),
  computed: {
    ...mapGetters([
      "delegates",
      "filters",
      "shoppingCart",
      "committedDelegations",
      "config",
      "user",
      "connected",
      "bondingDenom",
      "keybase"
    ]),
    address() {
      return this.user.address
    },
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
            v.your_votes = this.num.prettyInt(this.committedDelegations[v.id])
            v.keybase = this.keybase[v.description.identity]
            return v
          })
    },
    sortedFilteredEnrichedDelegates() {
      let query = this.filters.delegates.search.query || ""
      let sortedEnrichedDelegates = orderBy(
        this.enrichedDelegates.slice(0),
        [this.sort.property, "small_moniker"],
        [this.sort.order, "asc"]
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
      return this.shoppingCart.length > 0 || this.user.atoms > 0
    },
    properties() {
      return [
        {
          title: "Moniker",
          value: "small_moniker",
          tooltip: "The validator's moniker",
          class: "name"
        },
        {
          title: `My Stake`,
          value: "your_votes",
          tooltip: `Number of ${
            this.bondingDenom
          } you have staked to the validator`,
          class: "your-votes"
        },
        {
          title: `My Rewards`,
          value: "your_rewards", // TODO: use real rewards
          tooltip: `Rewards of ${
            this.bondingDenom
          } you have gained from the validator`,
          class: "your-rewards" // TODO: use real rewards
        },
        {
          title: `Voting Power`,
          value: "percent_of_vote",
          tooltip: `Percentage of ${
            this.bondingDenom
          } the validator has on The Cosmos Hub`,
          class: "percent_of_vote"
        },
        {
          title: "Uptime",
          value: "uptime", // TODO: use real uptime
          tooltip: "The validator's uptime",
          class: "uptime"
        },
        {
          title: "Commission",
          value: "commission", // TODO: use real commission
          tooltip: "The validator's commission",
          class: "commission"
        },
        {
          title: "Slashes",
          value: "slashes", // TODO: use real slashes
          tooltip: "The validator's slashes",
          class: "slashes"
        },
        {
          title: "",
          value: "",
          class: "action hidden"
        }
      ]
    }
  },
  watch: {
    address: function(address) {
      address && this.updateDelegates()
    }
  },
  methods: {
    updateDelegates() {
      this.$store.dispatch("updateDelegates")
    },
    setSearch(bool = !this.filters["delegates"].search.visible) {
      if (!this.somethingToSearch) return false
      this.$store.commit("setSearchVisible", ["delegates", bool])
    }
  },
  async mounted() {
    Mousetrap.bind(["command+f", "ctrl+f"], () => this.setSearch(true))
    Mousetrap.bind("esc", () => this.setSearch(false))

    // XXX temporary because querying the shares shows old shares after bonding
    // this.updateDelegates()
  }
}
</script>
<style lang="stylus">
@require '~variables'

.delegates-tabs
  display flex

  .tab
    cursor pointer
    margin 0 .5em
    padding-bottom 0.5em
    margin-bottom 1em
    &:first-of-type
      cursor not-allowed
    &.tab-selected
      color var(--bright)
      border-bottom 2px solid var(--tertiary)

.delegates-container
  padding-bottom 3rem

.fixed-button-bar
  padding 0.5rem 1rem
  background var(--app-fg)
  display flex
  justify-content space-between
  position fixed
  bottom 3rem + px
  left 0
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
