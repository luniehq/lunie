<template>
  <div class="account-menu">
    <div class="account-menu-buttons">
      <!-- Remove account for accounts with seed -->
      <div
        v-if="account.sessionType === `local` || isExtension"
        class="account-menu-button-container"
      >
        <router-link
          class="account-menu-button account-menu-delete-account"
          :to="{
            name: 'delete',
            params: {
              address: account.address,
              addressNetworkId: account.network || account.networkId,
            },
          }"
        >
          <i class="material-icons notranslate show-seed">delete</i>
        </router-link>
        <span class="account-menu-button-span">Remove Account</span>
      </div>
      <!-- Remove account for explore and ledger accounts  -->
      <div
        v-if="
          account.sessionType === `explore` || account.sessionType === `ledger`
        "
        class="account-menu-button-container"
      >
        <div
          class="account-menu-button account-menu-delete-account"
          @click="signOutOfAddress(account)"
        >
          <i class="material-icons notranslate show-seed">delete</i>
        </div>
        <span class="account-menu-button-span">Delete Account</span>
      </div>
      <!-- Show seed -->
      <div
        v-if="
          account.sessionType === `local` || account.sessionType === `extension` || isExtension
        "
        class="account-menu-button-container"
      >
        <router-link
          class="account-menu-button account-menu-show-seed"
          :to="{ name: 'reveal', params: { address: account.address } }"
        >
          <i class="material-icons notranslate show-seed">visibility</i>
        </router-link>
        <span class="account-menu-button-span">Show Seed</span>
      </div>
    </div>
  </div>
</template>

<script>
import config from "src/../config"

export default {
  name: `account-menu`,
  props: {
    account: {
      type: Object,
      required: true,
    },
  },
  data: () => {
    return {
      seed: "",
      command: "",
      isExtension: config.isExtension,
    }
  },
  methods: {
    async signOutOfAddress(account) {
      await this.$store.dispatch(`signOutAddress`, account)
    },
  },
}
</script>
<style scoped>
.account-menu {
  display: flex;
  align-items: center;
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
}

.account-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 60%;
  padding: 1rem;
  background: var(--app-fg);
  border-radius: 0.6rem;
  border: 2px solid var(--bc-dim);
}

.account-menu-buttons {
  display: flex;
}

.account-menu-button {
  cursor: pointer;
  border-radius: 50%;
  padding: 0.5em;
  height: 2.5em;
  width: 2.5em;
}

.account-menu-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.25rem 0 0;
}

.account-menu-button-span {
  margin-top: 0.5rem;
  font-size: 10px;
  color: var(--faded-blue);
}

.account-menu-button.account-menu-edit {
  background: #dbf7e6;
}

.account-menu-button.account-menu-show-seed {
  background: #b0d1e3;
  color: #3d728e;
}

.account-menu-button.account-menu-delete-account {
  background: #fad3cd;
  color: #f67f70;
}
</style>
