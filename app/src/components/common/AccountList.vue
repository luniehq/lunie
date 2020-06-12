<template>
  <div>
    <AccountMenu v-if="accountMenuToggle" :address="accountAddress" />
    <ul class="account-list">
      <li v-for="account in accounts" :key="account.name" class="account">
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
            class="material-icons notranslate"
            @click="openAccountMenu(account.address)"
            >more_vert</i
          >
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import AccountMenu from "common/AccountMenu"
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
    accountMenuToggle: false,
    accountAddress: "",
  }),
  methods: {
    openAccountMenu(address) {
      this.accountAddress = address
      this.accountMenuToggle = !this.accountMenuToggle
    },
  },
}
</script>
<style scoped>
.account-list {
  padding: 2rem 0;
}

.account {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--app-fg);
  border-radius: 0.25rem;
  border: 2px solid var(--bc-dim);
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
}
</style>
