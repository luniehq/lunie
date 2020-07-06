<template>
  <div class="user-menu">
    <UserMenuAddress v-if="address" :address="address" />
    <router-link
      v-if="session.experimentalMode"
      v-tooltip="`Your Notifications`"
      :to="{ name: 'notifications' }"
      class="user-menu-icon-container notifications"
    >
      <i class="material-icons">notifications</i>
    </router-link>
    <v-popover open-class="user-menu-popover">
      <!-- This will be the popover target (for the events and position) -->
      <div id="open-user-menu" class="avatar-container">
        <span v-if="!account.userSignedIn" class="avatar emoji tooltip-target"
          >👻</span
        >
        <Avatar
          v-if="account.userSignedIn"
          class="avatar tooltip-target"
          :address="account.user.email"
          :human="true"
        />
      </div>

      <!-- This will be the content of the popover -->
      <template slot="popover">
        <div class="user-popover">
          <h3 class="email">{{ user.email || `Anonymous User` }}</h3>
        </div>
        <div
          v-for="address in addresses"
          :key="address.address.concat(`-${address.networkId}`)"
          class="menu-list-item address-list"
          :class="{
            selected:
              address.address === selectedAddress &&
              address.networkId === selectedNetwork.id,
          }"
          @click="selectAddress(address)"
        >
          <div class="address-item">
            <div
              v-if="getAddressNetwork(address).testnet"
              class="testnet-icon-container"
            >
              <img class="testnet-icon" src="/img/icons/test-tube-32.png" />
            </div>
            <img
              class="network-icon"
              :src="address.icon"
              alt="little circle with network logo"
            />
            <div>
              <span class="address">{{ address.address | formatAddress }}</span>
              <span class="address-network">{{
                getAddressNetwork(address).title
              }}</span>
              <span v-if="address.sessionType" class="address-type">
                {{ address.sessionType }}
              </span>
            </div>
          </div>
          <i
            v-if="
              address.address === selectedAddress &&
              address.networkId === selectedNetwork.id
            "
            class="material-icons"
            >check</i
          >
        </div>
        <div
          id="create-new-account"
          v-close-popover
          class="menu-list-item"
          @click="goToWelcome()"
        >
          <span>Create New Account</span>
          <i class="material-icons">add_circle</i>
        </div>
        <div v-if="account.userSignedIn">
          <div
            v-if="false"
            v-close-popover
            class="menu-list-item"
            @click="closePopover()"
          >
            <span>Settings</span>
            <i class="material-icons">settings</i>
          </div>
          <div
            v-if="false"
            v-close-popover
            class="menu-list-item"
            @click="closePopover()"
          >
            <span>Manage Subscription</span>
            <i class="material-icons">payment</i>
          </div>
          <div
            v-close-popover
            class="menu-list-item outline"
            @click="signOut()"
          >
            <span>Logout</span>
            <i class="material-icons">exit_to_app</i>
          </div>
        </div>
        <div v-else>
          <div
            v-close-popover
            class="menu-list-item outline"
            @click="signUpForPremium()"
          >
            <span>Sign up for premium</span>
            <i class="material-icons">email</i>
          </div>
          <!-- TODO -->
          <!-- <div
            v-close-popover
            class="menu-list-item outline"
            @click="resetSessions()"
          >
            <span>Reset Sessions</span>
            <i class="material-icons">cancel</i>
          </div> -->
        </div>
      </template>
    </v-popover>
  </div>
</template>

<script>
import Avatar from "common/Avatar"
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
    UserMenuAddress,
  },
  data: () => ({
    selectedAddress: "",
    selectedNetwork: "",
    selectedOption: "",
  }),
  computed: {
    ...mapState([`session`, `account`]),
    ...mapGetters([`address`, `networks`]),
    user() {
      return this.account.userSignedIn ? this.account.user : {}
    },
    addresses() {
      return this.session.allSessionAddresses
    },
  },
  methods: {
    openSignInModal() {
      this.$router.push({ name: `sign-in-modal` })
    },
    selectAddress(address) {
      this.selectedAddress = address.address
      this.selectedNetwork = this.networks.find(
        (network) => network.id === address.networkId
      )
      this.$store.dispatch(`setNetwork`, this.selectedNetwork)
      this.$router.push({
        name: "portfolio",
        params: {
          networkId: this.selectedNetwork.slug,
        },
      })
      this.$store.dispatch(`signIn`, {
        sessionType: address.sessionType,
        address: this.selectedAddress,
        networkId: address.networkId,
      })
    },
    signOut() {
      this.$store.dispatch(`signOut`, this.network)
      this.$store.dispatch(`signOutUser`)
    },
    goToWelcome() {
      if (this.$route.name !== `welcome`) {
        this.$router.push({ name: `welcome` })
      }
    },
    signUpForPremium() {
      if (this.$route.name !== `sign-in-modal`) {
        this.$router.push({ name: `sign-in-modal` })
      }
    },
    getAddressNetwork(address) {
      return this.networks.find((network) => network.id === address.networkId)
    },
    // TODO
    // async resetSessions() {
    // },
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

.user-popover {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #eee;
  border-radius: 0.25rem;
}

.user-menu-icon-container {
  background: var(--app-fg);
  margin: 0 0.25rem;
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

.address-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-list-item {
  padding: 0.75rem 0.5rem;
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

.menu-list-item.outline {
  border: 1px solid #eee;
}

.menu-list-item.selected {
  background: #e6fae6;
}

.network-icon {
  display: block;
  position: relative;
  max-height: 100%;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  padding: 0.25rem;
}

.email {
  padding: 0.75rem;
  margin: 0.25rem 0;
}

.address-list .material-icons {
  font-weight: 700;
  color: #00c700;
}

.address-list span {
  display: block;
}

.address {
  font-weight: 500;
  color: black;
}

.address-type {
  margin-top: 0.25em;
  color: hsl(0, 0%, 40%);
}

.address-network {
  margin-top: 0.25em;
  color: hsl(0, 0%, 40%);
}

.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--app-fg);
  overflow: hidden;
  border: 4px solid var(--app-fg);
}

.avatar {
  width: 100%;
  position: relative;
  top: 0.25rem;
}

.testnet-icon-container {
  position: absolute;
  bottom: 0.25rem;
  left: 1.5rem;
  display: flex;
  justify-content: center;
  z-index: 1;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  background-color: #9b82ff;
}

.testnet-icon {
  max-width: 0.75rem;
  transform: scaleX(-1);
  filter: invert(1);
}

.avatar.emoji {
  font-size: 26px;
  transform: scale(0.75);
  top: 0;
}

.v-popover {
  cursor: pointer;
}

.user-menu-button {
  padding: 6px 10px;
  font-size: 12px;
  min-width: 0;
  color: var(--text);
  border-color: var(--primary);
  background-color: transparent;
}

.user-menu-button:hover {
  color: var(--menu-text);
  border-color: var(--bc);
}
</style>
