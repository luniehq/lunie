<template>
  <div>
    <ul class="account-list">
      <li
        v-for="account in accounts"
        :key="`${account.sessionType}_${account.name || account.address}`"
      >
        <AccountMenu
          v-if="openAccount && isSameAccount(account)"
          :account="account"
        />

        <div
          class="account"
          :class="{
            'open-1':
              openAccount &&
              isSameAccount(account) &&
              !(isExtension || account.sessionType === 'local'),
            'open-2':
              openAccount &&
              isSameAccount(account) &&
              (isExtension || account.sessionType === 'local'),
          }"
        >
          <!-- <div class="address-type-icon">
            <i class="material-icons notranslate circle">{{
              getAddressIcon(account.sessionType)
            }}</i>
          </div> -->
          <div class="account-info">
            <h3>{{ account.name }}</h3>
            <Address :address="account.address" />
            <span
              v-if="account.sessionType && !isExtension"
              class="session-type"
              >{{ account.sessionType | capitalizeFirstLetter }}</span
            >
          </div>
          <div class="action-container">
            <TmBtn
              v-if="buttonAction"
              class="account-button"
              :value="buttonText"
              color="primary"
              @click.native="buttonAction(account)"
            />
            <div
              v-if="isExtension || isSelectAccount"
              class="account-menu-toggle"
            >
              <i
                v-if="openAccount && isSameAccount(account)"
                class="material-icons notranslate"
                @click="openAccount = undefined"
                >close</i
              >
              <i
                v-else-if="
                  isExtension ||
                  ['explore', 'local', 'ledger'].includes(account.sessionType)
                "
                class="material-icons notranslate"
                @click="setNetwork(account)"
                >more_vert</i
              >
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import AccountMenu from "account/AccountMenu"
import Address from "common/Address"
import TmBtn from "common/TmBtn"
import config from "src/../config"
import { capitalizeFirstLetter } from "scripts/common"

export default {
  name: `account-list`,
  components: {
    AccountMenu,
    Address,
    TmBtn,
  },
  filters: {
    capitalizeFirstLetter,
  },
  props: {
    accounts: {
      type: Array,
      required: true,
    },
    buttonAction: {
      type: Function,
      default: undefined,
    },
    buttonText: {
      type: String,
      default: "",
    },
    isSelectAccount: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    openAccount: undefined,
    isExtension: config.isExtension,
  }),
  methods: {
    setNetwork(account) {
      this.openAccount = account
      if (this.isExtension) {
        this.$store.commit(`setNetworkId`, account.network)
      }
    },
    isSameAccount(account) {
      return (
        this.openAccount.address === account.address &&
        this.openAccount.sessionType === account.sessionType
      )
    },
    getAddressIcon(addressType) {
      if (addressType === "explore") return `language`
      if (addressType === "ledger") return `vpn_key`
      if (addressType === "extension") return `laptop`
      if (addressType === "local") return `phone_iphone`
    },
  },
}
</script>
<style scoped>
.account-list {
  margin: 1rem 0;
}

.account-list li {
  position: relative;
}

.account {
  display: flex;
  margin: 0.5rem 0;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--app-fg);
  border-radius: 0.25rem;
  border: 2px solid var(--bc-dim);
  width: 100%;
  height: 4.5rem;
  transition: 0.5s;
}

.open {
  border-color: var(--link);
}

.account.open-1 {
  transform: translate(-4.5rem);
}

.account.open-2 {
  transform: translate(-9rem);
}

.account h3 {
  color: var(--bright);
  font-weight: 500;
  font-size: 14px;
}

.account-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.account-button {
  padding: 0.25rem 0.5rem;
}

.account-menu-toggle {
  cursor: pointer;
  color: #b0bade;
  display: flex;
  margin-left: 1rem;
}

.copyable-address {
  height: auto;
  padding: 0;
}

.action-container {
  display: flex;
  align-items: center;
}

.session-type {
  font-size: 12px;
}
</style>
