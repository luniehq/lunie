<template>
  <div class="session">
    <div class="session-container">
      <SessionFrame previous-route="existing" :nested-back="false">
        <template v-slot:title>
          Use Lunie Chrome extension
        </template>
      </SessionFrame>
      <div v-if="!session.extensionInstalled" class="session-main">
        <p>
          Please install the Lunie Extension for Chrome from the Google Play
          Store.
        </p>
      </div>
      <div v-if="session.extensionInstalled">
        <div class="session-main">
          <HardwareState :icon="session.extensionInstalled ? 'laptop' : 'info'">
            <div v-if="!session.extensionInstalled">
              Click below to open the Lunie Chrome Extension
            </div>
            <div v-else>
              Use the Lunie Chrome extension to securely store your keys, and
              safely perform transactions.
            </div>
          </HardwareState>
        </div>
        <div class="session-footer">
          <p class="ledger-install">
            You can find the Lunie Chrome extension on the
            <a href="">Google Play Store</a>.
          </p>
          <TmBtn
            :value="submitCaption"
            :disabled="!session.extensionInstalled"
            @click.native="signIn()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TmBtn from "common/TmBtn"
import { mapGetters } from "vuex"
import HardwareState from "common/TmHardwareState"
import SessionFrame from "common/SessionFrame"
export default {
  name: `session-extension`,
  components: {
    TmBtn,
    HardwareState,
    SessionFrame
  },
  data: () => ({
    status: `connect`,
    connectionError: null,
    address: null
  }),
  computed: {
    ...mapGetters([`session`]),
    submitCaption() {
      return {
        connect: "Sign In",
        detect: "Opening Extension",
        confirmAddress: "Confirming Address"
      }[this.status]
    }
  },
  methods: {
    setState(value) {
      this.$emit(`route-change`, value)
    },
    async signIn() {
      this.connectionError = null
      this.status = `detect`
      this.address = null
      try {
        this.address = await this.$store.dispatch(`connectLedgerApp`)
      } catch ({ message }) {
        this.status = `connect`
        this.connectionError = message
        return
      }

      this.status = `confirmAddress`
      if (await this.confirmAddress()) {
        await this.$store.dispatch(`signIn`, {
          sessionType: `extension`,
          address: this.address
        })
        return
      }

      this.status = `connect`
    },
    async confirmAddress() {
      try {
        await this.$store.dispatch("confirmLedgerAddress")
        return true
      } catch ({ message }) {
        this.connectionError = message
      }
      return false
    }
  }
}
</script>
<style scoped>
.error-message {
  color: var(--danger);
  font-size: var(--sm);
  font-style: italic;
  margin-bottom: 0;
  padding-top: 1rem;
}

.install-notes {
  flex-direction: column;
}

.ledger-install {
  font-size: var(--sm);
  margin-bottom: 0;
}

.session-footer {
  justify-content: space-between;
}

.address {
  color: var(--link);
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}
</style>
