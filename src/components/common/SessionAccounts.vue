<template>
  <div class="accounts" :hide-header="true">
    <ToolBar :display-text="true" />
    <div class="accounts-top">
      <h2>My accounts</h2>
      <p>
        You can use this account to explore
        <router-link to="/wallet">
          Lunie
        </router-link>
        and to approve transactions.
      </p>
    </div>
    <div v-for="account in accounts" :key="account.address">
      <div class="card content">
        <div class="content-left">
          <h3>{{ account.name }}</h3>
          <Bech32 :address="account.address" short-form />
        </div>
        <TmBtn value="Go to Lunie" color="primary" />
      </div>
    </div>
  </div>
</template>

<script>
import TmBtn from "common/TmBtn"
import ToolBar from "common/ToolBar"
import Bech32 from "common/Bech32"
export default {
  name: `session-ext-accounts`,
  components: {
    TmBtn,
    ToolBar,
    Bech32
  },
  data: () => ({
    accounts: [
      {
        address: "cosmos1ek9cd8ewgxg9w5x3benji0uf4aaxaruvcw4v9e",
        name: "Account 1"
      }
    ]
  })
}
</script>

<style scoped>
.accounts {
  padding: 2rem;
  background: var(--fg);
  border-left: 1px solid var(--bc-dim);
}

.accounts h2 {
  color: var(--bright);
  font-size: var(--h1);
  font-weight: 500;
  line-height: 3rem;
}

.card {
  background: var(--app-nav);
  border-radius: 2px;
  padding: 1rem;
  font-size: var(--m);
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc);
}

.card h3 {
  font-size: 14px;
  font-weight: 400;
}

.content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-left: 1rem;
}

.content-left {
  display: flex;
  flex-direction: column;
}
</style>
