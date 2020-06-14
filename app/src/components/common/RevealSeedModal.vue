<template>
  <SessionFrame ref="sessionFrame">
    <div v-if="!wallet" class="session-container">
      <h2 class="session-title">
        You are about to reveal your seed phrase or private key
      </h2>
      <!-- will be displayed once the user enters password and clicks "Reveal" -->
      <div v-if="wallet">
        <!-- TODO: toggle between "seed" or "private key" depending on what the function returned  -->
        <h4>Your secret key is:</h4>
        <div class="reveal-seed-secret-key-container">
          {{ wallet.mnemonic }}
        </div>
      </div>
      <TmFormGroup class="reveal-seed-form-group" field-id="password">
        <TmField
          id="password"
          v-model="password"
          type="password"
          placeholder="Password"
        />
        <div class="reveal-seed-buttons">
          <TmBtn
            value="Dismiss"
            type="secondary"
            class="reveal-seed-button"
            @click.native="close"
            @click.enter.native="close"
          />
          <TmBtn
            value="Reveal"
            type="primary"
            class="reveal-seed-button"
            @click.native="revealSeedPhrase"
            @click.enter.native="revealSeedPhrase"
          />
        </div>
      </TmFormGroup>
    </div>
    <div v-else class="session-container">
      <h2 class="session-title">Account: {{ wallet.name }}</h2>
      <p v-if="wallet.seedPhrase">Seed Phrase: {{ wallet.seedPhrase }}</p>
      <p>Private Key: {{ wallet.privateKey }}</p>
      <p>Public Key: {{ wallet.publicKey }}</p>
    </div>
  </SessionFrame>
</template>

<script>
import SessionFrame from "common/SessionFrame"
import TmFormGroup from "common/TmFormGroup"
import TmField from "common/TmField"
import TmBtn from "common/TmBtn"
import config from "src/../config"
export default {
  name: `reveal-seed`,
  components: {
    SessionFrame,
    TmFormGroup,
    TmField,
    TmBtn,
  },
  data: () => ({
    password: "",
    isExtension: config.isExtension,
    wallet: undefined,
  }),
  mounted() {
    this.address = this.$route.params.address
  },
  methods: {
    async revealSeedPhrase() {
      const wallet = await this.$store.dispatch(`getWalletSeed`, {
        address: this.address,
        password: this.password,
      })
      this.wallet = wallet
    },
    close() {
      // TODO: handle extension case
      this.$refs.sessionFrame.goToPortfolio()
    },
  },
}
</script>

<style scoped>
p {
  color: var(--menu-bright);
}

.reveal-seed-buttons {
  display: flex;
  justify-content: space-between;
  margin: 1em 0 0;
}

.reveal-seed-button {
  flex: 0.5;
  height: 3.5em;
}

.reveal-seed-button.button.secondary {
  margin-right: 1em;
}

.reveal-seed-secret-key-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 60%;
  padding: 1rem;
  background: var(--app-fg);
  border-radius: 0.6rem;
  border: 2px solid var(--bc-dim);
}
</style>
