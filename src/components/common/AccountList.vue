<template>
  <ul class="account-list">
    <li v-for="account in accounts" :key="account.name" class="account">
      <div class="account-info">
        <h3>{{ account.name }}</h3>
        <Bech32 :address="account.address" />
      </div>
      <TmBtn
        v-if="buttonAction"
        class="account-button"
        :value="buttonText"
        color="primary"
        @click.native="buttonAction(account.address)"
      />
    </li>
  </ul>
</template>

<script>
import Bech32 from "common/Bech32"
import TmBtn from "common/TmBtn"
export default {
  name: `account-list`,
  components: {
    Bech32,
    TmBtn
  },
  props: {
    accounts: {
      type: Array,
      required: true
    },
    buttonAction: {
      type: Function,
      required: true
    },
    buttonText: {
      type: String,
      required: true
    }
  }
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
  padding: 0.5rem 1rem;
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

.bech32-address {
  font-size: 14px;
}
</style>
