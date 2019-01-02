<template>
  <menu class="app-menu">
    <div class="app-menu-main">
      <router-link
        id="app-menu__wallet"
        class="app-menu-item"
        to="/"
        exact="exact"
        title="Wallet"
        @click.native="close"
      >
        <h2 class="app-menu-title">Wallet</h2>
        <i class="material-icons">chevron_right</i>
      </router-link>
      <router-link
        v-if="config.devMode || mockedConnector"
        id="app-menu__transactions"
        class="app-menu-item"
        to="/transactions"
        exact="exact"
        title="Transactions"
        @click.native="close"
      >
        <h2 class="app-menu-title">Transactions</h2>
        <i class="material-icons">chevron_right</i>
      </router-link>
      <router-link
        id="app-menu__staking"
        class="app-menu-item"
        to="/staking"
        title="Staking"
        @click.native="close"
      >
        <h2 class="app-menu-title">Staking</h2>
        <i class="material-icons">chevron_right</i>
      </router-link>
      <router-link
        id="app-menu__proposals"
        class="app-menu-item"
        to="/governance"
        title="Governance"
        @click.native="close"
      >
        <h2 class="app-menu-title">Governance</h2>
        <i class="material-icons">chevron_right</i>
      </router-link>
    </div>
    <connected-network />
  </menu>
</template>

<script>
import { mapGetters } from "vuex"
import PerfectScrollbar from "perfect-scrollbar"
import noScroll from "no-scroll"
import ConnectedNetwork from "common/TmConnectedNetwork"
import TmListItem from "common/TmListItem"
export default {
  name: `app-menu`,
  components: {
    ConnectedNetwork,
    TmListItem
  },
  data: () => ({
    ps: {}
  }),
  computed: {
    ...mapGetters([`validators`, `config`, `lastHeader`, `mockedConnector`])
  },
  mounted() {
    this.ps = new PerfectScrollbar(this.$el.querySelector(`.app-menu-main`))
  },
  methods: {
    close() {
      this.$store.commit(`setActiveMenu`, ``)
      noScroll.off()
    }
  }
}
</script>

<style>
.app-menu {
  background: var(--app-nav);
  z-index: var(--z-appMenu);
  user-select: none;
  display: flex;
  flex-flow: column nowrap;
}
.app-menu .app-menu-main {
  flex: 1;
  position: relative;
}
.app-menu .app-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--bc-dim);
  padding: 1rem;
  color: var(--dim);
}
.app-menu .app-menu-item:hover {
  color: var(--bright);
  background: var(--hover-bg);
}
.app-menu .router-link-active {
  background: var(--hover-bg);
}
.app-menu .router-link-active i {
  color: var(--tertiary);
}
.app-menu .router-link-active h2 {
  color: var(--bright);
  font-weight: 500;
}
@media screen and (max-width: 1023px) {
  .app-menu {
    position: fixed;
    top: 3rem;
    left: 0;
    bottom: 0;
    width: 100vw;
    background: var(--app-bg);
    user-select: none;
  }
}
@media screen and (min-width: 1024px) {
  .app-menu {
    flex: 1;
  }
}
</style>
