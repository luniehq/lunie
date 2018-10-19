<template lang="pug">
tm-page(data-title="Staking")
  template(slot="menu-body")
    tm-balance(:tabs="tabs")

  div(slot="menu"): vm-tool-bar
    a(@click='connected && updateDelegates()' v-tooltip.bottom="'Refresh'" :disabled="!connected")
      i.material-icons refresh
    a(@click='setSearch()' v-tooltip.bottom="'Search'")
      i.search.material-icons search

  modal-search(type="delegates")

  router-view
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import Mousetrap from "mousetrap"
import { TmPage } from "@tendermint/ui"
import ModalSearch from "common/TmModalSearch"
import VmToolBar from "common/VmToolBar"
import TmBalance from "common/TmBalance"
export default {
  name: `page-staking`,
  components: {
    ModalSearch,
    TmPage,
    TmBalance,
    VmToolBar
  },
  data: () => ({
    query: ``,
    tabs: [`My Delegations`, `Validators`]
  }),
  computed: {
    ...mapGetters([`connected`, `delegates`, `filters`])
  },
  methods: {
    setSearch(bool = !this.filters[`delegates`].search.visible) {
      this.$store.commit(`setSearchVisible`, [`delegates`, bool])
    },
    ...mapActions([`updateDelegates`])
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
