<template>
  <div class="card-sign-in">
    <h2>Welcome to Lunie</h2>
    <h3>How would you like to get started?</h3>

    <div class="session-list">
      <LiSession
        v-if="!isMobileApp"
        id="use-ledger-nano"
        icon="vpn_key"
        title="Ledger Nano"
        route="/ledger"
      />
      <LiSession
        v-if="!isMobileApp"
        id="use-extension"
        icon="laptop"
        title="Lunie Browser Extension"
        route="/extension"
      >
      </LiSession>
      <LiSession
        v-if="accountExists && (session.insecureMode || isMobileApp)"
        id="sign-in-with-account"
        icon="lock"
        title="Sign in with account"
        route="/login"
      />
      <LiSession
        v-if="isMobileApp || session.insecureMode"
        id="recover-with-backup"
        icon="settings_backup_restore"
        title="Recover with backup code"
        route="/select-network/recover"
      />
      <LiSession
        id="explore-with-address"
        icon="language"
        title="Explore with any address"
        route="/explore"
      />
    </div>
    <router-link to="/create" class="footnote">
      Want to create a new address?
    </router-link>
  </div>
</template>

<script>
import config from "src/../config"
import { mapState } from "vuex"
import LiSession from "common/TmLiSession"

export default {
  name: `card-sign-in-required`,
  components: { LiSession },
  data: () => ({
    isMobileApp: config.mobileApp
  }),
  computed: {
    ...mapState([`session`, `keystore`, `extension`]),
    accountExists() {
      return this.keystore && this.keystore.accounts.length > 0
    }
  },
  created() {
    this.$store.dispatch("loadAccounts")
  }
}
</script>
<style scoped>
h2 {
  font-size: 24px;
  color: white;
  font-weight: 300;
}

h2,
h3 {
  padding-left: 1.5rem;
}

.footnote {
  padding-left: 1.5rem;
  font-size: 12px;
}

.card-sign-in {
  max-width: 600px;
  padding: 0 1rem;
  margin: 0 auto;
  width: 100%;
}

.session-list {
  width: 100%;
  padding: 2rem 0;
}

@media screen and (max-width: 667px) {
  h2,
  h3 {
    text-align: center;
    padding-left: 0;
  }
}
</style>
