<template>
  <SessionFrame :hide-back="true">
    <div class="session-container">
      <div class="accounts-header">
        <h2 class="session-title">
          <img class="lunie-logo" src="../images/lunie-logo-white.svg" />
        </h2>
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
      </div>
      <router-link class="back-link" to="/welcome"
        >Want to add another account?</router-link
      >
    </div>
  </SessionFrame>
</template>

<script>
import AccountList from 'common/AccountList'
import SessionFrame from 'common/SessionFrame'
import config from 'config'
export default {
  name: `session-accounts`,
  components: {
    AccountList,
    SessionFrame
  },
  computed: {
    accounts() {
      return this.$store.state.accounts
    }
  },
  methods: {
    goToLunie() {
      window.open(
        `${config.lunieLink}/#/extension`,
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
