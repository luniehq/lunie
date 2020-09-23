<template>
  <SessionFrame ref="sessionFrame">
    <div
      v-if="forgottenAccountsList.length === forgottenAccountsListLength"
      class="session-container"
    >
      <h2 class="title forget-title">
        You are about to delete<br />
        <span class="pill">your account.</span>
      </h2>
      <TmFormGroup
        :error="
          ($v.password.$error && $v.password.$invalid) || wrongPasswordError
        "
        class="forget-account-form-group"
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
        <div class="forget-account-password" @click="showPassword">
          <i class="material-icons notranslate">visibility</i>
        </div>
        <TmFormMsg v-if="$v.password.$error" name="Password" type="required" />
        <TmFormMsg
          v-else-if="wrongPasswordError"
          type="custom"
          msg="Wrong password"
        />
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
    <div v-else class="session-container">
      <div>
        <p class="session-title">Account successfully deleted!</p>
        <span class="success-paragraph"
          >Account {{ address | formatAddress }} won't appear anymore among your
          accounts</span
        >
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
import { formatAddress } from "src/filters"
import config from "src/../config"
import { required } from "vuelidate/lib/validators"
import { mapGetters } from "vuex"
export default {
  name: `forget-account`,
  filters: {
    formatAddress,
  },
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
    passwordInputType: `password`,
    passwordInputKey: 0,
    wrongPasswordError: false,
    copySuccess: false,
  }),
  computed: {
    ...mapGetters([`currentNetwork`]),
    address() {
      return this.$route.params.address
    },
    forgottenAccountsList() {
      return localStorage.getItem(`forgottenAccountsList`) &&
        localStorage.getItem(`forgottenAccountsList`).length > 0
        ? JSON.parse(localStorage.getItem(`forgottenAccountsList`))
        : []
    },
    forgottenAccountsListLength() {
      return this.forgottenAccountsList ? this.forgottenAccountsList.length : 0
    },
  },
  methods: {
    async forgetAccount() {
      this.wrongPasswordError = false
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      const pwCorrect = await this.$store.dispatch("testLogin", { 
        address: this.address, 
        password: this.password
      })
      if (!pwCorrect) {
        this.wrongPasswordError = true
        return
      }

      this.forgottenAccountsList.push(this.address)
      localStorage.setItem(
        `forgottenAccountsList`,
        JSON.stringify(this.forgottenAccountsList)
      )
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
        // TODO: how to check if password is valid
        passwordCorrect: () => !this.wrongPasswordError,
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
  color: #fff7c4;
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
  text-align: center;
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
