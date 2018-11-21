<template>
  <menu class="app-menu">
    <div class="app-menu-main">
      <tm-list-item
        id="app-menu__wallet"
        to="/"
        exact="exact"
        @click.native="close"
        title="Wallet"
      ></tm-list-item>
      <tm-list-item
        id="app-menu__transactions"
        to="/wallet/transactions"
        exact="exact"
        @click.native="close"
        title="Transactions"
        v-if="config.devMode || mockedConnector"
      ></tm-list-item>
      <tm-list-item
        id="app-menu__staking"
        to="/staking"
        exact="exact"
        @click.native="close"
        title="Staking"
        v-bind:class="{ active: isValidatorPage }"
      ></tm-list-item>
      <tm-list-item
        id="app-menu__proposals"
        to="/governance"
        exact="exact"
        @click.native="close"
        title="Governance"
        v-if="config.devMode || mockedConnector"
      ></tm-list-item>
    </div>
    <connected-network></connected-network>
  </menu>
</template>

<script>
import { mapGetters } from "vuex"
import PerfectScrollbar from "perfect-scrollbar"
import noScroll from "no-scroll"
import ConnectedNetwork from "common/TmConnectedNetwork"
import { TmListItem } from "@tendermint/ui"
import UserPane from "common/TmUserPane"
export default {
  name: `app-menu`,
  components: {
    ConnectedNetwork,
    TmListItem,
    UserPane
  },
  data: () => ({
    ps: {}
  }),
  computed: {
    ...mapGetters([`validators`, `config`, `lastHeader`, `mockedConnector`]),
    isValidatorPage() {
      return this.$route.params.validator
    }
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
  z-index: z(appMenu);
  user-select: none;
  display: flex;
  flex-flow: column nowrap;
}

.app-menu .app-menu-main {
  flex: 1;
  position: relative;
}

.app-menu .app-menu-main .tm-li {
  border-bottom: 1px solid var(--bc-dim);
}

.app-menu .tm-user {
  border-top: 1px solid var(--bc);
  padding: 1rem;
  display: flex;
}

.app-menu .tm-user .tm-user-info {
  flex: 1;
  display: flex;
}

.app-menu .tm-user .avatar {
  background: var(--link);
  width: 2rem;
  height: 2rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-menu .tm-user .avatar i {
  color: var(--txt);
}

.app-menu .tm-user .text {
  padding: 0 0.5rem;
}

.app-menu .tm-user .title {
  color: var(--txt);
}

.app-menu .tm-user .subtitle {
  font-size: xs;
  color: var(--dim);
}

.app-menu .tm-user .tm-btn {
  margin-right: 0.5rem;
}

.tm-li.tm-li-link.router-link-exact-active {
  color: var(--tertiary);
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
