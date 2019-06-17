<template>
  <div
    id="session-welcome"
    class="tm-session"
  >
    <div class="tm-session-container">
      <div class="tm-session-header">
        <div class="tm-session-title">
          Sign in to Lunie
        </div>
        <a @click="closeSession">
          <i class="material-icons">close</i>
        </a>
      </div>

      <div class="tm-session-main">
        <LiSession
          icon="usb"
          title="Sign in with Ledger Nano"
          :disabled="!session.browserWithLedgerSupport"
          @click.native="
            () => session.browserWithLedgerSupport && setState('hardware')
          "
        >
          <div
            v-if="session.browserWithLedgerSupport"
            slot="li-session-subtitle"
          >
            If you have a Ledger Wallet, choose this option.<br />
            Don't have a Ledger yet?
            <a
              href="https://shop.ledger.com/?r=3dd204ef7508"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get one here</a>.
          </div>

          <div
            v-if="!session.browserWithLedgerSupport"
            slot="li-session-subtitle"
          >
            Please use Chrome, Opera, or Brave. Ledger is not supported in your
            current browser.
          </div>
        </LiSession>
        <LiSession
          id="explore-address"
          icon="search"
          title="Sign in with Address"
          subtitle="If you want to use Lunie with an address
            , choose this option."
          @click.native="setState('explore')"
        />
        <template v-if="session.insecureMode">
          <div class="danger-zone">
            <div class="header">
              <h1>DANGER ZONE</h1>
              <p>
                Never use accounts created in the browser on a real network.
                You
                could lose all your money.
              </p>
            </div>
            <LiSession
              v-if="accountExists"
              id="sign-in-with-account"
              icon="lock"
              title="Sign in with password"
              subtitle="If you have an account, choose this option."
              @click.native="setState('sign-in')"
            />
            <LiSession
              icon="person_add"
              title="Create new account"
              subtitle="Generate a brand new seed and create a new account."
              @click.native="setState('sign-up')"
            />
            <LiSession
              v-if="session.developmentMode"
              id="import-seed"
              icon="settings_backup_restore"
              title="Import with seed"
              subtitle="Use an existing seed phrase to create an account."
              @click.native="setState('import')"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import LiSession from "common/TmLiSession"
export default {
  name: `tm-session-welcome`,
  components: {
    LiSession
  },
  computed: {
    ...mapGetters([`session`, `lastPage`, `keystore`]),
    accountExists() {
      return this.keystore.accounts.length > 0
    }
  },
  methods: {
    setState(value) {
      this.$store.commit(`setSessionModalView`, value)
    },
    closeSession() {
      this.$store.commit(`toggleSessionModal`, false)
    }
  }
}
</script>
<style scoped>
.danger-zone {
  border: 1px solid var(--danger);
}

.danger-zone .header {
  color: var(--danger);
  padding: 1rem 1rem 0 1rem;
}
</style>
