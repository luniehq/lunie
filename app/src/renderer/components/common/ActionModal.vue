<template>
  <transition v-if="show" name="slide-fade">
    <div v-click-outside="close" class="action-modal">
      <div class="action-modal-header">
        <img
          class="icon action-modal-atom"
          src="~assets/images/cosmos-logo.png"
        >
        <span class="action-modal-title">
          {{ session.signedIn ? title : `Sign in required` }}
        </span>
        <div
          id="closeBtn"
          class="action-modal-icon action-modal-close"
          @click="close"
        >
          <i class="material-icons">close</i>
        </div>
      </div>
      <div v-if="!session.signedIn" class="action-modal-form">
        <p>You need to sign in to submit a transaction.</p>
      </div>
      <div v-else-if="step === `txDetails`" class="action-modal-form">
        <slot />
        <tm-form-group
          v-if="signMethods.length > 1"
          class="action-modal-form-group"
          field-id="sign-method"
          field-label="Signing Method"
        >
          <tm-field
            id="sign-method"
            v-model="selectedSignMethod"
            :options="signMethods"
            type="select"
          />
        </tm-form-group>

        <tm-form-group
          v-if="selectedSignMethod === `local`"
          :error="$v.password.$error && $v.password.$invalid"
          class="action-modal-group"
          field-id="password"
          field-label="Password"
        >
          <tm-field
            id="password"
            v-model="password"
            type="password"
            placeholder="Password"
          />
          <tm-form-msg
            v-if="$v.password.$error && !$v.password.required"
            name="Password"
            type="required"
          />
        </tm-form-group>
      </div>
      <div v-else-if="step === `sign`" class="action-modal-form">
        <hardware-state
          v-if="sending"
          :loading="true"
          value="Waiting for signature on app"
        />
        <hardware-state
          v-else
          icon="usb"
          value="Please unlock the Cosmos app on your Ledger Nano&nbsp;S"
        />
      </div>
      <div class="action-modal-footer">
        <slot name="action-modal-footer">
          <tm-form-group class="action-modal-group">
            <div class="action-modal-footer">
              <tm-btn
                v-if="!session.signedIn"
                value="Go to Sign In"
                icon="navigate_next"
                color="primary"
                @click.native="goToSession"
              />
              <tm-btn
                v-else-if="sending"
                value="Sending..."
                disabled="disabled"
                color="primary"
              />
              <tm-btn
                v-else-if="!connected"
                value="Connecting..."
                disabled="disabled"
                color="primary"
              />
              <tm-btn
                v-else-if="
                  selectedSignMethod === `ledger` && step === `txDetails`
                "
                color="primary"
                value="Next"
                @click.native="validateChangeStep"
              />
              <tm-btn
                v-else-if="selectedSignMethod === `ledger` && step === `sign`"
                color="primary"
                value="Sign"
                @click.native="validateChangeStep"
              />
              <tm-btn
                v-else
                color="primary"
                value="Submit"
                @click.native="validateChangeStep"
              />
            </div>
          </tm-form-group>
        </slot>
        <p
          v-if="submissionError"
          class="tm-form-msg sm tm-form-msg--error submission-error"
        >
          {{ submissionError }}
        </p>
      </div>
    </div>
  </transition>
</template>

<script>
import ClickOutside from "vue-click-outside"
import HardwareState from "common/TmHardwareState"
import TmBtn from "common/TmBtn"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import { mapGetters } from "vuex"
import { requiredIf } from "vuelidate/lib/validators"
import { track } from "../../google-analytics.js"

const defaultStep = `txDetails`
const signStep = `sign`

const signWithLedger = `ledger`
const signWithLocalKeystore = `local`

export default {
  name: `action-modal`,
  directives: {
    ClickOutside
  },
  components: {
    HardwareState,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  props: {
    title: {
      type: String,
      required: true
    },
    submitFn: {
      type: Function,
      required: true
    },
    validate: {
      type: Function,
      default: undefined
    },
    submissionErrorPrefix: {
      type: String,
      default: `Submitting data failed`
    }
  },
  data: () => ({
    step: defaultStep,
    signMethod: null,
    password: null,
    sending: false,
    submissionError: null,
    show: false,
    track
  }),
  computed: {
    ...mapGetters([`connected`, `ledger`, `session`]),
    selectedSignMethod() {
      if (this.ledger.isConnected) {
        return signWithLedger
      }
      return signWithLocalKeystore
    },
    signMethods() {
      if (this.ledger.isConnected) {
        return [
          {
            key: `Ledger Nano S`,
            value: signWithLedger
          }
        ]
      }
      return [
        {
          key: `(Unsafe) Local Account`,
          value: signWithLocalKeystore
        }
      ]
    }
  },
  methods: {
    open() {
      this.track(`event`, `modal`, this.title)

      this.show = true
    },
    close() {
      this.password = null
      this.step = defaultStep
      this.show = false

      // reset form
      this.$v.$reset()
      this.$emit(`close`)
    },
    goToSession() {
      this.$store.commit(`setSessionModalView`, `welcome`)
      this.$store.commit(`toggleSessionModal`, true)
    },
    async validateChangeStep() {
      this.$v.$touch()

      // An ActionModal is only the prototype of a parent modal
      // here we trigger the validation of the form that this parent modal
      const childFormValid = this.validate ? this.validate() : true
      // const ledgerT = this.selectedSignMethod === signWithLedger &&
      //       this.step === signStep &&
      //       this.ledger.isConnected

      if (!this.$v.$invalid && childFormValid) {
        if (
          this.selectedSignMethod === signWithLedger &&
          this.step === defaultStep
        ) {
          // show connect Ledger view
          this.step = signStep
          return
        }
        // submit transaction
        this.sending = true
        await this.submit()
        this.sending = false
      }
    },
    async submit() {
      track(`event`, `submit`, this.title, this.selectedSignMethod)

      try {
        await this.submitFn(this.selectedSignMethod, this.password)

        this.close()
      } catch ({ message }) {
        this.submissionError = `${this.submissionErrorPrefix}: ${message}.`

        setTimeout(() => {
          this.submissionError = null
        }, 5000)
      }
    }
  },
  validations() {
    return {
      password: {
        required: requiredIf(
          () => this.selectedSignMethod === signWithLocalKeystore
        )
      }
    }
  }
}
</script>

<style>
.action-modal {
  background: var(--app-nav);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  right: 2rem;
  padding: 3rem;
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 664px;
  z-index: var(--z-modal);
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  box-shadow: 0 2px 8px rgba(200, 200, 200, 0.1);
}

.action-modal-header {
  align-items: center;
  display: flex;
  padding-bottom: 2rem;
}

.action-modal-atom {
  height: 3rem;
  width: 3rem;
}

.action-modal-title {
  flex: 1;
  font-size: var(--h3);
  font-weight: 500;
  color: var(--bright);
  padding-left: 1rem;
}

.action-modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-modal-icon i {
  font-size: var(--lg);
}

.action-modal-icon.action-modal-close {
  cursor: pointer;
}

.action-modal-icon.action-modal-close:hover i {
  color: var(--link);
}

.action-modal-form .tm-form-group {
  display: block;
  padding: 0.5rem 0 1rem;
}

.action-modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 2rem 0 0;
}

.submission-error {
  position: absolute;
  right: 3rem;
  bottom: 1rem;
}

.slide-fade-enter-active {
  transition: all 0.1s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(2rem);
  opacity: 0;
}
</style>
