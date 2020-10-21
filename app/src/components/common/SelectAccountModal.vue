<template>
  <SessionFrame ref="sessionFrame" icon="account_box" hide-back>
    <div class="select-account">
      <AccountList
        :accounts="accounts"
        :button-action="showSeed"
        :button-text="`Show Seed`"
      />
    </div>
  </SessionFrame>
</template>

<script>
import SessionFrame from "common/SessionFrame"
import AccountList from "account/AccountList"
import { mapState } from "vuex"

export default {
  name: `select-account-modal`,
  components: {
    SessionFrame,
    AccountList,
  },
  computed: {
    ...mapState([`session`]),
    accounts() {
      return this.session.userAccounts
    },
  },
  methods: {
    showSeed() {
      console.log(`Show Seed`)
    },
    close() {
      this.$refs.sessionFrame.closeModal()
    },
  },
}
</script>

<style scoped>
.select-account {
  max-width: 600px;
  padding: 1rem 0;
  margin: 0 auto;
  width: 100%;
}
</style>
