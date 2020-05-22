<template>
  <menu class="app-menu">
    <div>
      <div v-if="session.signedIn" class="user-box">
        <div class="user-box-address">
          <div>
            <h3
              v-if="
                session.addressRole &&
                  session.addressRole !== `stash/controller`
              "
            >
              {{ capitalizeFirstLetter(session.addressRole) }} Address
            </h3>
            <h3 v-else>Your Address</h3>
            <Address class="menu-address" :address="address || ''" />
          </div>
          <a v-if="session.signedIn" id="sign-out" @click="signOut()">
            <i v-tooltip.top="'Sign Out'" class="material-icons notranslate"
              >exit_to_app</i
            >
          </a>
        </div>
      </div>
      <div>
        <a
          v-if="!session.isMobile && session.sessionType === 'ledger'"
          class="show-on-ledger"
          @click="showAddressOnLedger()"
          >Show on Ledger</a
        >
        <TmFormMsg
          v-if="ledgerAddressError"
          :msg="ledgerAddressError"
          type="custom"
        />

        <router-link
          class="app-menu-item"
          to="/about"
          exact="exact"
          title="About"
          @click.native="handleClick()"
        >
          <h2 class="app-menu-title">About</h2>
        </router-link>

        <router-link
          class="app-menu-item"
          to="/careers"
          exact="exact"
          title="Careers"
          @click.native="handleClick()"
        >
          <h2 class="app-menu-title">Careers</h2>
        </router-link>

        <router-link
          class="app-menu-item"
          to="/security"
          exact="exact"
          title="Security"
          @click.native="handleClick()"
        >
          <h2 class="app-menu-title">Security</h2>
        </router-link>

        <router-link
          class="app-menu-item"
          to="/terms"
          exact="exact"
          title="Terms"
          @click.native="handleClick()"
        >
          <h2 class="app-menu-title">Terms of Service</h2>
        </router-link>

        <router-link
          class="app-menu-item"
          to="/privacy"
          exact="exact"
          title="Privacy"
          @click.native="handleClick()"
        >
          <h2 class="app-menu-title">Privacy Policy</h2>
        </router-link>
      </div>
    </div>
    <ConnectedNetwork @close-menu="handleClick" />
  </menu>
</template>

<script>
import Address from "common/Address"
import ConnectedNetwork from "common/TmConnectedNetwork"
import TmFormMsg from "common/TmFormMsg"
import { mapGetters, mapState } from "vuex"
import { shortDecimals } from "scripts/num.js"
import { showAddressOnLedger } from "scripts/ledger"
export default {
  name: `app-menu`,
  components: {
    Address,
    ConnectedNetwork,
    TmFormMsg
  },
  filters: {
    shortDecimals
  },
  data: () => ({
    ledgerAddressError: undefined,
    showAddressOnLedgerFn: showAddressOnLedger
  }),
  computed: {
    ...mapState([`session`, `connection`]),
    ...mapGetters([`address`, `network`]),
    networkSlug() {
      return this.connection.networkSlug
    }
  },
  methods: {
    handleClick() {
      this.$emit(`close`)
      window.scrollTo(0, 0)
    },
    signOut() {
      this.$emit(`close`)
      this.$store.dispatch(`signOut`, this.network)
    },
    signIn() {
      if (this.$route.name !== `portfolio`) {
        this.$router.push({
          name: `portfolio`,
          params: { networkId: this.networkSlug }
        })
      }
      this.$emit(`close`)
    },
    async showAddressOnLedger() {
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout)
        this.messageTimeout = undefined
      }
      this.ledgerAddressError = undefined
      try {
        await this.showAddressOnLedgerFn(this.network, this.$store)
      } catch (error) {
        this.ledgerAddressError = error.message
        this.messageTimeout = setTimeout(
          () => (this.ledgerAddressError = undefined),
          8000
        )
      }
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
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

.app-menu-item {
  color: var(--menu-text);
}

.app-menu-item:hover {
  background: var(--app-nav-hover);
}

.app-menu .app-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
  margin: 0.5rem 1rem;
  font-weight: 400;
  font-size: 14px;
  color: var(--menu-text);
  border-radius: 0.25rem;
  transition: all 0.5s ease;
}

.session-link {
  margin: 2.5rem 1rem 1rem;
}

.show-on-ledger {
  display: inline-block;
  padding-top: 1rem;
}

.show-on-ledger:hover {
  cursor: pointer;
}

.button.small {
  border-color: var(--menu-border);
}

.user-box {
  font-size: 12px;
  margin: 1rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--menu-border);
  border-radius: 0.25rem;
  display: block;
}

.user-box-address {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--menu-text);
}

.user-box i {
  color: var(--menu-link);
  font-size: var(--m);
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 50%;
  background: var(--app-nav-hover);
}

.user-box i:hover {
  color: var(--menu-link-hover);
  cursor: pointer;
}

.app-menu .app-menu-item--link:hover {
  color: var(--menu-link-hover);
}

.app-menu .app-menu-item.router-link-active {
  background: var(--app-nav-hover);
}

.app-menu .app-menu-item.router-link-active i {
  color: var(--highlight);
}

.app-menu .app-menu-item.router-link-active h2 {
  color: var(--menu-bright);
  font-weight: 500;
}

@media screen and (max-width: 1023px) {
  .app-menu {
    background: var(--app-nav);
    height: 100vh;
    top: 0;
    width: 100%;
    justify-content: space-between;
  }

  .app-menu .app-menu-item {
    padding: 0.5rem;
  }

  .app-menu-title {
    font-size: var(--xxl);
    line-height: 1.125;
    font-weight: 600;
    letter-spacing: 0.004em;
    color: var(--menu-bright);
  }
}

@media screen and (min-width: 1023px) {
  .app-menu {
    width: var(--sidebar-width);
    justify-content: space-between;
  }
}
</style>
