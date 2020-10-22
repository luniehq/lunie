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
          :class="{ open: openAccount && isSameAccount(account) }"
        >
          <div class="account-info">
            <h3>{{ account.name }}</h3>
            <Address :address="account.address" />
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
                v-else
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
import { mapGetters } from "vuex"

export default {
  name: `account-list`,
  components: {
    AccountMenu,
    Address,
    TmBtn,
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
  computed: {
    ...mapGetters([`networks`]),
  },
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

.account.open {
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
</style>
