<template>
  <menu>
    <router-link
      class="mobile-menu-item"
      :to="{ name: 'portfolio', params: { networkId: networkSlug } }"
      exact="exact"
      title="Portfolio"
    >
      <i class="material-icons notranslate">star</i>
      <h2 class="app-menu-title">Portfolio</h2>
    </router-link>
    <router-link
      class="mobile-menu-item"
      :to="{ name: 'validators', params: { networkId: networkSlug } }"
      title="Validators"
    >
      <i class="material-icons notranslate">sort</i>
      <h2 class="app-menu-title">Validators</h2>
    </router-link>
    <router-link
      class="mobile-menu-item"
      :to="{ name: 'proposals', params: { networkId: networkSlug } }"
      title="Proposals"
    >
      <i class="material-icons notranslate">add_circle_outline</i>
      <h2 class="app-menu-title">Proposals</h2>
    </router-link>
    <router-link
      class="mobile-menu-item"
      :to="{ name: 'transactions', params: { networkId: networkSlug } }"
      exact="exact"
      title="Transactions"
    >
      <i class="material-icons notranslate">show_chart</i>
      <h2 class="app-menu-title">Transactions</h2>
    </router-link>
    <router-link
      class="mobile-menu-item"
      to="/networks"
      exact="exact"
      title="Networks"
    >
      <i class="material-icons notranslate">public</i>
      <h2 class="app-menu-title">Networks</h2>
    </router-link>
  </menu>
</template>

<script>
import { mapState } from "vuex"
export default {
  name: `mobile-menu`,
  computed: {
    ...mapState(["connection"]),
    networkSlug() {
      return this.connection.networkSlug
    },
  },
}
</script>

<style scoped>
menu {
  position: fixed;
  bottom: 0;
  width: 100vw;
  display: flex;
  z-index: calc(var(--z-appHeader) - 2);
  background: var(--app-nav);
  flex-flow: row;
  align-items: center;
  justify-content: center;
}

menu a {
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 0.4rem;
  width: 25%;
}

menu a i {
  font-size: 18px;
}

.mobile-menu-item.router-link-active {
  color: var(--highlight);
}

menu a:not(.router-link-active) {
  color: var(--menu-bright);
}

menu a h2 {
  padding-top: 2px;
  font-size: 8px;
  font-weight: 500;
}

@media screen and (min-width: 1024px) {
  menu {
    display: none;
  }
}

/* iPhone X and Xs Max */
@media only screen and (min-device-width: 375px) and (min-device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait) {
  .mobile-menu-item {
    padding-bottom: 1.5rem;
  }
}

/* iPhone XR */
@media only screen and (min-device-width: 414px) and (min-device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait) {
  .mobile-menu-item {
    padding-bottom: 1.5rem;
  }
}
</style>
