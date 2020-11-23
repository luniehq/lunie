<template>
  <SessionFrame icon="exit_to_app" hide-back>
    <p>
      The Lunie Web Wallet has sunset. Thank you for your support!
    </p>
    <br />
    <a href="http://help.lunie.io/en/collections/2624438-lunie-address-migration-guides">
      Migration Guides
    </a>
    <br/>
    <template v-if="accounts.length > 0">
      <p>
        Extract your seeds by clicking on the 3 dots, right side of your key.
      </p>
      <div class="select-account">
        <AccountList :accounts="accounts" is-select-account />
      </div>
    </template>
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
    ...mapState([`keystore`]),
    accounts() {
      return this.keystore.accounts.map(account => ({
        ...account,
        sessionType: "local"
      }))
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
   mounted() {
     this.$store.dispatch("loadLocalAccounts")
   }
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
