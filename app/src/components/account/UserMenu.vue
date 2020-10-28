<template>
  <div class="user-menu">
    <UserMenuAddress
      v-if="address && $route.name !== `notifications`"
      :address="address"
    />
    <router-link
      v-tooltip="`Notifications`"
      :to="{ name: 'notifications' }"
      class="user-menu-icon-container notifications"
      :class="{ 'with-address-type': hasAddressType }"
    >
      <i class="material-icons">notifications</i>
    </router-link>
    <v-popover open-class="user-menu-popover">
      <!-- This will be the popover target (for the events and position) -->
      <div
        id="open-user-menu"
        class="avatar-container"
        :class="{ 'with-address-type': hasAddressType }"
      >
        <span v-if="!user" class="user-menu-icon-container tooltip-target"
          ><i class="material-icons">person</i></span
        >
        <Avatar
          v-if="user"
          class="avatar tooltip-target"
          :address="user ? user.email : ''"
          :human="true"
        />
      </div>

      <!-- This will be the content of the popover -->
      <template slot="popover">
        <div class="user-popover">
          <h3 class="email">{{ (user && user.email) || `Anonymous User` }}</h3>
        </div>
        <div class="address-list">
          <div
            v-for="address in addresses"
            :key="
              (address.address || address.name).concat(
                `-${address.networkId}-${address.sessionType}`
              )
            "
            class="menu-list-item address-list-item"
            :data-address-name="address.name"
            :class="{
              selected:
                address.address === selectedAddress &&
                address.networkId === selectedNetwork.id,
            }"
          >
            <UserAccountRow
              :address="address"
              @click="selectAddress(address)"
            />
          </div>
        </div>
        <div
          id="create-new-account"
          v-close-popover
          class="menu-list-item"
          @click="goToWelcome()"
        >
          <span>Add an address</span>
          <i class="material-icons">add_circle</i>
        </div>
        <div
          id="manage-accounts"
          v-close-popover
          class="menu-list-item"
          @click="goToManageAccounts()"
        >
          <span>Manage Addresses</span>
          <i class="material-icons">build</i>
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
            <span>Sign Up / Sign In</span>
            <i class="material-icons">email</i>
          </div>
        </div>
      </template>
    </v-popover>
  </div>
</template>

<script>
import Avatar from "common/Avatar"
import UserMenuAddress from "account/UserMenuAddress"
import UserAccountRow from "account/UserAccountRow"
import { mapGetters, mapState } from "vuex"
import { uniqWith, sortBy } from "lodash"
import { AddressRole } from "../../gql"
import { formatAddress } from "src/filters"

export default {
  name: `user-menu`,
  components: {
    Avatar,
    UserMenuAddress,
    UserAccountRow,
  },
  filters: { formatAddress },
  data: () => ({
    selectedAddress: "",
    selectedNetwork: "",
    selectedOption: "",
  }),
  asyncComputed: {
    addresses: {
      cache: false, // cache is false to update UserMenu when new extension accounts are added
      get: async function () {
        const localAccounts = this.keystore.accounts
        // active sessions will likely overlap with the ones stored locally / in extension
        const addressesWithKeys = localAccounts
          .map((account) => ({
            ...account,
            networkId: account.network || account.networkId,
            sessionType: `local`,
          }))
          .concat(
            this.extension.accounts.map((account) => ({
              ...account,
              networkId: account.network || account.networkId,
              sessionType: `extension`,
            }))
          )
        const sessionAddressesWithoutKeys = this.session.addresses
          .filter(
            ({ sessionType }) =>
              sessionType === "explore" || sessionType === "ledger"
          )
          .filter(
            ({ address }) =>
              // pick only addresses where there is no addres with key already
              !addressesWithKeys.find(
                (addressWithKey) => addressWithKey.address === address
              )
          )
          .map((address) => ({
            ...address,
            sessionType: address.sessionType ? address.sessionType : "explore",
            icon: this.networks.find(({ id }) => id === address.networkId).icon,
          }))
        const allAddresses = uniqWith(
          sortBy(
            addressesWithKeys.concat(sessionAddressesWithoutKeys),
            (account) => {
              return account.networkId
            }
          ),
          (a, b) => a.address === b.address && a.sessionType === b.sessionType
        )
        // filter out accounts without address as the checkAddressRole query will fail as well as account is then unusable
        let allAddressesWithAddressRole = await this.getAllAddressesRoles(
          allAddresses.filter(({ address }) => address)
        )
        this.$store.commit(`setUserAccounts`, allAddressesWithAddressRole)
        return allAddressesWithAddressRole
      },
    },
  },
  computed: {
    ...mapState([`session`, `account`, `keystore`, `extension`]),
    ...mapGetters([`address`, `network`, `networks`]),
    ...mapGetters({ currentAddress: `address` }),
    user() {
      return this.account.userSignedIn && this.account.user
        ? this.account.user
        : undefined
    },
    hasAddressType() {
      return (
        this.session.addressRole &&
        this.session.addressRole !== `stash/controller` &&
        this.session.addressRole !== `none`
      )
    },
  },
  created() {
    this.$store.dispatch(`loadLocalAccounts`).then(() => {
      this.loaded = true
    })
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
      this.$store.dispatch(`signOutUser`)
    },
    goToWelcome() {
      if (this.$route.name !== `welcome`) {
        this.$router.push({ name: `welcome` })
      }
    },
    goToManageAccounts() {
      if (this.$route.name !== `manage-accounts-modal`) {
        this.$router.push({ name: `manage-accounts-modal` })
      }
    },
    signUpForPremium() {
      if (this.$route.name !== `sign-in-modal`) {
        this.$router.push({ name: `sign-in-modal` })
      }
    },
    getAddressNetwork(address) {
      return (
        this.networks.find((network) => network.id === address.networkId) || {
          type: "unknown",
        }
      )
    },
    async getAddressRole(address) {
      const { data } = await this.$apollo.query({
        query: AddressRole,
        variables: { networkId: address.networkId, address: address.address },
        fetchPolicy: "network-only",
      })
      return {
        ...address,
        addressRole: data.accountRole,
      }
    },
    async getAllAddressesRoles(addresses) {
      return await Promise.all(
        addresses.map(async (address) => {
          if (this.getAddressNetwork(address).network_type === `polkadot`) {
            return await this.getAddressRole(address)
          } else {
            return address
          }
        })
      )
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
  max-height: 18rem;
  overflow: scroll;
}

.address-list-item {
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

.menu-list-item.address-list-item {
  padding: 0.25rem;
}

.email {
  padding: 0.75rem;
  margin: 0.25rem 0;
}

.menu-list-item:hover:not(.address-list-item) {
  cursor: pointer;
  background: #eee;
}

.menu-list-item:hover i {
  cursor: pointer;
}

.menu-list-item.outline {
  border: 1px solid #eee;
}

.menu-list-item.selected {
  background: #e6fae6;
}

.address-list .material-icons {
  font-weight: 700;
}

.address-list span {
  display: block;
}

.address {
  font-weight: 400;
  margin-top: 0.25em;
  color: hsl(0, 0%, 40%);
}

.address-type {
  margin-top: 0.25em;
  color: hsl(0, 0%, 40%);
}

/* with an address type the addres box is a bit bigger so the rest needs to be centered */
.with-address-type {
  margin-top: 4px;
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
  color: var(--link);
}

.avatar {
  width: 100%;
  position: relative;
  top: 2px;
  padding: 6px;
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
