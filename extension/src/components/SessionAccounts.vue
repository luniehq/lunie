<template>
  <SessionFrame :hide-back="true">
    <div class="session-container">
      <div class="accounts-header">
        <h2 class="session-title">
          <img class="lunie-logo" src="../images/lunie-logo-white.svg" />
        </h2>
      </div>
      <SunsettingWarningBar />
      <div class="accounts-header">
        <p>
          You can use the account(s) below to explore Lunie.io and to approve
          transactions.
        </p>
      </div>
      <div class="session-main">
        <AccountList
          :accounts="accounts"
          :button-action="goToLunie"
          button-text="Go to Lunie"
        />
        <router-link to="/select-network/recover">Import Account</router-link>
      </div>
    </div>
  </SessionFrame>
</template>

<script>
import AccountList from 'account/AccountList'
import SessionFrame from 'common/SessionFrame'
import SunsettingWarningBar from './SunsettingWarningBar'
import config from 'config'

export default {
  name: `session-accounts`,
  components: {
    AccountList,
    SessionFrame,
    SunsettingWarningBar
  },
  computed: {
    accounts() {
      return this.$store.state.accounts
    }
  },
  methods: {
    async goToLunie(account) {
      // needs to fetch network from address prefix if no network provided
      if (!account.network) {
        account.network = await this.$store.dispatch(
          `getNetworkByAddress`,
          account.address
        )
      }
      window.open(
        `${config.lunieLink}/extension/${account.address}/${account.network}`,
        '_blank',
        'noreferrer noopener'
      )
    }
  }
}
</script>

<style scoped>
.session-container p {
  font-size: 14px;
  color: var(--txt);
}

.back-link {
  font-size: 12px;
  padding: 0 1rem;
}

.lunie-logo {
  margin: 0.5rem 0;
  height: 32px;
}
</style>
