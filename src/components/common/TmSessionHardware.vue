<template>
  <div class="tm-session">
    <div class="tm-session-container">
      <div class="tm-session-header">
        <a @click="setState('welcome')">
          <i class="material-icons">arrow_back</i>
        </a>
        <div class="tm-session-title">
          Sign In
        </div>
        <a @click="$store.commit(`toggleSessionModal`, false)">
          <i class="material-icons">close</i>
        </a>
      </div>
      <div class="tm-session-main">
        <hardware-state :loading="status === `detect` ? true : false">
          Please plug in your Ledger&nbsp;Nano&nbsp;S and open the Cosmos app
          <p v-if="connectionError" class="error-message">
            {{ connectionError }}
          </p>
        </hardware-state>
      </div>
      <div class="tm-session-footer">
        <p class="ledger-install">
          Don't have the Cosmos Ledger App yet? Install it
          <a
            href="https://github.com/cosmos/voyager#ledger-cosmos-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>.
        </p>
        <tm-btn value="Sign In" @click.native="connectLedger()" />
      </div>
    </div>
  </div>
</template>

<script>
import TmBtn from "common/TmBtn"
import HardwareState from "common/TmHardwareState"
export default {
  name: `tm-session-hardware`,
  components: { TmBtn, HardwareState },
  data: () => ({
    status: `connect`,
    connectionError: null
  }),
  methods: {
    setState(value) {
      this.$store.commit(`setSessionModalView`, value)
    },
    setStatus(value) {
      this.status = value
    },
    setConnectionError(error) {
      this.connectionError = error
    },
    async connectLedger() {
      this.setStatus(`detect`)
      try {
        await this.$store.dispatch(`connectLedgerApp`)
      } catch (error) {
        this.setStatus(`connect`)
        this.setConnectionError(error.message)
      }
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

.tm-session-footer {
  padding: 0 1rem;
  justify-content: space-between;
}
</style>
