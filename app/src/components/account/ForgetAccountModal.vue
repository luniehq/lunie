<template>
  <SessionFrame ref="sessionFrame">
    <div v-if="!isAccountDeleted" class="session-container">
      <h2 class="title forget-title">
        You are about to remove<br />
        <span class="pill">your account.</span>
      </h2>
      <TmFormGroup
        :error="$v.$error && $v.seed.$invalid"
        class="forget-account-form-group"
        field-id="password"
      >
        <FieldSeed
          id="import-seed"
          v-model="seed"
          :value="seed"
          :placeholder="
            isPolkadot
              ? 'Must be your seed phrase or private key hash'
              : 'Must be exactly 12 or 24 words'
          "
          @input="(val) => (seed = val)"
        />
        <TmFormMsg
          v-if="$v.seed.$error && !$v.seed.required"
          name="Seed"
          type="required"
        />
        <TmFormMsg
          v-else-if="$v.seed.$error && !$v.seed.seedHasCorrectLength"
          name="Seed"
          :type="isPolkadot ? 'incorrectPolkadotSeed' : 'words12or24'"
        />
        <TmFormMsg
          v-else-if="$v.seed.$error && !$v.seed.seedIsLowerCaseAndSpaces"
          name="Seed"
          :type="isPolkadot ? 'incorrectPolkadotSeed' : 'lowercaseAndSpaces'"
        />
        <TmFormMsg
          v-else-if="!isCorrectSeed"
          name="Seed"
          type="custom"
          msg="Seed is incorrect for this address"
        />
        <TmFormMsg v-else-if="error" type="custom" :msg="error" />
        <div class="forget-account-buttons">
          <TmBtn
            value="Dismiss"
            type="secondary"
            class="forget-account-button"
            @click.native="close"
            @click.enter.native="close"
          />
          <TmBtn
            value="Delete"
            type="primary"
            class="forget-account-button"
            @click.native="forgetAccount"
            @click.enter.native="forgetAccount"
          />
        </div>
      </TmFormGroup>
    </div>
    <div v-else class="session-container success-paragraph">
      <TmDataMsg icon="check" icon-color="var(--success)" :success="true">
        <p slot="title">Account successfully removed!</p>
        <p slot="subtitle" class="success-paragraph-message">
          Account {{ address | formatAddress }} won't appear anymore among your
          accounts
        </p>
      </TmDataMsg>
    </div>
  </SessionFrame>
</template>

<script>
import SessionFrame from "common/SessionFrame"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import TmDataMsg from "common/TmDataMsg"
import TmBtn from "common/TmBtn"
import FieldSeed from "common/TmFieldSeed"
import { formatAddress } from "src/filters"
import config from "src/../config"
import { required } from "vuelidate/lib/validators"
import { mnemonicValidate } from "@polkadot/util-crypto"

const has12or24words = (param) => {
  return (
    param && (param.split(` `).length === 12 || param.split(` `).length === 24)
  )
}
const isHex = (value) => {
  return /0x[0-9a-f]+/i.test(value)
}

const lowerCaseAndSpaces = (param) => {
  const seedWordsAreLowerCaseAndSpaces = /^([a-z]+\s)*[a-z]+$/g
  if (param.match(seedWordsAreLowerCaseAndSpaces)) {
    return param === param.match(seedWordsAreLowerCaseAndSpaces)[0]
  }
  return false
}
// exporting these for testing
export const isPolkadotHexSeed = (seed) => {
  return isHex(seed) && seed.length === 66
}

export const polkadotRawSeedValidate = (seed) => {
  return (seed.length > 0 && seed.length <= 32) || isPolkadotHexSeed(seed)
}

export const polkadotValidation = (seed) => {
  return mnemonicValidate(seed) || polkadotRawSeedValidate(seed)
}

export default {
  name: `forget-account`,
  filters: {
    formatAddress,
  },
  components: {
    SessionFrame,
    TmFormGroup,
    FieldSeed,
    TmFormMsg,
    TmDataMsg,
    TmBtn,
  },
  data: () => ({
    isExtension: config.isExtension,
    isAccountDeleted: false,
    isCorrectSeed: `undefined`,
    copySuccess: false,
    error: undefined,
  }),
  computed: {
    address() {
      return this.$route.params.address
    },
    addressNetwork() {
      return this.$route.params.addressNetworkId
    },
    seed: {
      get() {
        return this.$store.state.recover.seed
      },
      set(value) {
        this.$store.commit(`updateField`, {
          field: `seed`,
          value: value.trim(), // remove spaces from beginning and end of string
        })
      },
    },
    isPolkadot() {
      return (
        this.addressNetwork === "polkadot" || this.addressNetwork === "kusama"
      )
    },
  },
  methods: {
    async forgetAccount() {
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      try {
        this.isCorrectSeed = await this.$store.dispatch(`testSeed`, {
          networkId: this.addressNetwork,
          address: this.address,
          seedPhrase: this.seed,
        })
        if (this.isCorrectSeed) {
          if (this.isExtension) {
            this.isAccountDeleted = await this.$store.dispatch(
              `deleteAccountWithoutPassword`,
              { address: this.address }
            )
          } else {
            this.isAccountDeleted = await this.$store.dispatch(
              `deleteKey`,
              this.address
            )
          }
          if (this.isAccountDeleted) {
            this.$store.commit(`updateField`, {
              field: `seed`,
              value: ``,
            })
          }
        }
      } catch (err) {
        console.error(err)
        this.error = err.message
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
      seed: {
        required,
        seedIsLowerCaseAndSpaces: (param) =>
          this.isPolkadot
            ? polkadotValidation(param)
            : lowerCaseAndSpaces(param),
        seedHasCorrectLength: (param) =>
          this.isPolkadot ? polkadotValidation(param) : has12or24words(param),
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

.forget-account-buttons {
  display: flex;
  justify-content: space-between;
  margin: 1em 0 0;
}

.forget-account-button {
  flex: 0.5;
  height: 4em;
}

.forget-account-button.button.secondary {
  margin-right: 1em;
}

.forget-account-password {
  color: var(--txt);
  cursor: pointer;
  border-radius: 50%;
  height: 2em;
  width: 2em;
  position: absolute;
  top: 1.5em;
  right: 0;
}

.forget-account-password .copied {
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

h2.forget-title {
  margin-top: 3.5em;
}

.forget-account-form-group.tm-form-group {
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

.message {
  margin-top: 4em;
  color: var(--bright);
  font-size: 70%;
}

.success-paragraph {
  height: 100%;
  display: flex;
  justify-content: center;
}

.success-paragraph-message {
  margin-top: 1rem;
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
