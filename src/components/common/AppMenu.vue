<template>
  <menu class="app-menu">
    <div class="app-menu-main">
      <router-link
        id="app-menu__wallet"
        class="app-menu-item"
        to="/wallet"
        exact="exact"
        title="Wallet"
        @click.native="close"
      >
        <h2 class="app-menu-title">
          Wallet
        </h2>
        <i class="material-icons">chevron_right</i>
      </router-link>
      <router-link
        id="app-menu__transactions"
        class="app-menu-item"
        to="/transactions"
        exact="exact"
        title="Transactions"
        @click.native="close"
      >
        <h2 class="app-menu-title">
          Transactions
        </h2>
        <i class="material-icons">chevron_right</i>
      </router-link>
      <router-link
        id="app-menu__staking"
        class="app-menu-item"
        to="/staking"
        title="Staking"
        @click.native="close"
      >
        <h2 class="app-menu-title">
          Staking
        </h2>
        <i class="material-icons">chevron_right</i>
      </router-link>
      <router-link
        id="app-menu__proposals"
        class="app-menu-item"
        to="/governance"
        title="Governance"
        @click.native="close"
      >
        <h2 class="app-menu-title">
          Governance
        </h2>
        <i class="material-icons">chevron_right</i>
      </router-link>
      <router-link
        id="app-menu__network"
        class="app-menu-item"
        to="/"
        exact="exact"
        title="Network"
        @click.native="close"
      >
        <h2 class="app-menu-title">
          Network
        </h2>
        <i class="material-icons">chevron_right</i>
      </router-link>
      <a
        v-if="session.signedIn"
        id="mobile-sign-out"
        class="button app-menu-item"
        @click="signOut()"
      >
        Sign out
      </a>
      <a
        v-if="!session.signedIn"
        id="mobile-sign-in"
        class="button app-menu-item"
        @click="signIn()"
      >
        Sign in
      </a>
    </div>
    <ConnectedNetwork />
  </menu>
</template>

<script>
import PerfectScrollbar from "perfect-scrollbar"
import noScroll from "no-scroll"
import ConnectedNetwork from "common/TmConnectedNetwork"
import { mapGetters } from "vuex"
export default {
  name: `app-menu`,
  components: {
    ConnectedNetwork
  },
  data: () => ({
    ps: {}
  }),
  computed: {
    ...mapGetters([`session`])
  },
  mounted() {
    this.ps = new PerfectScrollbar(this.$el.querySelector(`.app-menu-main`))
  },
  methods: {
    close() {
      this.$emit(`close`)
      noScroll.off()
    },
    signOut() {
      this.$emit(`close`)
      this.$store.dispatch(`signOut`)
    },
    signIn() {
      this.$router.push(`welcome`)
      this.$emit(`close`)
    }
  }
}
</script>

<style scoped>
.app-menu {
  z-index: var(--z-appMenu);
  user-select: none;
  display: block;
  flex-flow: column nowrap;
  position: relative;
}

.app-menu .app-menu-main {
  flex: 1;
  position: relative;
}

.app-menu .app-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  margin: 0.5rem;
  font-weight: 400;
  color: var(--text);
  border-radius: 0.25rem;
}

.app-menu-item-small:hover {
  color: var(--link);
}

.app-menu .app-menu-item:not(.app-menu-item--link):hover {
  color: var(--bright);
  background: var(--app-fg);
}

.app-menu .app-menu-item--link {
  display: block;
  font-size: 14px;
  padding: 0 0.75rem;
  margin: 0.5rem;
  font-weight: 400;
  color: var(--dim);
}

.app-menu .app-menu-item--link:hover {
  color: var(--link);
}

.app-menu .app-menu-item.router-link-active {
  background: var(--app-fg);
}

.app-menu .app-menu-item.router-link-active i {
  color: var(--tertiary);
}

.app-menu .app-menu-item.router-link-active h2 {
  color: var(--bright);
  font-weight: 500;
}

.app-menu .button {
  color: var(--link);
  font-size: var(--lg);
}

@media screen and (max-width: 1023px) {
  .app-menu {
    background: var(--app-nav);
    height: 100vh;
  }

  .app-menu .app-menu-item {
    padding: 0.75rem;
  }

  .app-menu-title {
    font-size: var(--xxl);
    line-height: 1.125;
    font-weight: 600;
    letter-spacing: 0.004em;
    color: var(--bright);
  }
}

@media screen and (min-width: 1023px) {
  .app-menu {
    width: var(--width-side);
  }

  .app-menu .button {
    display: none;
  }
}
</style>
