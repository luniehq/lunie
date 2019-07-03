<template>
  <div id="session-existing" class="session">
    <h2 class="session-title">
      Use an existing address
    </h2>

    <div class="session-list">
      <LiSession
        id="explore-with-address"
        icon="language"
        title="Explore with any address"
        route="explore"
      />
      <LiSession
        id="use-ledger-nano"
        icon="vpn_key"
        title="Use Ledger Nano"
        route="ledger"
      />
      <LiSession
        v-if="session.experimentalMode"
        id="use-extension"
        icon="laptop"
        title="Use Lunie Chrome extension"
        route="extension"
      >
      </LiSession>
      <LiSession
        v-if="session.insecureMode"
        id="recover-with-backup"
        icon="settings_backup_restore"
        title="Recover with backup code"
        route="recover"
      />
      <LiSession
        v-if="accountExists && session.insecureMode"
        id="sign-in-with-account"
        icon="lock"
        title="Sign in with account"
        route="login"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import LiSession from "common/TmLiSession"
export default {
  name: `session-existing`,
  components: {
    LiSession
  },
  computed: {
    ...mapGetters([`session`, `keystore`]),
    accountExists() {
      return this.keystore && this.keystore.accounts.length > 0
    }
  }
}
</script>
<style scoped>
.form-group a {
  cursor: pointer;
}

.session-title {
  padding-left: 1rem;
}
</style>
