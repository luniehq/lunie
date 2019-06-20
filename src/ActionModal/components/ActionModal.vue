<template>
  <transition v-if="show" name="slide-fade">
    <div v-focus-last class="action-modal" tabindex="0" @keyup.esc="close">
      <div
        id="closeBtn"
        class="action-modal-icon action-modal-close"
        @click="close"
      >
        <i class="material-icons">close</i>
      </div>
      <div class="action-modal-header">
        <span class="action-modal-title">
          {{ requiresSignIn ? `Sign in required` : title }}
        </span>
        <Steps :steps="['Details', 'Fees', 'Sign']" :active="step" />
      </div>
      <div v-if="requiresSignIn" class="action-modal-form">
        <p>You need to sign in to submit a transaction.</p>
      </div>
      <div v-else-if="step === `details`" class="action-modal-form">
        <slot />
      </div>
      <div v-else-if="step === `fees`" class="action-modal-form">
        <TmFormGroup
          v-if="session.experimentalMode"
          :error="$v.gasPrice.$error && $v.gasPrice.$invalid"
          class="action-modal-group"
          field-id="gasPrice"
          field-label="Gas Price"
        >
          <span class="input-suffix">{{ viewDenom(bondDenom) }}</span>
          <TmField
            id="gas-price"
            v-model="gasPrice"
            step="0.000000001"
            type="number"
            min="0"
          />
          <TmFormMsg
            v-if="balance === 0"
            :msg="`doesn't have any ${bondDenom}s`"
            name="Wallet"
            type="custom"
          />
          <TmFormMsg
            v-else-if="$v.gasPrice.$error && !$v.gasPrice.required"
            name="Gas price"
            type="required"
          />
          <TmFormMsg
            v-else-if="$v.gasPrice.$error && !$v.gasPrice.between"
            :max="$v.gasPrice.$params.between.max"
            :min="0"
            name="Gas price"
            type="between"
          />
        </TmFormGroup>
        <TableInvoice
          :amount="Number(amount)"
          :gas-estimate="Number(gasEstimate)"
          :gas-price="Number(gasPrice)"
        />
        <TmFormMsg
          v-if="$v.invoiceTotal.$invalid"
          name="Total"
          type="between"
          min="0"
          :max="atoms(balance)"
        />
      </div>
      <div v-else-if="step === `sign`" class="action-modal-form">
        <TmFormGroup
          v-if="signMethods.length > 1"
          class="action-modal-form-group"
          field-id="sign-method"
          field-label="Signing Method"
        >
          <TmField
            id="sign-method"
            v-model="selectedSignMethod"
            :options="signMethods"
            type="select"
          />
        </TmFormGroup>
        <HardwareState
          v-if="selectedSignMethod === `ledger`"
          :icon="session.browserWithLedgerSupport ? 'usb' : 'info'"
          :loading="!!sending"
        >
          <div v-if="session.browserWithLedgerSupport">
            {{
              sending
                ? `Please verify and sign the transaction on your Ledger`
                : `Please plug in your Ledger&nbsp;Nano and open
            the Cosmos app`
            }}
          </div>
          <div v-else>
            Please use Chrome, Brave, or Opera. Ledger is not supported in your
            current browser.
          </div>
        </HardwareState>
        <form
          v-else-if="selectedSignMethod === `local`"
          @submit.prevent="validateChangeStep"
        >
          <TmFormGroup
            :error="$v.password.$error && $v.password.$invalid"
            class="action-modal-group"
            field-id="password"
            field-label="Password"
          >
            <TmField
              id="password"
              v-model="password"
              v-focus
              type="password"
              placeholder="Password"
            />
            <TmFormMsg
              v-if="$v.password.$error && !$v.password.required"
              name="Password"
              type="required"
            />
          </TmFormGroup>
        </form>
      </div>
      <div class="action-modal-footer">
        <slot name="action-modal-footer">
          <TmFormGroup class="action-modal-group">
            <div>
              <TmBtn
                v-if="requiresSignIn"
                v-focus
                value="Sign In"
                color="primary"
                @click.native="goToSession"
                @click.enter.native="goToSession"
              />
              <TmBtn
                v-else-if="sending"
                :value="
                  step === `sign` && selectedSignMethod === `ledger`
                    ? `Waiting for Ledger`
                    : `Sending...`
                "
                disabled="disabled"
                color="primary"
              />
              <TmBtn
                v-else-if="!connected"
                value="Connecting..."
                disabled="disabled"
                color="primary"
              />
              <TmBtn
                v-else-if="step !== `sign`"
                ref="next"
                color="primary"
                value="Next"
                :disabled="step === `fees` && $v.invoiceTotal.$invalid"
                @click.native="validateChangeStep"
              />
              <TmBtn
                v-else
                color="primary"
                value="Submit"
                :disabled="!session.browserWithLedgerSupport"
                @click.native="validateChangeStep"
              />
            </div>
          </TmFormGroup>
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
import HardwareState from "src/components/common/TmHardwareState"
import TmBtn from "src/components/common/TmBtn"
import TmField from "src/components/common/TmField"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"
import TableInvoice from "./TableInvoice"
import Steps from "./Steps"
import { mapGetters } from "vuex"
import { uatoms, atoms, viewDenom } from "src/scripts/num.js"
import { between, requiredIf } from "vuelidate/lib/validators"
import { track } from "scripts/google-analytics.js"
import config from "src/config"

import ActionManager from "../utils/ActionManager.js"

const defaultStep = `details`
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
    TableInvoice,
    Steps
  },
  props: {
    title: {
      type: String,
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
    },
    transactionData: {
      type: Object,
      default: () => {}
    },
    notifyMessage: {
      type: Object,
      default: () => {}
    }
  },
  data: () => ({
    step: defaultStep,
    signMethod: null,
    password: null,
    sending: false,
    gasEstimate: null,
    gasPrice: config.default_gas_price.toFixed(9),
    submissionError: null,
    show: false,
    actionManager: new ActionManager(),
    track,
    atoms,
    uatoms,
    viewDenom
  }),
  computed: {
    ...mapGetters([
      `connected`,
      `session`,
      `bondDenom`,
      `wallet`,
      `ledger`,
      `liquidAtoms`,
      `modalContext`
    ]),
    requiresSignIn() {
      return !this.session.signedIn
    },
    balance() {
      return this.liquidAtoms
    },
    invoiceTotal() {
      return (
        Number(this.amount) + Number(this.gasPrice) * Number(this.gasEstimate)
      )
    },
    isValidChildForm() {
      // here we trigger the validation of the child form
      if (this.validate) {
        return this.validate()
      }
      return true
    },
    selectedSignMethod() {
      if (
        this.session.sessionType === `ledger` ||
        this.session.sessionType === `explore`
      ) {
        return signWithLedger
      }
      return signWithLocalKeystore
    },
    signMethods() {
      if (this.session.sessionType === `ledger`) {
        return [
          {
            key: `Ledger Nano`,
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
  updated: function() {
    this.actionManager.setContext(this.modalContext || {})
    if (
      (this.title === "Withdraw" || this.step === "fees") &&
      this.$refs.next
    ) {
      this.$refs.next.$el.focus()
    }
  },
  methods: {
    open() {
      this.track(`event`, `modal`, this.title)
      this.gasPrice = config.default_gas_price.toFixed(9)
      this.show = true
    },
    close() {
      this.submissionError = null
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
          if (!this.isValidInput(`invoiceTotal`)) {
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
      const { type, memo, ...properties } = this.transactionData
      this.actionManager.setMessage(type, properties)
      try {
        this.gasEstimate = await this.actionManager.simulate(memo)
        this.step = feeStep
      } catch ({ message }) {
        this.submissionError = `${this.submissionErrorPrefix}: ${message}.`
      }
    },
    async submit() {
      this.submissionError = null
      track(`event`, `submit`, this.title, this.selectedSignMethod)

      if (this.selectedSignMethod === signWithLedger) {
        await this.connectLedger()
      }

      const { type, memo, ...transactionProperties } = this.transactionData

      const gasPrice = {
        amount: this.gasPrice,
        denom: this.bondDenom
      }

      const feeProperties = {
        gasEstimate: this.gasEstimate,
        gasPrice: gasPrice,
        submitType: this.selectedSignMethod,
        password: this.password
      }

      try {
        await this.actionManager.send(memo, feeProperties)
        track(`event`, `successful-submit`, this.title, this.selectedSignMethod)
        this.$store.commit(`notify`, this.notifyMessage)
        this.$store.dispatch(`post${type}`, {
          txProps: transactionProperties,
          txMeta: feeProperties
        })
        this.close()
      } catch ({ message }) {
        this.submissionError = `${this.submissionErrorPrefix}: ${message}.`
        track(`event`, `failed-submit`, this.title, message)
      }
    },
    async connectLedger() {
      try {
        await this.$store.dispatch(`connectLedgerApp`)
      } catch (error) {
        this.submissionError = `${this.submissionErrorPrefix}: ${error}.`
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
      },
      invoiceTotal: {
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
  right: 1rem;
  padding: 1.5rem 1.5rem 2rem 1.5rem;
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 564px;
  min-height: 400px;
  z-index: var(--z-modal);
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  box-shadow: 0 2px 8px rgba(200, 200, 200, 0.1);
}

.action-modal-header {
  align-items: center;
  flex-direction: column;
  text-align: center;
  display: flex;
  padding-bottom: 2rem;
}

.action-modal-title {
  flex: 1;
  font-size: var(--h2);
  font-weight: 400;
  color: var(--bright);
  padding-bottom: 2rem;
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
  position: absolute;
  top: 1rem;
  right: 1rem;
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

  /* keeps button in bottom right no matter the size of the action modal */
  flex-grow: 1;
  align-self: flex-end;
  flex-direction: column;
}

.action-modal-footer .tm-form-group {
  padding: 0;
}

.submission-error {
  position: absolute;
  left: 1.5rem;
  bottom: 1rem;
}

.form-message {
  font-size: var(--sm);
  font-weight: 500;
  font-style: italic;
  color: var(--dim);
  display: inline-block;
}

.form-message.notice {
  border-radius: 2px;
  background-color: #1c223e;
  font-weight: 300;
  margin: 2rem 0;
  padding: 1rem 1rem;
  font-size: 14px;
  font-style: normal;
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
