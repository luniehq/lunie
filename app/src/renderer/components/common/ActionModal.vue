<template>
  <transition v-if="show" name="slide-fade">
    <div class="action-modal">
      <div class="action-modal-header">
        <img
          class="icon action-modal-atom"
          src="~assets/images/cosmos-logo.png"
        >
        <span class="action-modal-title">
          {{ requiresSignIn ? `Sign in required` : title }}
        </span>
        <div
          id="closeBtn"
          class="action-modal-icon action-modal-close"
          @click="close"
        >
          <i class="material-icons">close</i>
        </div>
      </div>
      <div v-if="requiresSignIn" class="action-modal-form">
        <p>You need to sign in to submit a transaction.</p>
      </div>
      <div v-else-if="step === `txDetails`" class="action-modal-form">
        <slot />
      </div>
      <div v-else-if="step === `fees`" class="action-modal-form">
        <tm-form-group
          v-if="session.experimentalMode"
          :error="$v.gasPrice.$error && $v.gasPrice.$invalid"
          class="action-modal-group"
          field-id="gasPrice"
          field-label="Network Fee"
        >
          <span class="input-suffix">{{ bondDenom }}</span>
          <tm-field
            id="gas-price"
            v-model="gasPrice"
            type="number"
            step="0.000000001"
            min="0"
          />
          <tm-form-msg
            v-if="balance === 0"
            :msg="`doesn't have any ${bondDenom}s`"
            name="Wallet"
            type="custom"
          />
          <tm-form-msg
            v-else-if="$v.gasPrice.$error && !$v.gasPrice.required"
            name="Gas price"
            type="required"
          />
          <tm-form-msg
            v-else-if="$v.gasPrice.$error && !$v.gasPrice.between"
            :max="$v.gasPrice.$params.between.max"
            :min="0"
            name="Gas price"
            type="between"
          />
        </tm-form-group>
        <table-invoice
          :amount="Number(amount)"
          :gas-estimate="Number(gasEstimate)"
          :gas-price="Number(gasPrice)"
        />
      </div>
      <div v-else-if="step === `sign`" class="action-modal-form">
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
        <hardware-state
          v-if="selectedSignMethod === `ledger`"
          icon="usb"
          :loading="!!sending"
        >
          {{
            sending
              ? `Please verify and sign the transaction on your Ledger`
              : `Please plug in your Ledger&nbsp;Nano&nbsp;S and open
                 the Cosmos app`
          }}
        </hardware-state>
        <tm-form-group
          v-else-if="selectedSignMethod === `local`"
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
      <div class="action-modal-footer">
        <slot name="action-modal-footer">
          <tm-form-group class="action-modal-group">
            <div>
              <tm-btn
                v-if="requiresSignIn"
                value="Sign In"
                color="primary"
                @click.native="goToSession"
              />
              <tm-btn
                v-else-if="sending"
                :value="
                  step === `sign` && selectedSignMethod === `ledger`
                    ? `Waiting for Ledger`
                    : `Sending...`
                "
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
                v-else-if="step !== `sign`"
                color="primary"
                value="Next"
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
import HardwareState from "common/TmHardwareState"
import TmBtn from "common/TmBtn"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import TableInvoice from "common/TableInvoice"
import { mapGetters } from "vuex"
import { uatoms, atoms } from "../../scripts/num.js"
import { between, requiredIf } from "vuelidate/lib/validators"
import { track } from "../../google-analytics.js"

const defaultStep = `txDetails`
const feeStep = `fees`
const signStep = `sign`

const signWithLedger = `ledger`
const signWithLocalKeystore = `local`

export default {
  name: `action-modal`,
  components: {
    HardwareState,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TableInvoice
  },
  props: {
    title: {
      type: String,
      required: true
    },
    simulateFn: {
      type: Function,
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
      default: `Transaction failed`
    },
    amount: {
      type: [String, Number],
      default: `0`
    }
  },
  data: () => ({
    step: defaultStep,
    signMethod: null,
    password: null,
    sending: false,
    gasEstimate: null,
    gasPrice: (2.5e-8).toFixed(9), // default: 0.025 uatom per gas
    submissionError: null,
    show: false,
    track,
    atoms,
    uatoms
  }),
  computed: {
    ...mapGetters([`connected`, `session`, `bondDenom`, `wallet`]),
    requiresSignIn() {
      return !this.session.signedIn
    },
    balance() {
      if (!this.wallet.loading && !!this.wallet.balances.length) {
        const balance = this.wallet.balances.find(
          coin => coin.denom === this.bondDenom
        )
        if (balance) return parseFloat(balance.amount)
      }
      return 0
    },
    isValidChildForm() {
      // here we trigger the validation of the child form
      if (this.validate) {
        return this.validate()
      }
      return true
    },
    selectedSignMethod() {
      if (this.session.sessionType === `ledger` || this.session.sessionType === `explore`) {
        return signWithLedger
      }
      return signWithLocalKeystore
    },
    signMethods() {
      if (this.session.sessionType === `ledger`) {
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
      this.gasPrice = (this.session.gasPrice || 2.5e-8).toFixed(9)
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
      this.close()

      this.$store.commit(`setSessionModalView`, `welcome`)
      this.$store.commit(`toggleSessionModal`, true)
    },
    isValidInput(property) {
      this.$v[property].$touch()

      return !this.$v[property].$invalid
    },
    async validateChangeStep() {
      // An ActionModal is only the prototype of a parent modal
      switch (this.step) {
        case defaultStep:
          if (!this.isValidChildForm) {
            return
          }
          this.sending = true
          await this.simulate() // simulate to get gas estimation
          this.sending = false
          return
        case feeStep:
          if (!this.isValidInput(`gasPrice`)) {
            return
          }
          this.step = signStep
          return
        case signStep:
          if (!this.isValidInput(`password`)) {
            return
          }
          // submit transaction
          this.sending = true
          await this.submit()
          this.sending = false
          return
        default:
          return
      }
    },
    async simulate() {
      try {
        const gasEstimate = await this.simulateFn()
        this.gasEstimate = gasEstimate
        this.step = feeStep
      } catch ({ message }) {
        this.submissionError = `${this.submissionErrorPrefix}: ${message}.`

        setTimeout(() => {
          this.submissionError = null
        }, 5000)
      }
    },
    async submit() {
      track(`event`, `submit`, this.title, this.selectedSignMethod)

      try {
        await this.submitFn(
          this.gasEstimate,
          this.gasPrice,
          this.password,
          this.selectedSignMethod
        )

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
          () =>
            this.selectedSignMethod === signWithLocalKeystore &&
            this.step === signStep
        )
      },
      gasPrice: {
        required: requiredIf(
          () => this.step === feeStep && this.session.experimentalMode
        ),
        // we don't use SMALLEST as min gas price because it can be a fraction of uatom
        // min is 0 because we support sending 0 fees
        between: between(0, atoms(this.balance))
      }
    }
  }
}
</script>

<style>
.action-modal {
  background: var(--app-nav-light);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  right: 1rem;
  padding: 1.5rem 1.5rem 2rem 1.5rem;
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 564px;
  z-index: var(--z-modal);
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  box-shadow: 0 2px 8px rgba(200, 200, 200, 0.1);
}

.action-modal-header {
  align-items: center;
  display: flex;
  padding-bottom: 1.5rem;
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
  padding: 0.75rem 0;
}

.action-modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem 0 1rem;
}

.action-modal-footer .tm-form-group {
  padding: 0;
}

.submission-error {
  position: absolute;
  left: 1.5rem;
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

@media screen and (max-width: 1023px) {
  .row {
    flex-direction: column;
  }

  .action-modal {
    right: 0;
    top: 0;
  }
}
</style>
