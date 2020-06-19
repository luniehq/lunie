<template>
  <div class="user-menu">
    <UserMenuAddress v-if="address" :address="address" />
    <TmBtn
      v-if="!account.userSignedIn"
      id="sign-in"
      class="user-menu-button"
      value="Sign In / Sign Up"
      type="secondary"
      size="small"
      @click.native="openSignInModal()"
    />
    <TmBtn
      v-if="!address && account.userSignedIn"
      id="sign-out"
      class="user-menu-button"
      value="Sign Out"
      type="secondary"
      size="small"
      @click.native="signOut()"
    />
    <router-link
      v-if="session.experimentalMode && account.userSignedIn"
      v-tooltip="`Your Notifications`"
      :to="{ name: 'notifications' }"
      class="notifications"
    >
      <i class="material-icons">notifications</i>
    </router-link>
    <v-popover open-class="user-menu-popover">
      <!-- This will be the popover target (for the events and position) -->
      <Avatar
        v-if="account.userSignedIn"
        class="avatar tooltip-target"
        :address="addresses[0].address"
      />

      <!-- This will be the content of the popover -->
      <template slot="popover">
        <div
          v-for="address in addresses"
          :key="address.address"
          class="menu-list-item address-list"
          :class="{ selected: address.address === selectedAddress }"
          @click="selectAddress(address.address)"
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
        <div
          class="menu-list-item"
          :class="{ dark: selectedOption === `create` }"
          @click="selectOption(`create`)"
        >
          <span>Create New Account</span>
          <i class="material-icons">add_circle</i>
        </div>
        <div
          class="menu-list-item"
          :class="{ dark: selectedOption === `settings` }"
          @click="selectOption(`settings`)"
        >
          <span>Settings</span>
          <i class="material-icons">settings</i>
        </div>
        <div
          class="menu-list-item"
          :class="{ dark: selectedOption === `payment` }"
          @click="selectOption(`payment`)"
        >
          <span>Manage Subscription</span>
          <i class="material-icons">payment</i>
        </div>
        <div
          class="menu-list-item outline"
          :class="{ dark: selectedOption === `logout` }"
          @click="
            selectOption(`logout`)
            signOut()
            closePopover()
          "
        >
          <span>Logout</span>
          <i class="material-icons">exit_to_app</i>
        </div>
      </template>
    </v-popover>
  </div>
</template>

<script>
import Avatar from "common/Avatar"
import TmBtn from "common/TmBtn"
import UserMenuAddress from "account/UserMenuAddress"
import { formatAddress } from "src/filters"
import { mapGetters, mapState } from "vuex"
export default {
  name: `user-menu`,
  filters: {
    formatAddress,
  },
  components: {
    Avatar,
    TmBtn,
    UserMenuAddress,
  },
  data: () => ({
    addresses: [
      {
        name: "seed 1",
        address: "cosmos1...abcd",
      },
      {
        name: "seed 2",
        address: "akash1...efgh",
      },
      {
        name: "seed 3",
        address: "polka1...ijkl",
      },
    ],
    selectedAddress: "cosmos1...abcd",
    selectedOption: "",
  }),
  computed: {
    ...mapState([`session`, `account`]),
    ...mapGetters([`address`]),
  },
  watch: {
    address: () => {
      this.addresses = [{name: 'account1', address: this.address}]
    },
  },
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    openSignInModal() {
      this.$router.push({ name: `sign-in-modal` })
    },
    selectAddress(address) {
      this.selectedAddress = address
    },
    selectOption(option) {
      this.selectedOption = option
    },
    signOut() {
      this.$store.dispatch(`signOutUser`)
    },
    closePopover() {
      this.$el.querySelector(`.v-popover`).focus()
    },
  },
}
</script>

<style scoped>
h3 {
  font-size: 12px;
}

.user-menu {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 1em;
}

.notifications {
  background: var(--app-fg);
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 2rem;
}

.notifications i {
  transition: transform 0.2s ease;
  font-size: 18px;
  transform: rotate(-30deg);
}

.notifications:hover i {
  transform: rotate(0);
}

.material-icons {
  font-size: 18px;
  font-weight: 500;
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
  background: #eee;
}

.menu-list-item.dark {
  margin-top: 0.5rem;
  background: hsl(226, 30%, 90%);
}

.menu-list-item.outline {
  border: 1px solid #eee;
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

.user-menu-button {
  padding: 6px 10px;
  font-size: 12px;
  min-width: 0;
  background-color: transparent;
  margin-left: 0.5em;
}
</style>
