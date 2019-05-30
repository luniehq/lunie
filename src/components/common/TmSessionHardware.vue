<template>
  <div class="session">
    <div class="session-container">
      <div class="session-header">
        <a @click="setState('explore')">
          <i class="material-icons session-back">arrow_back</i>
        </a>
        <h2 class="session-title">
          Use Address From Ledger Nano
        </h2>
        <a @click="$store.commit(`toggleSessionModal`, false)">
          <i class="material-icons session-close">close</i>
        </a>
        <p class="session-paragraph">
          Lunie supports both the Ledger Nano S and Ledger Nano X. If you don't
          have a Ledger Nano, you can support Lunie by
          <a href="" target="_blank" rel="noopener norefferer"
            >buying one here</a
          >.
        </p>
      </div>
      <div class="session-main">
        <HardwareState :loading="status === `detect` ? false : true">
          <template v-if="status === `connect` || status === `detect`">
            Please plug in your Ledger&nbsp;Nano&nbsp;S and open the Cosmos app
          </template>
          <template v-if="status === `confirmAddress`">
            Sign in with the address
            <span class="address">{{ address }}</span
            >.<br />
            Please confirm on your Ledger.
          </template>
          <p v-if="connectionError" class="error-message">
            {{ connectionError }}
          </p>
        </HardwareState>
      </div>
      <div class="session-footer">
        <p class="ledger-install footnote">
          Don't have the Cosmos Ledger App yet? Install it
          <a
            href="https://github.com/cosmos/voyager#ledger-cosmos-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            here </a
          >.
        </p>
        <TmBtn
          :value="submitCaption"
          :disabled="status === `connect` ? false : `disabled`"
          @click.native="signIn()"
        />
      </div>
    </div>
  </div>
</template>

<script>
import LiSession from "common/TmLiSession"
import TmBtn from "common/TmBtn"
import HardwareState from "common/TmHardwareState"
export default {
  name: `session-hardware`,
  components: {
    TmBtn,
    HardwareState,
    LiSession
  },
  data: () => ({
    status: `connect`,
    connectionError: null,
    address: null
  }),
  computed: {
    submitCaption() {
      return {
        connect: "Sign In",
        detect: "Waiting for Ledger",
        confirmAddress: "Confirming Address"
      }[this.status]
    }
  },
  methods: {
    setState(value) {
      this.$store.commit(`setSessionModalView`, value)
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
          sessionType: `ledger`,
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

.ledger-install {
  font-size: var(--sm);
  margin-bottom: 0;
}

.session-footer {
  padding: 0 1rem;
  justify-content: space-between;
}

.address {
  color: var(--link);
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}
</style>
