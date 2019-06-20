<template>
  <TmPage
    class="accounts"
    :hide-header="true"
  >
    <ToolBar :display-text="true"/>
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
    <div class="card content">
      <div class="content-left">
        <h3>Thanos</h3>
        <Bech32 :address="this.address" short-form />
      </div>
      <TmBtn
        value="Go to Lunie"
        color="primary"
      />
    </div>
  </TmPage>
</template>

<script>
  import TmPage from "common/TmPage"
  import TmBtn from "common/TmBtn"
  import ToolBar from "common/ToolBar"
  import Bech32 from "common/Bech32"
  export default {
    name: `ext-accounts`,
    components: {
      TmPage,
      TmBtn,
      ToolBar,
      Bech32
    },
    props: {
      address: {
        type: String,
        //Remove Default
        default: "cosmos1ek9cd8ewgxg9w5x3benji0uf4aaxaruvcw4v9e",
        required: true
      }
    },
  }
</script>

<style scoped>
.accounts {
  padding: 2rem;
  background: var(--app-fg);
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