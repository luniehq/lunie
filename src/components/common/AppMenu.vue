<template>
  <menu class="app-menu">
    <div class="app-menu-main">
      <!-- <div
        class="app-menu-item"
      >
        <div class="total-atoms">
        Total <span class="total-atoms__value">{{
                totalAtoms | atoms | shortDecimals
              }}</span>
              {{ bondDenom | viewDenom }}
        </div>
        <div class="liquid-atoms">
        Liquid <span class="liquid-atoms__value">{{
                liquidAtoms | atoms | shortDecimals
              }}</span>
              {{ bondDenom | viewDenom }}
        </div>
      </div> -->
      <router-link
        class="app-menu-item hide-xs"
        to="/portfolio"
        exact="exact"
        title="Portfolio"
        @click.native="close"
      >
        <h2 class="app-menu-title">
          Portfolio
        </h2>
        <i class="material-icons">chevron_right</i>
      </router-link>
      <router-link
        class="app-menu-item hide-xs"
        to="/validators"
        title="Validators"
        @click.native="close"
      >
        <h2 class="app-menu-title">
          Validators
        </h2>
        <i class="material-icons">chevron_right</i>
      </router-link>
      <router-link
        class="app-menu-item hide-xs"
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
        class="app-menu-item hide-xs"
        to="/proposals"
        title="Proposals"
        @click.native="close"
      >
        <h2 class="app-menu-title">
          Proposals
        </h2>
        <i class="material-icons">chevron_right</i>
      </router-link>


      
        <router-link
          class="app-menu-item hide-m"
          to="/about"
          exact="exact"
          title="About"
        @click.native="close"
        >
        <h2 class="app-menu-title">
          About
          </h2>
        </router-link>
      
      
        <router-link
          class="app-menu-item hide-m"
          to="/careers"
          exact="exact"
          title="Careers"
        @click.native="close"
        >
        <h2 class="app-menu-title">
          Careers
          </h2>
        </router-link>
      
      
        <router-link
          class="app-menu-item hide-m"
          to="/security"
          exact="exact"
          title="Security"
        @click.native="close"
        >
        <h2 class="app-menu-title">
          Security
        </h2>
        </router-link>
      
      
        <router-link
          class="app-menu-item hide-m"
          to="/terms"
          exact="exact"
          title="Terms"
        @click.native="close"
        >
        <h2 class="app-menu-title">
          Terms of Service
        </h2>
        </router-link>
      
      
        <router-link
          class="app-menu-item hide-m"
          to="/privacy"
          exact="exact"
          title="Privacy"
        @click.native="close"
        >
        <h2 class="app-menu-title">
          Privacy Policy
        </h2>
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
import noScroll from "no-scroll"
import ConnectedNetwork from "common/TmConnectedNetwork"
import { mapGetters } from "vuex"
import { atoms, viewDenom, shortDecimals } from "scripts/num.js"
export default {
  name: `app-menu`,
  components: {
    ConnectedNetwork
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
