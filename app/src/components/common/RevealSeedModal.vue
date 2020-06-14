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
          ref="passwordInput"
          :key="passwordInputKey"
          v-model="password"
          :type="passwordInputType"
          placeholder="Password"
        />
        <div class="reveal-seed-show-password" @click="showPassword">
          <i class="material-icons notranslate">visibility</i>
        </div>
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
    passwordInputType: `password`,
    passwordInputKey: 0,
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
      // this.$refs.sessionFrame.goToPortfolio()
      this.$router.go(`-1`)
    },
    showPassword() {
      if (this.passwordInputType === `text`) {
        this.passwordInputType = `password`
      } else {
        this.passwordInputType = `text`
      }
      this.passwordInputKey += 1
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

.reveal-seed-show-password {
  cursor: pointer;
  border-radius: 50%;
  height: 2.5em;
  width: 2.5em;
  margin: 0.3em 0 0.25em;
  position: absolute;
  top: 0;
  right: 0.5em;
}
</style>
