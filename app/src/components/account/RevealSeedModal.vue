<template>
  <SessionFrame ref="sessionFrame">
    <div v-if="!wallet" class="session-container">
      <h2 class="session-title">
        You are about to reveal your seed phrase or private key
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
          :type="passwordInputType"
          placeholder="Password"
        />
        <div class="reveal-seed-show-password" @click="showPassword">
          <i class="material-icons notranslate">visibility</i>
        </div>
        <TmFormMsg v-if="$v.password.$error" name="Password" type="required" />
        <TmFormMsg
          v-if="wrongPasswordError"
          type="custom"
          msg="Wrong password"
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
      <h2 class="session-title">Your account</h2>
      <div v-if="wallet.seedPhrase">
        <h3 class="subtitle">Seed phrase</h3>
        <p>{{ wallet.seedPhrase }}</p>
      </div>
      <div v-if="wallet.privateKey">
        <h3 class="subtitle">Private key</h3>
        <p>{{ wallet.privateKey }}</p>
      </div>
      <div v-if="wallet.publicKey">
        <h3 class="subtitle">Public key</h3>
        <p>{{ wallet.publicKey }}</p>
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
  }),
  mounted() {
    this.address = this.$route.params.address
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
      this.wallet = wallet
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
p {
  overflow-wrap: anywhere;
  margin-top: 1em;
  color: var(--menu-bright);
}

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

.session-container {
  margin-top: 2em;
}

.reveal-seed-buttons {
  display: flex;
  justify-content: space-between;
  margin: 3.5em 0 0;
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
  height: 2.5em;
  width: 2.5em;
  position: absolute;
  top: 1em;
  right: 0.75em;
}

.subtitle {
  font-size: var(--h3);
  color: var(--bright);
  font-weight: 500;
  padding: 1rem 0 0.5rem 0;
  text-align: center;
}

.session-title {
  color: #fff7c4;
}

.reveal-seed-form-group.tm-form-group {
  margin-top: 6rem;
}
</style>
