<template>
  <menu class="app-menu">
    <div class="app-menu-main">
      <router-link
        class="app-menu-item hide-xs"
        to="/portfolio"
        exact="exact"
        title="Portfolio"
        @click.native="close"
      >
        <h2 class="app-menu-title">Portfolio</h2>
        <i class="material-icons">chevron_right</i>
      </router-link>
      <router-link
        class="app-menu-item hide-xs"
        to="/validators"
        title="Validators"
        @click.native="close"
      >
        <h2 class="app-menu-title">Validators</h2>
        <i class="material-icons">chevron_right</i>
      </router-link>

      <router-link
        class="app-menu-item hide-xs"
        to="/proposals"
        title="Proposals"
        @click.native="close"
      >
        <h2 class="app-menu-title">Proposals</h2>
        <i class="material-icons">chevron_right</i>
      </router-link>

      <router-link
        class="app-menu-item hide-xs"
        to="/transactions"
        exact="exact"
        title="Transactions"
        @click.native="close"
      >
        <h2 class="app-menu-title">Activity</h2>
        <i class="material-icons">chevron_right</i>
      </router-link>

      <router-link
        class="app-menu-item hide-m"
        to="/about"
        exact="exact"
        title="About"
        @click.native="close"
      >
        <h2 class="app-menu-title">About</h2>
      </router-link>

      <router-link
        class="app-menu-item hide-m"
        to="/careers"
        exact="exact"
        title="Careers"
        @click.native="close"
      >
        <h2 class="app-menu-title">Careers</h2>
      </router-link>

      <router-link
        class="app-menu-item hide-m"
        to="/security"
        exact="exact"
        title="Security"
        @click.native="close"
      >
        <h2 class="app-menu-title">Security</h2>
      </router-link>

      <router-link
        class="app-menu-item hide-m"
        to="/terms"
        exact="exact"
        title="Terms"
        @click.native="close"
      >
        <h2 class="app-menu-title">Terms of Service</h2>
      </router-link>

      <router-link
        class="app-menu-item hide-m"
        to="/privacy"
        exact="exact"
        title="Privacy"
        @click.native="close"
      >
        <h2 class="app-menu-title">Privacy Policy</h2>
      </router-link>
    </div>
    <TmBtn
      v-if="session.signedIn"
      id="mobile-sign-out"
      class="session-link"
      value="Sign Out"
      type="secondary"
      size="small"
      @click.native="signOut()"
    />
    <TmBtn
      v-if="!session.signedIn"
      id="mobile-sign-in"
      class="session-link"
      value="Sign In"
      type="secondary"
      size="small"
      @click.native="signIn()"
    />
    <ConnectedNetwork />
  </menu>
</template>

<script>
import noScroll from "no-scroll"
import ConnectedNetwork from "common/TmConnectedNetwork"
import TmBtn from "common/TmBtn"
import { mapGetters } from "vuex"
import { atoms, viewDenom, shortDecimals } from "scripts/num.js"
export default {
  name: `app-menu`,
  components: {
    ConnectedNetwork,
    TmBtn
  },
  filters: {
    atoms,
    viewDenom,
    shortDecimals
  },
  computed: {
    ...mapGetters([`session`, `liquidAtoms`, `totalAtoms`, `bondDenom`])
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
      this.$router.push(`/welcome`)
      this.$emit(`close`)
    }
  }
}
</script>

<style scoped>
.app-menu {
  z-index: var(--z-appMenu);
  display: flex;
  flex-flow: column;
  position: relative;
  height: 100%;
}

.app-menu-main {
  height: 100%;
}

.app-menu .app-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin: 0.5rem 1rem;
  font-weight: 400;
  font-size: 14px;
  color: var(--text);
  border-radius: 0.25rem;
  transition: all 0.5s ease;
}

.app-menu-item:hover {
  background: var(--hover-bg);
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

.session-link {
  margin: 0 1rem;
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
}
</style>
