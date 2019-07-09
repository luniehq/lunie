<template>
  <SessionFrame>
    <div class="session">
      <div class="session-container">
        <div class="session-header">
          <h2 class="session-title">My accounts</h2>
          <p>
            You can use the accounts below to explore Lunie.io and to approve
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
        <div class="session-footer">
          <router-link to="/welcome">Want to add another account?</router-link>
        </div>
      </div>
    </div>
  </SessionFrame>
</template>

<script>
import AccountList from 'common/AccountList'
import SessionFrame from 'common/SessionFrame'
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
    goToWelcome() {
      this.$router.push(`/welcome`)
    },
    goToLunie() {
      window.open(
        'https://lunie.io/#/extension',
        '_blank',
        'noreferrer noopener'
      )
    }
  }
}
</script>

<style scoped>
.button-add-account {
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem 0 1rem;
  flex-grow: 1;
  align-self: flex-end;
}
</style>
