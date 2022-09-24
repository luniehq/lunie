<template>
  <transition v-if="show" name="slide-fade">
    <div v-focus-last class="action-modal" tabindex="0" @keyup.esc="close">
      <div
        v-if="(step === feeStep || step === signStep) && !sending"
        id="prevBtn"
        class="action-modal-icon action-modal-prev"
        @click="previousStep"
      >
        <i class="material-icons notranslate">arrow_back</i>
      </div>
      <div class="action-modal-header">
        <div
          id="closeBtn"
          class="action-modal-icon action-modal-close"
          @click="close"
        >
          <i class="material-icons notranslate">close</i>
        </div>
        <span class="action-modal-title">{{ title }}</span>
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
      <TmDataLoading
        v-else-if="$apollo.loading && (!balancesLoaded || !networkFeesLoaded)"
      />
      <template v-else>
        <div v-if="requiresSignIn" class="action-modal-form">
          <p class="form-message notice">
            You're using Lunie in explore mode. Sign in or create an account to
            get started.
          </p>
        </div>
        <div v-else-if="step === defaultStep" class="action-modal-form">
          <slot />
        </div>
        <div v-else-if="step === feeStep" class="action-modal-form">
          <TableInvoice
            v-if="networkFeesLoaded"
            :amount="Number(subTotal)"
            :fee="networkFees.transactionFee"
            :transaction-denom="getDenom"
          />
          <TmFormMsg
            v-if="$v.invoiceTotal.$invalid && !$v.invoiceTotal.max"
            type="custom"
            :msg="`You don't have enough ${selectedDenom}s to proceed.`"
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
              Please use Chrome or Brave. Ledger is not supported in this
              browser.
            </div>
          </HardwareState>
          <HardwareState
            v-else-if="selectedSignMethod === SIGN_METHODS.EXTENSION"
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
                href="http://bit.ly/lunie-ext"
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
          <TmDataMsg icon="hourglass_empty" :spin="true">
            <div slot="title">Sent and confirming</div>
            <div slot="subtitle">
              Waiting for confirmation from {{ networkId }}.
            </div>
          </TmDataMsg>
        </div>
        <div
          v-else-if="step === successStep"
          class="action-modal-form success-step"
        >
          <TmDataMsg icon="check" icon-color="var(--success)" :success="true">
            <div slot="title">{{ notifyMessage.title }}</div>
            <div slot="subtitle">
              {{ notifyMessage.body }}
              <br />
              <br />
              <router-link
                :to="`/${$router.history.current.params.networkId}/transactions`"
                >See your transaction</router-link
              >
            </div>
          </TmDataMsg>
        </div>
        <p
          v-if="submissionError"
          class="tm-form-msg sm tm-form-msg--error submission-error"
        >
          {{ submissionError }}
        </p>
        <div class="action-modal-footer">
          <slot name="action-modal-footer">
            <TmFormGroup
              v-if="[defaultStep, feeStep, signStep].includes(step)"
              class="action-modal-group"
            >
              <TmBtn
                id="closeBtn"
                value="Cancel"
                type="secondary"
                @click.native="close"
              />
              <TmBtn
                v-if="requiresSignIn"
                v-focus
                value="Sign In"
                type="primary"
                @click.native="goToSession"
                @click.enter.native="goToSession"
              />
              <TmBtn
                v-else-if="sending"
                :value="submitButtonCaption"
                disabled="disabled"
                type="primary"
              />
              <TmBtn
                v-else-if="step !== signStep"
                ref="next"
                type="primary"
                value="Next"
                :loading="step === feeStep && !networkFeesLoaded"
                :disabled="
                  disabled ||
                  !balancesLoaded ||
                  (step === feeStep && $v.invoiceTotal.$invalid) ||
                  (step === feeStep && !networkFeesLoaded)
                "
                @click.native="validateChangeStep"
              />
              <TmBtn
                v-else
                type="primary"
                value="Send"
                :disabled="
                  !selectedSignMethod ||
                  (!extension.enabled && selectedSignMethod === 'extension')
                "
                @click.native="validateChangeStep"
              />
            </TmFormGroup>
          </slot>
        </div>
      </template>
    </div>
  </transition>
</template>

<script>
import gql from "graphql-tag"
import * as Sentry from "@sentry/browser"
import BigNumber from "bignumber.js"
import { mapState, mapGetters } from "vuex"
import HardwareState from "src/components/common/TmHardwareState"
import TmBtn from "src/components/common/TmBtn"
import TmField from "src/components/common/TmField"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"
import TmDataLoading from "src/components/common/TmDataLoading"
import FeatureNotAvailable from "src/components/common/FeatureNotAvailable"
import TmDataMsg from "common/TmDataMsg"
import TableInvoice from "./TableInvoice"
import Steps from "./Steps"
import { prettyInt, SMALLEST } from "src/scripts/num"
import { requiredIf } from "vuelidate/lib/validators"
import { track, sendEvent } from "scripts/google-analytics"
import { UserTransactionAdded } from "src/gql"
import config from "src/../config"
import TransactionManager from "../../signing/transaction-manager"
import { getPolkadotAPI } from "../../../../common/polkadotApiConnector"

const defaultStep = `details`
const feeStep = `fees`
const signStep = `sign`
const inclusionStep = `send`
const successStep = `success`

const SIGN_METHODS = {
  LOCAL: `local`,
  LEDGER: `ledger`,
  EXTENSION: `extension`,
}

const signMethodOptions = {
  LEDGER: {
    key: `Ledger Nano`,
    value: SIGN_METHODS.LEDGER,
  },
  EXTENSION: {
    key: `Lunie Browser Extension`,
    value: SIGN_METHODS.EXTENSION,
  },
  LOCAL: {
    key: `Local Account (Unsafe)`,
    value: SIGN_METHODS.LOCAL,
  },
}

const sessionType = {
  EXPLORE: "explore",
  LOCAL: SIGN_METHODS.LOCAL,
  LEDGER: SIGN_METHODS.LEDGER,
  EXTENSION: SIGN_METHODS.EXTENSION,
}

const networkCapabilityDictionary = {
  true: "ENABLED",
  false: "DISABLED",
  null: "MISSING",
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
    TmDataLoading,
    TableInvoice,
    Steps,
    FeatureNotAvailable,
  },
  filters: {
    prettyInt,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    validate: {
      type: Function,
      default: undefined,
    },
    submissionErrorPrefix: {
      type: String,
      default: `Transaction failed`,
    },
    amount: {
      type: [String, Number],
      default: `0`,
    },
    rewards: {
      type: Array,
      default: () => [],
    },
    transactionData: {
      type: Object,
      default: () => {},
    },
    notifyMessage: {
      type: Object,
      default: () => ({
        title: `Successful transaction`,
        body: `You have successfully completed a transaction.`,
      }),
    },
    featureFlag: {
      type: String,
      default: ``,
    },
    // disable proceeding from the first page
    disabled: {
      type: Boolean,
      default: false,
    },
    selectedDenom: {
      type: String,
      default: ``,
    },
    transactionType: {
      type: String,
      default: "UnknownTx",
    },
  },
  data: () => ({
    step: defaultStep,
    selectedSignMethod: null,
    password: null,
    sending: false,
    networkFees: null,
    gasEstimate: 0,
    submissionError: null,
    show: false,
    loaded: false,
    txHash: null,
    defaultStep,
    feeStep,
    signStep,
    inclusionStep,
    successStep,
    SIGN_METHODS,
    featureAvailable: true,
    isMobileApp: config.mobileApp,
    queueEmpty: true,
    includedHeight: undefined,
    smallestAmount: SMALLEST,
    balances: [],
    balancesLoaded: false,
    networkFeesLoaded: false,
  }),
  computed: {
    ...mapState([`extension`, `session`]),
    ...mapGetters([`isExtensionAccount`, `networks`, `currentNetwork`]),
    ...mapGetters({ networkId: `network` }),
    checkFeatureAvailable() {
      const action = `action_` + this.featureFlag
      // DEPRECATE to support the upgrade of the old Boolean value to the new ENUM capability model, we support here temporarily the upgrade from the Boolean model to the ENUM model
      return typeof this.network[action] === `boolean` ||
        this.network[action] === null
        ? networkCapabilityDictionary[this.network[action]] === "ENABLED"
        : this.network[action] === "ENABLED"
    },
    network() {
      return this.networks.find(({ id }) => id == this.networkId)
    },
    requiresSignIn() {
      return (
        !this.session.signedIn ||
        this.session.sessionType === sessionType.EXPLORE
      )
    },
    subTotal() {
      return this.featureFlag === "undelegate" ? 0 : this.amount
    },
    invoiceTotal() {
      if (this.networkFeesLoaded) {
        return (
          Number(this.subTotal) + Number(this.networkFees.transactionFee.amount)
        )
      } else {
        return 0
      }
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
      if (
        config.development &&
        this.session.sessionType === sessionType.EXPLORE
      ) {
        signMethods.push(signMethodOptions.LOCAL)
      } else if (
        this.isMobileApp &&
        this.session.sessionType === sessionType.LOCAL
      ) {
        signMethods.push(signMethodOptions.LOCAL)
      } else if (this.session.sessionType === sessionType.EXPLORE) {
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
    getDenom() {
      return this.selectedDenom || this.network.stakingDenom
    },
    selectedBalance() {
      const defaultBalance = {
        amount: 0,
      }
      if (this.balances.length === 0 || !this.network) {
        return defaultBalance
      }
      // default to the staking denom for fees
      const feeDenom = this.selectedDenom || this.network.stakingDenom
      let balance = this.balances.find(({ denom }) => denom === feeDenom)
      if (!balance) {
        balance = defaultBalance
      }
      return balance
    },
  },
  watch: {
    // if there is only one sign method, preselect it
    signMethods: {
      immediate: true,
      handler(signMethods) {
        if (signMethods.length === 1) {
          this.selectedSignMethod = signMethods[0].value
        }
      },
    },
    currentNetwork: {
      handler() {
        this.close()
      },
    },
  },
  updated: function () {
    if (
      (this.title === "Withdraw" || this.step === "fees") &&
      this.$refs.next
    ) {
      this.$refs.next.$el.focus()
    }
  },
  created() {
    this.transactionManager = new TransactionManager(this.$apollo)
  },
  methods: {
    confirmModalOpen() {
      let confirmResult = false
      if (this.session.currrentModalOpen || !this.queueEmpty) {
        confirmResult = window.confirm(
          "You are in the middle of creating a transaction. Are you sure you want to cancel this action and start a new one?"
        )
        if (confirmResult) {
          if (this.queueEmpty) {
            this.session.currrentModalOpen.close()
          }
          this.$store.commit(`setCurrrentModalOpen`, false)
          // clearing request query
          this.transactionManager.cancel(
            { userAddress: this.session.address, networkId: this.network.id },
            this.selectedSignMethod
          )
          this.queueEmpty = true
        }
      }
    },
    async open() {
      if (!this.address) {
        this.$apollo.skipAll = true
      }
      // checking if there is something in a queue
      const queue = await this.transactionManager.getSignQueue(
        this.selectedSignMethod
      )
      if (queue) {
        this.queueEmpty = false
      }
      this.confirmModalOpen()
      if (this.session.currrentModalOpen || !this.queueEmpty) {
        return
      }
      this.$store.commit(`setCurrrentModalOpen`, this)
      this.trackEvent(`event`, `modal`, this.title)
      this.show = true
      if (this.session.sessionType === sessionType.EXTENSION) {
        this.$store.dispatch(`getAddressesFromExtension`)
      }
    },
    close() {
      if (this.step == "sign") {
        // remove the request from any sign method to avoid orphaned transactions in the sign methods
        this.transactionManager.cancel(
          { userAddress: this.session.address, networkId: this.network.id },
          this.selectedSignMethod
        )
      }
      this.$store.commit(`setCurrrentModalOpen`, false)
      this.submissionError = null
      this.password = null
      this.step = defaultStep
      this.show = false
      this.sending = false
      this.includedHeight = undefined
      this.networkFeesLoaded = false

      // reset form
      // in some cases $v is not yet set
      if (this.$v) {
        this.$v.$reset()
      }
      this.$emit(`close`)
    },
    trackEvent(...args) {
      track(...args)
    },
    sendEvent(customObject, ...args) {
      sendEvent(customObject, ...args)
    },
    goToSession() {
      this.close()

      this.$store.dispatch(`signOut`, this.network)
      if (this.$route.name !== `portfolio`)
        this.$router.push({ name: "portfolio" })
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
          this.step = feeStep
          return
        case feeStep:
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
    async submit() {
      this.submissionError = null
      if (
        Object.entries(this.transactionData).length === 0 &&
        this.transactionData.constructor === Object
      ) {
        this.onSendingFailed(new Error(`Error in transaction data`))
        return
      }

      this.trackEvent(`event`, `submit`, this.title, this.selectedSignMethod)

      const { type, memo, ...message } = this.transactionData

      try {
        let transactionData
        // Polkadot loads transaction data automatic
        if (this.network.network_type === "cosmos") {
          transactionData = await this.transactionManager.getCosmosTransactionData(
            {
              memo,
              gasEstimate: this.networkFees.gasEstimate,
              // convert fee to chain values
              fee: [this.networkFees.transactionFee],
              senderAddress: this.session.address,
              network: this.network,
            }
          )
        }
        let polkadotAPI
        if (this.network.network_type === "polkadot") {
          transactionData = {
            fee: {
              amount: this.networkFees.transactionFee.amount,
              denom: this.getDenom,
            },
            addressRole: this.session.addressRole,
          }
          polkadotAPI = await getPolkadotAPI(this.network)
        }
        const HDPath = this.session.HDPath || this.network.defaultHDPath
        const curve = this.session.curve || this.network.defaultCurve

        const hashResult = await this.transactionManager.createSignBroadcast({
          messageType: type,
          message,
          transactionData,
          senderAddress: this.session.address,
          network: this.network,
          signingType: this.selectedSignMethod,
          password: this.password,
          polkadotAPI,
          HDPath,
          curve,
        })

        const { hash } = hashResult
        this.txHash = hash
        this.step = inclusionStep
      } catch (error) {
        this.onSendingFailed(error)
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
      // sending to ga
      this.sendEvent(
        {
          network: this.network.id,
          address: this.session.address,
        },
        "Action",
        "Modal",
        this.featureFlag,
        this.featureFlag === "claim_rewards" &&
          this.rewards &&
          this.rewards.length > 0
          ? this.rewards[0].amount
          : this.amount
      )
    },
    onSendingFailed(error) {
      /* istanbul ignore next */
      Sentry.withScope((scope) => {
        scope.setExtra("signMethod", this.selectedSignMethod)
        scope.setExtra("transactionData", this.transactionData)
        scope.setExtra("gasEstimate", this.networkFees.gasEstimate)
        Sentry.captureException(error)
      })
      this.step = signStep
      this.submissionError = `${this.submissionErrorPrefix}: ${error.message}.`
      this.trackEvent(`event`, `failed-submit`, this.title, error.message)
    },
    maxDecimals(value, decimals) {
      return Number(BigNumber(value).toFixed(decimals)) // TODO only use bignumber
    },
  },
  validations() {
    return {
      password: {
        required: requiredIf(
          () =>
            this.selectedSignMethod === SIGN_METHODS.LOCAL &&
            this.step === signStep
        ),
      },
      invoiceTotal: {
        max: (x) =>
          this.networkFeesLoaded &&
          this.networkFees.transactionFee.denom !== this.selectedDenom
            ? true
            : Number(x) <= this.selectedBalance.amount,
      },
    }
  },
  apollo: {
    balances: {
      query: gql`
        query balances($networkId: String!, $address: String!) {
          balances(networkId: $networkId, address: $address) {
            id
            denom
            amount
            gasPrice
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.networkId,
          address: this.session.address,
        }
      },
      /* istanbul ignore next */
      update(data) {
        this.balancesLoaded = true
        return data.balances || []
      },
      /* istanbul ignore next */
      skip() {
        return !this.session.address || !this.show
      },
    },
    networkFees: {
      query: gql`
        query NetworkFees(
          $networkId: String!
          $messageType: String!
          $message: TransactionDetailsInput!
          $senderAddress: String!
        ) {
          networkFees(
            networkId: $networkId
            messageType: $messageType
            message: $message
            senderAddress: $senderAddress
          ) {
            gasEstimate
            transactionFee {
              denom
              amount
            }
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        let { type, ...message } = this.transactionData
        delete message.memo
        // make sure the amounts are strings when sending
        if (message.amount) {
          message.amount = {
            amount: String(message.amount.amount),
            denom: message.amount.denom,
          }
        }
        if (message.amounts) {
          message.amounts = message.amounts.map(({ amount, denom }) => ({
            amount: String(amount),
            denom,
          }))
        }
        return {
          networkId: this.networkId,
          messageType: type,
          message,
          senderAddress: this.session.address,
        }
      },
      /* istanbul ignore next */
      update(data) {
        if (data.networkFees) {
          this.networkFeesLoaded = true
          return data.networkFees
        }
      },
      /* istanbul ignore next */
      skip() {
        return (
          !this.session.address ||
          !this.transactionData ||
          Object.keys(this.transactionData).length === 0 ||
          this.step !== feeStep
        )
      },
    },
    $subscribe: {
      userTransactionAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.networkId,
            address: this.session.address,
          }
        },
        /* istanbul ignore next */
        skip() {
          return !this.session.address || !this.txHash
        },
        query: UserTransactionAdded,
        /* istanbul ignore next */
        result({ data }) {
          const { hash, height, success, log } = data.userTransactionAddedV2
          if (hash === this.txHash) {
            this.includedHeight = height
            if (success) {
              this.onTxIncluded()
            } else {
              this.onSendingFailed(new Error(log))
            }
          }
          this.txHash = null
        },
      },
    },
  },
}
</script>

<style>
.action-modal {
  background: var(--app-fg);
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  right: 1rem;
  padding: 1.5rem 1.5rem 2rem 1.5rem;
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 500px;
  min-height: 400px;
  z-index: var(--z-modal);
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  border-left: 2px solid var(--bc-dim);
  border-right: 2px solid var(--bc-dim);
  border-top: 2px solid var(--bc-dim);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  outline: none;
}

.action-modal-header {
  align-items: center;
  flex-direction: column;
  text-align: center;
  display: flex;
}

.action-modal-title {
  flex: 1;
  font-size: var(--h2);
  font-weight: 400;
  color: var(--bright);
  padding-bottom: 1rem;
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
  padding: 1.5rem 0 1rem;
  width: 100%;
}

.tm-form-group__field {
  position: relative;
}

.action-modal-footer .tm-form-group .tm-form-group__field button {
  width: 100%;
}

.action-modal-footer .tm-form-group .tm-form-group__field {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.action-modal-footer .tm-form-group .tm-form-group__field .secondary {
  margin-right: 0.5rem;
}

.action-modal-footer .tm-form-group {
  padding: 0;
}

.submission-error {
  padding: 1rem;
}

.form-message {
  font-size: var(--sm);
  color: var(--bright);
  font-style: italic;
  display: inline-block;
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
/* stylelint-disable */
#send-modal .tm-data-msg {
  margin: 2rem 0 2rem 0;
}

@media screen and (max-width: 576px) {
  .tm-data-msg__icon {
    margin-right: 0;
  }
}

@media screen and (max-width: 667px) {
  .row {
    flex-direction: column;
  }

  .action-modal {
    right: 0;
    top: 0;
    overflow-x: scroll;
    padding-top: 3rem;
    border: 0;
    border-radius: 0;
  }

  .action-modal-footer button {
    width: 100%;
  }

  .tm-form-group__field {
    width: 100%;
  }
}

/* iPhone X and Xs Max */
@media only screen and (min-device-width: 375px) and (min-device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait) {
  .action-modal-footer {
    padding-bottom: 1.8rem;
  }
}

/* iPhone XR */
@media only screen and (min-device-width: 414px) and (min-device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait) {
  .action-modal-footer {
    padding-bottom: 1.8rem;
  }
}
</style>
