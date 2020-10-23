<template>
  <SessionFrame icon="build" hide-back>
    <div class="select-account">
      <AccountList :accounts="accounts" is-select-account />
    </div>
  </SessionFrame>
</template>

<script>
import SessionFrame from "common/SessionFrame"
import AccountList from "account/AccountList"
import { mapState } from "vuex"

export default {
  name: `manage-accounts-modal`,
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
    showSeed(account) {
      if (this.$route.name !== `reveal`) {
        this.$router.push({
          name: `reveal`,
          params: { address: account.address },
        })
      }
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
