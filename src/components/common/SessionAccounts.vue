<template>
  <SessionFrame>
    <div class="session">
      <div class="session-container">
        <h2 class="session-title">My accounts</h2>
        <div class="session-main">
          <p>
            You can use the accounts below to explore
            <router-link to="/wallet">
              Lunie
            </router-link>
            and to approve transactions.
          </p>

          <AccountList :accounts="accounts" />

          <div class="button-add-account">
            <TmBtn value="Add Another Account" to="/accounts" color="primary" />
          </div>
        </div>
      </div>
    </div>
  </SessionFrame>
</template>

<script>
import AccountList from "common/AccountList"
import Bech32 from "common/Bech32"
import SessionFrame from "common/SessionFrame"
import TmBtn from "common/TmBtn"
export default {
  name: `session-accounts`,
  components: {
    AccountList,
    Bech32,
    SessionFrame,
    TmBtn
  },
  computed: {
    accounts() {
      let accounts = this.$store.state.accounts
      return accounts.map(({ name, address }) => ({
        address,
        name
      }))
    }
  }
}
</script>

<style scoped>
.button-add-account {
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem 0 1rem;

  /* keeps button in bottom right no matter the size of the action modal */
  flex-grow: 1;
  align-self: flex-end;
}
</style>
