<template lang="pug">
tm-page(data-title="Staking").staking
  template(slot="menu-body")
    tm-balance(:tabs="tabs")

    vm-tool-bar
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
