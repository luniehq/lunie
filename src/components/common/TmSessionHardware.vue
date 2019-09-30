<template>
  <SessionFrame>
    <h2 class="session-title">
      Use my Ledger Nano
    </h2>

    <template v-if="session.browserWithLedgerSupport">
      <div class="session-main">
        <p v-if="session.windowsDevice" class="form-message notice">
          {{ session.windowsWarning }}
        </p>
        <HardwareState :loading="status === `connect` ? false : true">
          <template v-if="status === `connect` || status === `detect`">
            <p>
              Please plug in your Ledger&nbsp;Nano and open the Cosmos Ledger
              app
            </p>
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
  </SessionFrame>
</template>

<script>
import TmBtn from "common/TmBtn"
import { mapState } from "vuex"
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
    ...mapState([`session`]),
    submitCaption() {
      return {
        connect: "Sign In",
        detect: "Waiting for Ledger"
      }[this.status]
    }
  },
  methods: {
    async signIn() {
      this.connectionError = null
      this.status = `detect`
      this.address = null
      try {
        this.address = await this.$store.dispatch(`connectLedgerApp`)
        this.$router.push(`/`)
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

.address {
  color: var(--link);
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.form-message {
  font-size: var(--sm);
  font-weight: 500;
  font-style: italic;
  color: var(--dim);
  display: inline-block;
}

.form-message.notice {
  border-radius: 0.25rem;
  border: 1px solid var(--bc-dim);
  background-color: #1c223e;
  font-weight: 300;
  margin: 2rem 0;
  padding: 1rem 1rem;
  font-size: 14px;
  font-style: normal;
  width: 100%;
}
</style>
