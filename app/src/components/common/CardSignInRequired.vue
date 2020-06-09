<template>
  <TmDataLoading v-if="!loaded" />
  <div v-else class="card-sign-in">
    <div v-if="session.developmentMode">
      <h2>Authenticate</h2>
      <div>
        <TmFormGroup
          field-id="sign-in-credentials"
          field-label="Signing Method"
        >
          <TmField
            id="email"
            v-model="email"
            type="input"
            placeholder="Email"
          />
          <TmField
            id="password"
            v-model="password"
            type="password"
            placeholder="Password"
          />
        </TmFormGroup>
      </div>
      <router-link
        class="app-menu-item hide-m"
        to="/email-authentication"
        exact="exact"
        @click.native="authenticate()"
      >
        <TmBtn class="send-button" value="Authenticate" type="secondary" />
      </router-link>
    </div>
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
</template>

<script>
import config from "src/../config"
import { mapState, mapGetters } from "vuex"
import TmField from "src/components/common/TmField"
import TmFormGroup from "src/components/common/TmFormGroup"
import LiSession from "common/TmLiSession"
import TmBtn from "common/TmBtn"
import TmDataLoading from "src/components/common/TmDataLoading"

export default {
  name: `card-sign-in-required`,
  components: { LiSession, TmDataLoading, TmBtn, TmField, TmFormGroup },
  data: () => ({
    isMobileApp: config.mobileApp,
    isExtension: config.isExtension,
    loaded: false,
    email: "",
    password: "",
    errorOnAuthentication: false,
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
    this.$store.dispatch("loadAccounts").then(() => {
      this.loaded = true
    })
  },
  methods: {
    async authenticate() {
      const error = await this.$store.dispatch(`userSignedIn`, {
        user: { email: this.email, password: this.password },
      })
      if (error) this.errorOnAuthentication = true
    },
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
  padding-left: 1.5rem;
}

.footnote {
  padding-left: 1.5rem;
  font-size: 12px;
  color: var(--link);
}

.card-sign-in {
  max-width: 600px;
  padding: 0 1rem 2rem;
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
