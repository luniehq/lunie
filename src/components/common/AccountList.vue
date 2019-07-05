<template>
  <ul class="account-list">
    <li v-for="account in accounts" :key="account.name" class="account">
      <div class="account-info">
        <h3>{{ account.name }}</h3>
        <Bech32 :address="account.address || ''" />
      </div>
      <TmBtn
        class="account-button"
        value="Use Account"
        color="primary"
        @click.native="signIn(account.address)"
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
    }
  },
  methods: {
    async signIn(address) {
      this.$store.dispatch(`signIn`, {
        sessionType: `extension`,
        address: address
      })
      this.$router.push(`/`)
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
  flex-flow: row;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--app-fg);
  border-radius: 0.25rem;
  border: 2px solid var(--bc-dim);
}

.account h3 {
  color: var(--bright);
}

.account-info {
  display: flex;
  flex-direction: column;
}
</style>
