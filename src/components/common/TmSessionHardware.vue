<template>
  <session-frame>
    <div class="session">
      <h2 class="session-title">
        Use my Ledger Nano
      </h2>

      <template v-if="session.browserWithLedgerSupport">
        <div class="session-main">
          <HardwareState :loading="status === `connect` ? false : true">
            <template v-if="status === `connect` || status === `detect`">
              Please plug in your Ledger&nbsp;Nano&nbsp;S and open the Cosmos
              app
            </template>
            <p v-if="connectionError" class="error-message">
              {{ connectionError }}
            </p>
            <TmBtn
              :value="submitCaption"
              :disabled="status === `connect` ? false : `disabled`"
              @click.native="signIn()"
            />
          </HardwareState>
        </div>
      </template>

      <div v-else class="session-main">
        <p>
          Please use Chrome, Opera, or Brave. Ledger is not supported in this
          browser.
        </p>
      </div>
    </div>
  </session-frame>
</template>

<script>
import TmBtn from "common/TmBtn"
import { mapGetters } from "vuex"
import HardwareState from "common/TmHardwareState"
import SessionFrame from "common/SessionFrame"
export default {
  name: `session-hardware`,
  components: {
    TmBtn,
    SessionFrame,
    HardwareState
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
        detect: "Waiting for Ledger"
      }[this.status]
    }
  },
  methods: {
    setState(value) {
      this.$emit(`route-change`, value)
    },
    goBack() {
      this.$emit(`route-change`, "existing")
    },
    close() {
      this.$emit(`close`)
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

      await this.$store.dispatch(`signIn`, {
        sessionType: `ledger`,
        address: this.address
      })
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
