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

          <AccountList
            :accounts="accounts"
            :button-action="goToLunie"
            :button-text="`Go to Lunie`"
          />

          <div class="button-add-account">
            <TmBtn
              value="Add Another Account"
              color="primary"
              @click.native="goToWelcome"
            />
          </div>
        </div>
      </div>
    </div>
  </SessionFrame>
</template>

<script>
import AccountList from "common/AccountList"
import SessionFrame from "common/SessionFrame"
import TmBtn from "common/TmBtn"
export default {
  name: `session-accounts`,
  components: {
    AccountList,
    SessionFrame,
    TmBtn
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
        "https://lunie.io/extension",
        "_blank",
        "nofollow noreferrer noopener"
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
