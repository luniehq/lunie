<template lang="pug">
  div
    h3
      | Your Validators
      |
      i.material-icons.info-button(v-tooltip.top="bondInfo") info_outline
    panel-sort(:sort='sort', :properties="properties")
    data-empty-search(v-if="yourValidators.length === 0")
    template(v-else)
      ol
        li-validator(v-for='validator in yourValidators' :key='validator.id' :validator='validator')
    .check-out-message
      | Check out
      |
      router-link(:to="{name: 'Validators'}") the validator list
      |
      | to spread some of your Atoms around.

    div(v-if="undelegatedValidators.length")
      h3
        | Your Undelegated Validators
        |
        i.material-icons.info-button(v-tooltip.top="unbondInfo") info_outline
    template(v-else)
      li-validator(v-for='validator in undelegatedValidators' :key='validator.id' :validator='validator')
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import { includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import LiValidator from "staking/LiValidator"
import { TmBtn, TmPage, TmDataEmpty, TmDataLoading } from "@tendermint/ui"
import DataEmptySearch from "common/TmDataEmptySearch"
import { calculateTokens } from "scripts/common"
import ModalSearch from "common/TmModalSearch"
import PanelSort from "staking/PanelSort"
import VmToolBar from "common/VmToolBar"
export default {
  name: `tab-my-delegations`,
  components: {
    LiValidator,
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
    query: ``,
    sort: {
      property: `percent_of_vote`,
      order: `desc`
    },
    bondInfo: `Validators you are currently bonded to`,
    unbondInfo: `Your bonded validators in unbonding process`
  }),
  computed: {
    ...mapGetters([
      `delegates`,
      `delegation`,
      `filters`,
      `shoppingCart`,
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
    undelegatedValidators(
      { delegates: { delegates }, delegation: { unbondingDelegations } } = this
    ) {
      const unbonding = new Set(Object.keys(unbondingDelegations))
      return delegates.filter(({ id }) => unbonding.has(id))
    },
    userCanDelegate() {
      return (
        (this.shoppingCart.length > 0 || this.user.atoms > 0) &&
        this.delegation.loadedOnce
      )
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
    },
    yourValidators({ committedDelegations, delegates: { delegates } } = this) {
      const committed = new Set(Object.keys(committedDelegations))
      return delegates.filter(({ id }) => committed.has(id))
    }
  },
  watch: {
    address: function(address) {
      address && this.updateDelegates()
    }
  },
  methods: {
    updateDelegates() {
      this.$store.dispatch(`updateDelegates`)
    },
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

h3
  margin 1em auto

.info-button
  color var(--link)

.check-out-message
  background var(--app-fg)
  margin-bottom 4rem
  margin-left 2rem
  padding 0.5rem
  text-align center
  font-size sm
  border-radius 0.25rem
  border 1px solid var(--bc-dim)

@media screen and (min-width: 768px)
  padding-bottom 4rem

.fixed-button-bar
  padding 1rem 1rem 1rem 2rem

@media screen and (min-width: 1024px)
  .fixed-button-bar
    margin-left width-side
</style>
