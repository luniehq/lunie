<template>
  <transition v-if="show && !$apollo.loading" name="slide-fade">
    <div v-focus-last class="action-modal" tabindex="0" @keyup.esc="close">
      <div
        v-if="(step === feeStep || step === signStep) && !sending"
        id="prevBtn"
        class="action-modal-icon action-modal-prev"
        @click="previousStep"
      >
        <i class="material-icons">arrow_back</i>
      </div>
      <div
        id="closeBtn"
        class="action-modal-icon action-modal-close"
        @click="close"
      >
        <i class="material-icons">close</i>
      </div>
      <div class="action-modal-header">
        <span class="action-modal-title">{{
          requiresSignIn ? `Sign in required` : title
        }}</span>
        <Steps
          v-if="
            [defaultStep, feeStep, signStep].includes(step) &&
              checkFeatureAvailable &&
              !isMobileApp
          "
          :steps="['Details', 'Fees', 'Sign']"
          :active-step="step"
        />
        <p
          v-if="
            extension.enabled &&
              !isExtensionAccount &&
              step === signStep &&
              selectedSignMethod === SIGN_METHODS.EXTENSION
          "
          class="form-message notice extension-address"
        >
          The address you are trying to send with is not available in the
          extension.
        </p>
      </div>
      <template v-if="!checkFeatureAvailable">
        <FeatureNotAvailable :feature="title" />
      </template>
      <template v-else>
        <p
          v-if="session.windowsDevice && step !== successStep"
          class="form-message notice"
        >
          {{ session.windowsWarning }}
        </p>
        <div v-if="requiresSignIn" class="action-modal-form">
          <p class="form-message notice">
            You need to sign in to submit a transaction.
          </p>
        </div>
        <div v-else-if="step === defaultStep" class="action-modal-form">
          <slot />
        </div>
        <div v-else-if="step === feeStep" class="action-modal-form">
          <TmFormGroup
            v-if="session.experimentalMode"
            :error="$v.gasPrice.$error && $v.gasPrice.$invalid"
            class="action-modal-group"
            field-id="gasPrice"
            field-label="Gas Price"
          >
            <span class="input-suffix">{{
              network.stakingDenom | viewDenom
            }}</span>
            <TmField
              id="gas-price"
              v-model="gasPrice"
              step="0.000000001"
              type="number"
              min="0"
            />
            <TmFormMsg
              v-if="overview.liquidStake === 0"
              :msg="`doesn't have any ${network.stakingDenom}s`"
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
            :estimated-fee="estimatedFee"
            :bond-denom="network.stakingDenom"
          />
          <TmFormMsg
            v-if="$v.invoiceTotal.$invalid"
            name="Total"
            type="between"
            min="0"
            :max="overview.liquidStake"
          />
        </div>
        <div v-else-if="step === signStep" class="action-modal-form">
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
            v-if="selectedSignMethod === SIGN_METHODS.LEDGER"
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
              Please use Chrome, Brave, or Opera. Ledger is not supported in
              this browser.
            </div>
          </HardwareState>
          <HardwareState
            v-if="selectedSignMethod === SIGN_METHODS.EXTENSION"
            :icon="session.browserWithLedgerSupport ? 'laptop' : 'info'"
            :loading="!!sending"
          >
            <div v-if="extension.enabled && !sending">
              Please send the transaction to be signed in the Lunie Browser
              Extension.
            </div>
            <div v-if="extension.enabled && sending">
              Please open the Lunie Browser Extension, review the details, and
              approve the transaction.
            </div>
            <div v-if="!extension.enabled">
              Please install the Lunie Browser Extension from the
              <a
                href="https://chrome.google.com/webstore/category/extensions"
                target="_blank"
                rel="noopener norefferer"
                >Chrome Web Store</a
              >.
            </div>
          </HardwareState>
          <form
            v-else-if="selectedSignMethod === SIGN_METHODS.LOCAL"
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
        <div v-else-if="step === inclusionStep" class="action-modal-form">
          <TmDataMsg icon="hourglass_empty">
            <div slot="title">
              Sent and confirming
            </div>
            <div slot="subtitle">
              The transaction
              <!-- with the hash {{ txHash }} -->
              was successfully signed and sent the network. Waiting for it to be
              confirmed.
            </div>
          </TmDataMsg>
        </div>
        <div
          v-else-if="step === successStep"
          class="action-modal-form success-step"
        >
          <TmDataMsg icon="check">
            <div slot="title">
              {{ notifyMessage.title }}
            </div>
            <div slot="subtitle">
              {{ notifyMessage.body }}
              <br />
              <br />Block
              <router-link :to="`/blocks/${includedHeight}`"
                >#{{ prettyIncludedHeight }}</router-link
              >
            </div>
          </TmDataMsg>
        </div>
        <div class="action-modal-footer">
          <slot name="action-modal-footer">
            <TmFormGroup
              v-if="[defaultStep, feeStep, signStep].includes(step)"
              class="action-modal-group"
            >
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
                  :value="submitButtonCaption"
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
                  v-else-if="step !== signStep"
                  ref="next"
                  color="primary"
                  value="Next"
                  :disabled="
                    disabled || (step === feeStep && $v.invoiceTotal.$invalid)
                  "
                  @click.native="validateChangeStep"
                />
                <TmBtn
                  v-else
                  color="primary"
                  value="Send"
                  :disabled="!selectedSignMethod"
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
      </template>
    </div>
  </transition>
</template>

<script>
import gql from "graphql-tag"
import HardwareState from "src/components/common/TmHardwareState"
import TmBtn from "src/components/common/TmBtn"
import TmField from "src/components/common/TmField"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"
import FeatureNotAvailable from "src/components/common/FeatureNotAvailable"
import TmDataMsg from "common/TmDataMsg"
import TableInvoice from "./TableInvoice"
import Steps from "./Steps"
import { mapState, mapGetters } from "vuex"
import { viewDenom, prettyInt } from "src/scripts/num"
import { between, requiredIf } from "vuelidate/lib/validators"
import { track } from "scripts/google-analytics"
import { UserTransactionAdded } from "src/gql"
import config from "src/../config"

import ActionManager from "../utils/ActionManager"

const defaultStep = `details`
const feeStep = `fees`
const signStep = `sign`
const inclusionStep = `send`
const successStep = `success`

const SIGN_METHODS = {
  LOCAL: `local`,
  LEDGER: `ledger`,
  EXTENSION: `extension`
}

const signMethodOptions = {
  LEDGER: {
    key: `Ledger Nano`,
    value: SIGN_METHODS.LEDGER
  },
  EXTENSION: {
    key: `Lunie Browser Extension`,
    value: SIGN_METHODS.EXTENSION
  },
  LOCAL: {
    key: `Local Account (Unsafe)`,
    value: SIGN_METHODS.LOCAL
  }
}

const sessionType = {
  EXPLORE: "explore",
  LOCAL: SIGN_METHODS.LOCAL,
  LEDGER: SIGN_METHODS.LEDGER,
  EXTENSION: SIGN_METHODS.EXTENSION
}

export default {
  name: `action-modal`,
  components: {
    HardwareState,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TmDataMsg,
    TableInvoice,
    Steps,
    FeatureNotAvailable
  },
  filters: {
    viewDenom
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
    rewards: {
      type: Array,
      default: () => []
    },
    transactionData: {
      type: Object,
      default: () => {}
    },
    notifyMessage: {
      type: Object,
      default: () => ({
        title: `Successful transaction`,
        body: `You have successfully completed a transaction.`
      })
    },
    // disable proceeding from the first page
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    step: defaultStep,
    selectedSignMethod: null,
    password: null,
    sending: false,
    gasEstimate: null,
    gasPrice: config.default_gas_price.toFixed(9),
    submissionError: null,
    show: false,
    actionManager: new ActionManager(),
    txHash: null,
    defaultStep,
    feeStep,
    signStep,
    inclusionStep,
    successStep,
    SIGN_METHODS,
    featureAvailable: true,
    network: {},
    overview: {},
    isMobileApp: config.mobileApp
  }),
  computed: {
    ...mapState([`extension`, `session`]),
    ...mapGetters([`connected`, `isExtensionAccount`]),
    ...mapGetters({ networkId: `network` }),
    checkFeatureAvailable() {
      /* istanbul ignore next */
      if (this.network.testnet) {
        return true
      }

      const action = `action_${this.title.toLowerCase().replace(" ", "_")}`
      return this.network[action] === true
    },
    requiresSignIn() {
      return !this.session.signedIn
    },
    estimatedFee() {
      return Number(this.gasPrice) * Number(this.gasEstimate) // already in atoms
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
    signMethods() {
      let signMethods = []
      if (this.session.sessionType === sessionType.EXPLORE) {
        signMethods.push(signMethodOptions.LEDGER)
        signMethods.push(signMethodOptions.EXTENSION)
      } else if (this.session.sessionType === sessionType.LEDGER) {
        signMethods.push(signMethodOptions.LEDGER)
      } else if (this.session.sessionType === sessionType.EXTENSION) {
        signMethods.push(signMethodOptions.EXTENSION)
      } else {
        signMethods.push(signMethodOptions.LOCAL)
      }
      return signMethods
    },
    submitButtonCaption() {
      switch (this.selectedSignMethod) {
        case "ledger":
          return `Waiting for Ledger`
        case "extension":
          return `Waiting for Extension`
        default:
          return "Sending..."
      }
    },
    hasSigningMethod() {
      return (
        this.session.browserWithLedgerSupport ||
        (this.selectedSignMethod === "extension" && this.isExtensionAccount)
      )
    },
    prettyIncludedHeight() {
      return prettyInt(this.includedHeight)
    }
  },
  watch: {
    // if there is only one sign method, preselect it
    signMethods: {
      immediate: true,
      handler(signMethods) {
        if (signMethods.length === 1) {
          this.selectedSignMethod = signMethods[0].value
        }
      }
    }
  },
  created() {
    this.$apollo.skipAll = true
  },
  updated: function() {
    const context = this.createContext()
    this.actionManager.setContext(context)
    if (
      (this.title === "Withdraw" || this.step === "fees") &&
      this.$refs.next
    ) {
      this.$refs.next.$el.focus()
    }
  },
  methods: {
    createContext() {
      return {
        url: this.network.api_url, // state.connection.externals.node.url,
        chainId: this.network.chain_id, // state.connection.lastHeader.chain_id,
        connected: this.connected,
        userAddress: this.session.address,
        rewards: this.rewards, // state.distribution.rewards,
        totalRewards: this.overview.totalRewards, // getters.totalRewards,
        delegations: this.delegations, // state.delegates.delegates,
        bondDenom: this.network.stakingDenom, // getters.bondDenom,
        isExtensionAccount: this.isExtensionAccount
      }
    },
    confirmModalOpen() {
      let confirmResult = false
      if (this.session.currrentModalOpen) {
        confirmResult = window.confirm(
          "You are in the middle of creating a transaction already. Are you sure you want to cancel this action?"
        )
        if (confirmResult) {
          this.session.currrentModalOpen.close()
          this.$store.commit(`setCurrrentModalOpen`, false)
        }
      }
    },
    open() {
      this.confirmModalOpen()
      this.$apollo.skipAll = false
      if (this.session.currrentModalOpen) {
        return
      }

      this.$store.commit(`setCurrrentModalOpen`, this)
      this.trackEvent(`event`, `modal`, this.title)
      this.gasPrice = config.default_gas_price.toFixed(9)
      this.show = true
    },
    close() {
      this.$store.commit(`setCurrrentModalOpen`, false)
      this.submissionError = null
      this.password = null
      this.step = defaultStep
      this.show = false
      this.sending = false
      this.includedHeight = undefined
      this.$apollo.skipAll = true

      // reset form
      this.$v.$reset()
      this.$emit(`close`)
    },
    trackEvent(...args) {
      track(...args)
    },
    goToSession() {
      this.close()

      this.$router.push(`/welcome`)
    },
    isValidInput(property) {
      this.$v[property].$touch()

      return !this.$v[property].$invalid
    },
    previousStep() {
      switch (this.step) {
        case signStep:
          this.step = feeStep
          break
        case feeStep:
          this.step = defaultStep
          break
      }
    },
    async validateChangeStep() {
      if (this.disabled) return

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

      // limit fees to the maximum the user has
      if (this.invoiceTotal > this.overview.liquidStake) {
        this.gasPrice =
          (this.overview.liquidStake - Number(this.amount)) / this.gasEstimate
      }
    },
    async submit() {
      this.submissionError = null
      this.trackEvent(`event`, `submit`, this.title, this.selectedSignMethod)

      if (this.selectedSignMethod === SIGN_METHODS.LEDGER) {
        try {
          await this.connectLedger()
        } catch (error) {
          this.submissionError = `${this.submissionErrorPrefix}: ${error.message}.`
          this.sending = false
          return
        }
      }

      const { memo } = this.transactionData

      const gasPrice = {
        amount: this.gasPrice,
        denom: this.network.stakingDenom
      }

      const feeProperties = {
        gasEstimate: this.gasEstimate,
        gasPrice: gasPrice,
        submitType: this.selectedSignMethod,
        password: this.password
      }

      try {
        const { hash } = await this.actionManager.send(memo, feeProperties)
        this.txHash = hash
        this.step = inclusionStep
      } catch ({ message }) {
        this.onSendingFailed(message)
      }
    },
    onTxIncluded() {
      this.step = successStep
      this.trackEvent(
        `event`,
        `successful-submit`,
        this.title,
        this.selectedSignMethod
      )
      this.$emit(`txIncluded`)
    },
    onSendingFailed(message) {
      this.step = signStep
      this.submissionError = `${this.submissionErrorPrefix}: ${message}.`
      this.trackEvent(`event`, `failed-submit`, this.title, message)
    },
    async connectLedger() {
      await this.$store.dispatch(`connectLedgerApp`)
    },
  },
  validations() {
    return {
      password: {
        required: requiredIf(
          () =>
            this.selectedSignMethod === SIGN_METHODS.LOCAL &&
            this.step === signStep
        )
      },
      gasPrice: {
        required: requiredIf(
          () => this.step === feeStep && this.session.experimentalMode
        ),
        // we don't use SMALLEST as min gas price because it can be a fraction of uatom
        // min is 0 because we support sending 0 fees
        between: between(0, this.overview.liquidStake)
      },
      invoiceTotal: {
        between: between(0, this.overview.liquidStake)
      }
    }
  },
  apollo: {
    overview: {
      query: gql`
        query OverviewActionModal($networkId: String!, $address: String!) {
          overview(networkId: $networkId, address: $address) {
            totalRewards
            liquidStake
            totalStake
          }
        }
      `,
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.networkId,
          address: this.session.address
        }
      },
      update(data) {
        /* istanbul ignore next */
        return {
          ...data.overview,
          totalRewards: Number(data.overview.totalRewards)
        }
      },
      skip() {
        return !this.session.address
      }
    },
    network: {
      query: gql`
        query NetworkActionModal($networkId: String!) {
          network(id: $networkId) {
            id
            testnet
            stakingDenom
            chain_id
            rpc_url
            api_url
            action_send
            action_claim_rewards
            action_delegate
            action_redelegate
            action_undelegate
            action_deposit
            action_vote
            action_proposal
          }
        }
      `,
      variables() {
        return {
          networkId: this.networkId
        }
      },
      update(data) {
        /* istanbul ignore next */

        return data.network
      }
    },
    delegations: {
      query: gql`
        query DelegationsActionModal(
          $networkId: String!
          $delegatorAddress: String!
        ) {
          delegations(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
          ) {
            amount
            validator {
              operatorAddress
            }
          }
        }
      `,
      skip() {
        return !this.session.address
      },
      variables() {
        return {
          networkId: this.networkId,
          delegatorAddress: this.session.address
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.delegations
      }
    },
    $subscribe: {
      userTransactionAdded: {
        variables() {
          return {
            networkId: this.networkId,
            address: this.session.address
          }
        },
        skip() {
          return !this.txHash
        },
        query: UserTransactionAdded,
        result({ data }) {
          const { hash, height, success, log } = data.userTransactionAdded
          if (hash === this.txHash) {
            this.includedHeight = height

            if (success) {
              this.onTxIncluded()
            } else {
              this.onSendingFailed(log)
            }
          }
          this.txHash = null
        }
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
  border: 1px solid var(--bc);
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

.action-modal-icon.action-modal-prev {
  cursor: pointer;
  position: absolute;
  top: 1rem;
  left: 1rem;
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
  padding: 1rem 0;
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
  border-left: 2px solid var(--warning);
  padding: 0.5rem 0 0.5rem 1rem;
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

.tm-form-group__field {
  position: relative;
}

#send-modal .tm-data-msg {
  margin: 2rem 0 2rem 0;
}

@media screen and (max-width: 576px) {
  .tm-data-msg__icon {
    margin-right: 0;
  }
}

@media screen and (max-width: 767px) {
  .tm-form-group__field {
    width: 100%;
  }
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
