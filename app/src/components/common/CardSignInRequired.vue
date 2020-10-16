<template>
  <SessionFrame icon="account_box">
    <div class="card-sign-in">
      <h2>Welcome to Lunie 👋</h2>
      <h3>How would you like to get started?</h3>

      <div class="session-list">
        <LiSession
          v-if="session.insecureMode || (isMobileApp && !accountExists)"
          id="create-new-address"
          icon="person_add"
          title="Create a new address"
          route="/select-network/create"
        />
        <LiSession
          v-if="
            !isMobileApp &&
            !isExtension &&
            currentNetwork.network_type !== `polkadot`
          "
          id="use-ledger-nano"
          icon="vpn_key"
          title="Ledger Nano"
          route="/ledger"
        />
        <LiSession
          id="explore-with-address"
          icon="language"
          title="Explore with any address"
          route="/explore"
        />
        <LiSession
          v-if="isMobileApp || session.insecureMode"
          id="recover-with-backup"
          icon="settings_backup_restore"
          title="Recover with backup code"
          route="/select-network/recover"
        />
      </div>
      <router-link
        v-if="!isMobileApp || accountExists"
        :to="createAccountLink"
        class="footnote"
      >
        Want to create a new address?
      </router-link>
    </div>
  </SessionFrame>
</template>

<script>
import config from "src/../config"
import { mapState, mapGetters } from "vuex"
import LiSession from "session/TmLiSession"
import SessionFrame from "common/SessionFrame"
import TmDataLoading from "src/components/common/TmDataLoading"

export default {
  name: `card-sign-in-required`,
  components: {
    LiSession,
    SessionFrame,
  },
  data: () => ({
    isMobileApp: config.mobileApp,
    isExtension: config.isExtension,
    loaded: false,
  }),
  computed: {
    ...mapState([`session`, `keystore`, `extension`]),
    ...mapGetters([`currentNetwork`]),
    accountExists() {
      return this.keystore && this.keystore.accounts.length > 0
    },
    createAccountLink() {
      return this.isMobileApp || this.session.insecureMode
        ? `/select-network/create`
        : `/create`
    },
  },
  created() {
    this.$store.dispatch("loadLocalAccounts").then(() => {
      this.loaded = true
    })
  },
}
</script>
<style scoped>
h2 {
  font-size: 24px;
  color: var(--bright);
  font-weight: 400;
}

h2,
h3 {
  text-align: center;
}

.footnote {
  padding-left: 1.5rem;
  font-size: 12px;
  color: var(--link);
}

.card-sign-in {
  max-width: 600px;
  padding: 1rem 0;
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
