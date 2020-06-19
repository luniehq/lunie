<template>
  <div>
    <ul class="account-list">
      <li v-for="account in accounts" :key="account.name">
        <AccountMenu
          v-if="openAccount && openAccount.name === account.name"
          :address="account.address"
        />

        <div
          class="account"
          :class="{ open: openAccount && openAccount.name === account.name }"
        >
          <div class="account-info">
            <h3>{{ account.name }}</h3>
            <Address :address="account.address" />
          </div>
          <TmBtn
            v-if="buttonAction"
            class="account-button"
            :value="buttonText"
            color="primary"
            @click.native="buttonAction(account)"
          />
          <div class="account-menu-toggle">
            <i
              v-if="!openAccount"
              class="material-icons notranslate"
              @click="openAccount = account"
              >more_vert</i
            >
            <i
              v-else
              class="material-icons notranslate"
              @click="openAccount = undefined"
              >close</i
            >
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
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    openAccount: undefined,
  }),
}
</script>
<style scoped>
.account-list li {
  position: relative;
}

.account {
  display: flex;
  margin-top: 1em;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--app-fg);
  border-radius: 0.25rem;
  border: 2px solid var(--bc-dim);
  width: 100%;
  transition: 0.6s;
}

.open {
  border: solid var(--link) 3px;
}

.account.open {
  transform: translate(-5rem);
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
}
</style>
