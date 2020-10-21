<template>
  <SessionFrame ref="sessionFrame">
    <div v-if="!wallet" class="session-container">
      <h2 class="title reveal-title">
        You are about to reveal<br />
        <span class="pill">your seed phrase.</span>
      </h2>
      <TmFormGroup
        :error="
          ($v.password.$error && $v.password.$invalid) || wrongPasswordError
        "
        class="reveal-seed-form-group"
        field-id="password"
      >
        <TmField
          id="password"
          ref="passwordInput"
          :key="passwordInputKey"
          v-model="password"
          class="passwordInput"
          :type="passwordInputType"
          placeholder="Password"
        />
        <div class="reveal-seed-show-password" @click="showPassword">
          <i class="material-icons notranslate">visibility</i>
        </div>
        <TmFormMsg v-if="$v.password.$error" name="Password" type="required" />
        <TmFormMsg
          v-else-if="wrongPasswordError"
          type="custom"
          msg="Wrong password"
        />
        <TmFormMsg
          v-if="recoveryError && isExtension"
          type="custom"
          msg="Your seed couldn't be recovered. Please contact our team"
        />
        <TmFormMsg
          v-if="recoveryError && !isExtension"
          type="custom"
          msg="Your seed couldn't be recovered. Please try again on extension"
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
      <div v-if="wallet.seedPhrase" class="seed-container">
        <p class="title">Seed Phrase</p>
        <p class="length">{{ wallet.seedPhrase.split(` `).length }} words</p>
        <span
          v-for="word in wallet.seedPhrase.split(` `)"
          :key="word"
          class="seed-word"
          >{{ word }}</span
        >
      </div>
      <div v-else-if="wallet.privateKey" class="private-key-container">
        <p class="title">Private Key</p>
        <p class="private-key">{{ wallet.privateKey }}</p>
      </div>
      <p class="message">
        Be sure not to share your
        <span v-if="wallet.seedPhrase">seed phrase</span>
        <span v-else>private key</span> with anyone you don't trust
      </p>
      <div
        v-clipboard:copy="seedOrPrivateKey"
        v-clipboard:success="() => onCopy()"
        class="copy-to-clipboard"
      >
        Copy to clipboard
        <i
          class="material-icons notranslate copied"
          :class="{ active: copySuccess }"
        >
          check
        </i>
        <i class="material-icons notranslate copy-icon"> content_copy </i>
      </div>
    </div>
  </SessionFrame>
</template>

<script>
import SessionFrame from "common/SessionFrame"
import TmFormGroup from "common/TmFormGroup"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import TmBtn from "common/TmBtn"
import config from "src/../config"
import { required } from "vuelidate/lib/validators"
export default {
  name: `reveal-seed`,
  components: {
    SessionFrame,
    TmFormGroup,
    TmFormMsg,
    TmField,
    TmBtn,
  },
  data: () => ({
    password: "",
    isExtension: config.isExtension,
    wallet: undefined,
    passwordInputType: `password`,
    passwordInputKey: 0,
    wrongPasswordError: false,
    recoveryError: false,
    copySuccess: false,
  }),
  computed: {
    address() {
      return this.$route.params.address
    },
    seedOrPrivateKey() {
      if (this.wallet.seedPhrase) {
        return this.wallet.seedPhrase
      } else if (this.wallet.privateKey) {
        return this.wallet.privateKey
      } else {
        return ``
      }
    },
  },
  methods: {
    async revealSeedPhrase() {
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      let wallet
      try {
        wallet = await this.$store.dispatch(`getWallet`, {
          address: this.address,
          password: this.password,
        })
      } catch (error) {
        this.wrongPasswordError = true
        return
      }
      // check if seedPhrase or privKey is present
      if (wallet && (wallet.seedPhrase || wallet.privateKey)) {
        this.wallet = wallet
      } else {
        this.recoveryError = true
      }
    },
    close() {
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
    onCopy() {
      this.copySuccess = true
      setTimeout(() => {
        this.copySuccess = false
      }, 2500)
    },
  },
  validations() {
    return {
      password: {
        required,
      },
    }
  },
}
</script>

<style scoped>
/* Somehow this is not being detected in extension. Needs to be here */
.material-icons {
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
}

.reveal-seed-buttons {
  display: flex;
  justify-content: space-between;
  margin: 1em 0 0;
}

.reveal-seed-button {
  flex: 0.5;
  height: 4em;
}

.reveal-seed-button.button.secondary {
  margin-right: 1em;
}

.reveal-seed-show-password {
  color: var(--txt);
  cursor: pointer;
  border-radius: 50%;
  height: 2em;
  width: 2em;
  position: absolute;
  top: 1.5em;
  right: 0;
}

.reveal-seed-show-password .copied {
  font-size: 20px;
}

h2.title {
  font-size: var(--h1);
  line-height: 42px;
  color: var(--bright);
  font-weight: 400;
  padding: 0.5rem 0 1rem 0;
  text-align: center;
}

h2.reveal-title {
  margin-top: 3.5em;
}

.reveal-seed-form-group.tm-form-group {
  margin-top: 5em;
}

.pill {
  background-color: #2d2e31;
  display: inline-block;
  color: var(--menu-bright);
  padding: 0 0.6em 0.2em;
  border-radius: 2em;
}

.passwordInput {
  height: 4em !important;
}

.private-key-container,
.seed-container {
  position: relative;
  margin-top: 2em;
  background-color: #07080c;
  padding: 0.5em;
  border-radius: 0.25em;
}

.seed-word {
  background-color: #b0bade;
  color: #07080c;
  display: inline-block;
  padding: 0.2em 0.8em 0.3em 0.8em;
  border-radius: 0.2em;
  font-weight: 500;
  margin: 0.25rem;
}

.private-key-container .title,
.seed-container .title {
  color: var(--bright);
  font-size: 70%;
  margin: 0 0 0.5rem 0.25em;
}

.seed-container .length {
  position: absolute;
  color: #9ca6c7;
  font-size: 70%;
  top: 0.25em;
  right: 0.75em;
}

.private-key-container .private-key {
  word-break: break-all;
  color: var(--bright);
}

.message {
  margin-top: 4em;
  color: var(--bright);
  font-size: 70%;
}

.copy-to-clipboard {
  position: relative;
  display: block;
  margin-top: 1em;
  height: 4em;
  width: 100%;
  cursor: pointer;
  color: var(--bright);
  border: 1px solid #9ca6c7;
  border-radius: 0.25em;
  padding: 1rem;
  font-weight: 500;
}

.copy-to-clipboard .copy-icon {
  position: absolute;
  top: 0.7em;
  right: 0.8em;
  font-size: 24px;
}

.copy-to-clipboard .copied {
  padding-bottom: 2px;
  padding-right: 0;
  transition: opacity 500ms ease;
  color: var(--success);
  opacity: 0;
  font-size: 12px;
}

.copy-to-clipboard .copied.active {
  opacity: 1;
}
</style>
