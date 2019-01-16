<template>
  <tm-page class="staking" data-title="Staking"
    ><template slot="menu-body">
      <tm-balance :tabs="tabs" />
      <tool-bar
        ><a
          v-tooltip.bottom="'Refresh'"
          :disabled="!connected"
          @click="connected && updateDelegates()"
          ><i class="material-icons">refresh</i></a
        ><a v-tooltip.bottom="'Search'" @click="setSearch()"
          ><i class="search material-icons">search</i></a
        ></tool-bar
      >
    </template>
    <modal-search type="delegates" />
    <router-view />
  </tm-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import Mousetrap from "mousetrap"
import TmPage from "common/TmPage"
import ModalSearch from "common/TmModalSearch"
import PerfectScrollbar from "perfect-scrollbar"
import ToolBar from "common/ToolBar"
import TmBalance from "common/TmBalance"
export default {
  name: `page-staking`,
  components: {
    ModalSearch,
    TmPage,
    TmBalance,
    ToolBar
  },
  data: () => ({
    query: ``,
    tabs: [
      {
        displayName: `My Delegations`,
        pathName: `My Delegations`
      },
      {
        displayName: `Validators`,
        pathName: `Validators`
      },
      {
        displayName: `Parameters`,
        pathName: `Staking Parameters`
      }
    ]
  }),
  computed: {
    ...mapGetters([`connected`, `delegates`, `filters`])
  },
  mounted() {
    this.ps = new PerfectScrollbar(this.$el.querySelector(`.tm-page-main`))

    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch(true))
    Mousetrap.bind(`esc`, () => this.setSearch(false))

    // XXX temporary because querying the shares shows old shares after bonding
    // this.updateDelegates()
  },
  updated() {
    this.$el.querySelector(`.tm-page-main`).scrollTop = 0
  },
  methods: {
    setSearch(bool = !this.filters[`delegates`].search.visible) {
      this.$store.commit(`setSearchVisible`, [`delegates`, bool])
    },
    ...mapActions([`updateDelegates`])
  }
}
</script>
