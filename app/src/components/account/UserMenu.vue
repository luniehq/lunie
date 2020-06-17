<template>
  <div class="user-menu">
    <div v-if="address" class="address">
      <Address
        class="menu-address"
        :address="address || ''"
        :tooltip-text="addressType"
      />
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
      <!-- <a v-if="session.signedIn" id="sign-out" @click="signOut()">
        <i v-tooltip.top="'Sign Out'" class="material-icons notranslate"
          >exit_to_app</i
        >
      </a> -->
    </div>
    <TmBtn
      v-else
      id="sign-in"
      value="Sign In / Sign Up"
      type="secondary"
      size="small"
      @click.native="signIn()"
    />
    <router-link
      v-if="session.experimentalMode"
      v-tooltip="`Your Notifications`"
      :to="{ name: 'notifications' }"
      class="notifications"
    >
      <i class="material-icons">notifications</i>
    </router-link>
    <v-popover open-class="user-menu-popover">
      <!-- This will be the popover target (for the events and position) -->
      <Avatar class="avatar tooltip-target" :address="addresses[0].address" />

      <!-- This will be the content of the popover -->
      <template slot="popover">
        <div
          v-for="address in addresses"
          :key="address.address"
          class="menu-list-item address-list"
          :class="{ selected: address.address === selectedAddress }"
        >
          <div>
            <span v-if="address.type">{{ address.type }}</span>
            <span class="address-name">{{ address.name }}</span>
            <span class="address">{{ address.address | formatAddress }}</span>
          </div>

          <i v-if="address.address === selectedAddress" class="material-icons"
            >check</i
          >
        </div>
        <div class="menu-list-item dark">
          <span>Create New Account</span>
          <i class="material-icons">add_circle</i>
        </div>
        <div class="menu-list-item">
          <span>Settings</span>
          <i class="material-icons">settings</i>
        </div>
        <div class="menu-list-item">
          <span>Manage Subscription</span>
          <i class="material-icons">payment</i>
        </div>
        <div class="menu-list-item outline">
          <span>Logout</span>
          <i class="material-icons">exit_to_app</i>
        </div>
      </template>
    </v-popover>
  </div>
</template>

<script>
import Address from "common/Address"
import Avatar from "common/Avatar"
import TmBtn from "common/TmBtn"
import { formatAddress } from "src/filters"
import { mapGetters, mapState } from "vuex"
import { showAddressOnLedger } from "scripts/ledger"
export default {
  name: `user-menu`,
  filters: {
    formatAddress
  },
  components: {
    Address,
    Avatar,
    TmBtn
  },
  data: () => ({
    ledgerAddressError: undefined,
    showAddressOnLedgerFn: showAddressOnLedger,
    addresses: [
      {
        name: 'seed 1',
        address: 'cosmos1...abcd'
      }, 
      {
        name: 'seed 2',
        address: 'akash1...efgh'
      }, 
      {
        name: 'seed 3',
        address: 'polka1...ijkl'
      }, 
    ],
    selectedAddress: 'cosmos1...abcd'
  }),
  computed: {
    ...mapState([`session`, `connection`]),
    ...mapGetters([`address`, `network`]),
    addressType() {
      if (
        this.session.addressRole &&
        this.session.addressRole !== `stash/controller` &&
        this.session.addressRole !== `none`
      ) {
        return (
          `Your` +
          this.capitalizeFirstLetter(this.session.addressRole) +
          `Address`
        )
      }
      return `Your Address`
    }
  },
  methods: {
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
    },
    signIn() {
      console.log(`Feature coming soon`)
      // this.$store.dispatch(`signInUser`)
    }
  }
}
</script>

<style scoped>
.user-menu {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 2rem;
}

.notifications {
  background: var(--app-fg);
  margin: 0 0.5rem;
  border-radius: 50%;
  padding: 0.5rem 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 2rem;
}

.notifications:hover i {
  transform: rotate(0);
}

.notifications i {
  transition: transform 0.2s ease;
  font-size: 18px;
  transform: rotate(-30deg);
}

h3 {
  font-size: 12px;
}

.address-list {
  padding: 0 0 1rem 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.menu-list-item {
  padding: 0.75rem;
  margin: 0.25rem 0;
  display: flex;
  justify-content: space-between;
  width: 100%;
  min-width: 200px;
  align-items: center;
  border-radius: 0.25rem;
  color: #324175;
}

.menu-list-item:hover {
  cursor: pointer;
  background: #eeeeee;
}

.menu-list-item.dark {
  margin-top: 0.5rem;
  background: hsl(226, 30%, 90%);
}

.menu-list-item.outline {
  border: 1px solid #eeeeee;
}

.menu-list-item.selected {
  background: #e6fae6;
}

.menu-list-item.dark:hover {
  background: hsl(226, 30%, 85%);
}

.address-list .material-icons {
  font-weight: 700;
  color: #00c700;
}

.address-list span {
  display: block;
}

.address {
  color: hsl(0, 0%, 40%);
  font-weight: 400;
}

.address-name {
  padding-bottom: 0.25rem;
  font-weight: 500;
}

.avatar {
  display: inline-block;
  background: var(--app-fg);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid var(--bc-dim);
}

.v-popover {
  height: 2rem;
  width: 2rem;
  cursor: pointer;
}

.material-icons {
  font-size: 18px;
  font-weight: 500;
}
</style>