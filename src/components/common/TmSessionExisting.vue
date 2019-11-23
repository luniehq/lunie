<template>
  <SessionFrame>
    <div id="session-existing">
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
          v-if="!isMobileApp"
          id="use-ledger-nano"
          icon="vpn_key"
          title="Use Ledger Nano"
          route="ledger"
        />
        <LiSession
          v-if="!isMobileApp"
          id="use-extension"
          icon="laptop"
          title="Use Lunie Browser Extension"
          route="extension"
        >
        </LiSession>
        <LiSession
          v-if="accountExists && (session.insecureMode || isMobileApp)"
          id="sign-in-with-account"
          icon="lock"
          title="Sign in with account"
          route="login"
        />
        <LiSession
          v-if="isMobileApp || session.insecureMode"
          id="recover-with-backup"
          icon="settings_backup_restore"
          title="Recover with backup code"
          route="recover"
        />
      </div>
      <router-link to="create" class="footnote">
        Want to create a new address?
      </router-link>
    </div>
  </SessionFrame>
</template>

<script>
import config from "src/../config"
import { mapState } from "vuex"
import LiSession from "common/TmLiSession"
import SessionFrame from "common/SessionFrame"
export default {
  name: `session-existing`,
  components: {
    SessionFrame,
    LiSession
  },
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
