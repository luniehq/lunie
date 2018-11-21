<template>
  <tm-page class="staking" data-title="Staking"
    ><template slot="menu-body">
      <tm-balance :tabs="tabs"></tm-balance>
      <vm-tool-bar
        ><a
          @click="connected &amp;&amp; updateDelegates()"
          v-tooltip.bottom="'Refresh'"
          :disabled="!connected"
          ><i class="material-icons">refresh</i></a
        ><a @click="setSearch()" v-tooltip.bottom="'Search'"
          ><i class="search material-icons">search</i></a
        ></vm-tool-bar
      >
    </template>
    <modal-search type="delegates"></modal-search>
    <router-view></router-view>
  </tm-page>
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
  async mounted() {
    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch(true))
    Mousetrap.bind(`esc`, () => this.setSearch(false))

    // XXX temporary because querying the shares shows old shares after bonding
    // this.updateDelegates()
  },
  methods: {
    setSearch(bool = !this.filters[`delegates`].search.visible) {
      this.$store.commit(`setSearchVisible`, [`delegates`, bool])
    },
    ...mapActions([`updateDelegates`])
  }
}
</script>
