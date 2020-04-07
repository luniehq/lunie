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
      <div
        id="closeBtn"
        class="action-modal-icon action-modal-close"
        @click="close"
      >
        <i class="material-icons notranslate">close</i>
      </div>
      <div class="action-modal-header">
        <span class="action-modal-title">
          {{ requiresSignIn ? `Sign in required` : title }}
        </span>
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
      <TmDataLoading v-else-if="!loaded" />
      <template v-else>
        <div v-if="requiresSignIn" class="action-modal-form">
          <p class="form-message notice">
            You're using Lunie in explore mode. Please sign in or create an
            account to proceed with this action.
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
            <span class="input-suffix">{{ getDenom }}</span>
            <TmField
              id="gas-price"
              v-model="gasPrice"
              step="0.000000001"
              type="number"
              min="0"
            />
            <TmFormMsg
              v-if="Number(selectedBalance.amount) === 0"
              :msg="`doesn't have any ${selectedBalance.denom}s`"
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
            :amount="Number(subTotal)"
            :estimated-fee="estimatedFee"
            :bond-denom="getDenom"
          />
          <TmFormMsg
            v-if="$v.invoiceTotal.$invalid"
            name="Total"
            type="between"
            min="0"
            :max="selectedBalance.amount"
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
          <TmDataMsg icon="check" icon-color="var(--green)" :success="true">
            <div slot="title">{{ notifyMessage.title }}</div>
            <div slot="subtitle">
              {{ notifyMessage.body }}
              <br />
              <br />Block
              <router-link
                :to="
                  `/${$router.history.current.params.networkId}/blocks/${includedHeight}`
                "
                >#{{ includedHeight | prettyInt }}</router-link
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
                type="tertiary"
                @click.native="close"
              />
              <TmBtn
                v-if="requiresSignIn"
                v-focus
                value="Sign In / Sign Up"
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
                v-else-if="!connected"
                value="Connecting..."
                disabled="disabled"
                type="primary"
              />
              <TmBtn
                v-else-if="step !== signStep"
                ref="next"
                type="primary"
                value="Next"
                :disabled="
                  disabled || (step === feeStep && $v.invoiceTotal.$invalid)
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
import noScroll from "no-scroll"
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
import { mapState, mapGetters } from "vuex"
import { viewDenom, prettyInt } from "src/scripts/num"
import { between, requiredIf } from "vuelidate/lib/validators"
import { track, sendEvent } from "scripts/google-analytics"
import { UserTransactionAdded } from "src/gql"
import config from "src/../config"
import * as Sentry from "@sentry/browser"

import ActionManager from "../utils/ActionManager"
import BigNumber from "bignumber.js"

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

const networkCapabilityDictionary = {
  true: "ENABLED",
  false: "DISABLED",
  null: "MISSING"
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
    FeatureNotAvailable
  },
  filters: {
    viewDenom,
    prettyInt
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
    featureFlag: {
      type: String,
      default: ``
    },
    // disable proceeding from the first page
    disabled: {
      type: Boolean,
      default: false
    },
    selectedDenom: {
      type: String,
      default: ``
    },
    chainAppliedFees: {
      type: Number,
      default: 0
    },
    transactionType: {
      type: String,
      default: "UnknownTx"
    }
  },
  data: () => ({
    step: defaultStep,
    selectedSignMethod: null,
    password: null,
    sending: false,
    gasEstimate: null,
    gasPrice: 0,
    submissionError: null,
    show: false,
    loaded: false,
    actionManager: new ActionManager(),
    txHash: null,
    defaultStep,
    feeStep,
    signStep,
    inclusionStep,
    successStep,
    SIGN_METHODS,
    featureAvailable: true,
    overview: {},
    isMobileApp: config.mobileApp,
    balances: [],
    queueEmpty: true,
    includedHeight: undefined
  }),
  computed: {
    ...mapState([`extension`, `session`]),
    ...mapGetters([`connected`, `isExtensionAccount`, `networks`]),
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
    estimatedFee() {
      // terra uses a tax on all send txs
      if (this.chainAppliedFees > 0) {
        return this.chainAppliedFees
      }
      return this.maxDecimals(
        Number(this.gasPrice) * Number(this.gasEstimate),
        6
      )
    },
    subTotal() {
      return this.featureFlag === "undelegate" ? 0 : this.amount
    },
    invoiceTotal() {
      if (
        Number(this.subTotal) + this.estimatedFee >
        this.selectedBalance.amount
      ) {
        this.adjustFeesToMaxPayable()
      }
      return Number(this.subTotal) + this.estimatedFee
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
      if (this.isMobileApp && this.session.sessionType === sessionType.LOCAL) {
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
        gasPrice: 4e-7 // the defaultBalance gas price should be the highest we know of to be sure that no transaction gets out of gas
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
      // some API responses don't have gasPrices set
      if (!balance.gasPrice) balance.gasPrice = defaultBalance.gasPrice
      return balance
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
    },
    "$apollo.loading": function(loading) {
      this.loaded = this.loaded || !loading
    },
    selectedBalance: {
      handler(selectedBalance) {
        this.gasPrice = selectedBalance.gasPrice
      }
    }
  },
  created() {
    this.$apollo.skipAll = true
  },
  updated: function() {
    if (
      (this.title === "Withdraw" || this.step === "fees") &&
      this.$refs.next
    ) {
      this.$refs.next.$el.focus()
    }
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
          this.actionManager.cancel(
            { userAddress: this.session.address, networkId: this.network.id },
            this.selectedSignMethod
          )
          this.queueEmpty = true
        }
      }
    },
    async open() {
      this.$apollo.skipAll = false
      // checking if there is something in a queue
      const queue = await this.actionManager.getSignQueue(
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
      if (config.isMobileApp) noScroll.on()
    },
    close() {
      if (config.isMobileApp) noScroll.off()
      if (this.step == "sign") {
        // remove the request from any sign method to avoid orphaned transactions in the sign methods
        this.actionManager.cancel(
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
      this.$apollo.skipAll = true

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
          this.step = feeStep
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
    // limit fees to the maximum the user has
    adjustFeesToMaxPayable() {
      let payable = Number(this.subTotal)
      // in terra we also have to pay the tax
      // TODO refactor using a `fixedFee` property
      if (this.chainAppliedFees) {
        payable += this.chainAppliedFees
      }
      this.gasPrice =
        (Number(this.selectedBalance.amount) - payable) / this.gasEstimate
      // BACKUP HACK, the gasPrice can never be negative, this should not happen :shrug:
      this.gasPrice = this.gasPrice >= 0 ? this.gasPrice : 0
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

      const { type, memo, ...properties } = this.transactionData
      const feeProperties = {
        gasEstimate: this.gasEstimate,
        gasPrice: {
          // the cosmos-api lib uses gasEstimate * gasPrice to calculate the fees
          // here we just reverse this calculation to get the same fees as displayed
          amount: this.estimatedFee / this.gasEstimate,
          denom: this.getDenom
        },
        submitType: this.selectedSignMethod,
        password: this.password
      }
      const txMetaData = {
        ...feeProperties,
        displayedProperties: {
          claimableRewards: properties.amounts
        }
      }

      try {
        await this.$apollo.queries.overview.refetch()
        const hashResult = await this.actionManager.sendTxAPI(
          {
            network: this.network,
            networkType: this.network.network_type,
            chainId: this.network.chain_id,
            userAddress: this.session.address,
            rewards: this.rewards,
            account: this.overview.accountInformation
          },
          type,
          memo,
          properties,
          txMetaData
        )

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
          address: this.session.address
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
      this.$apollo.queries.overview.refetch()
    },
    onSendingFailed(error) {
      /* istanbul ignore next */
      Sentry.withScope(scope => {
        scope.setExtra("signMethod", this.selectedSignMethod)
        scope.setExtra("transactionData", this.transactionData)
        scope.setExtra("gasEstimate", this.gasEstimate)
        scope.setExtra("gasPrice", this.gasPrice)
        Sentry.captureException(error)
      })
      this.step = signStep
      this.submissionError = `${this.submissionErrorPrefix}: ${error.message}.`
      this.trackEvent(`event`, `failed-submit`, this.title, error.message)
      this.$apollo.queries.overview.refetch()
    },
    maxDecimals(value, decimals) {
      return Number(BigNumber(value).toFixed(decimals)) // TODO only use bignumber
    }
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
        between: between(0, this.selectedBalance.amount)
      },
      invoiceTotal: {
        between: between(0, this.selectedBalance.amount)
      }
    }
  },
  apollo: {
    balances: {
      query: gql`
        query balances($networkId: String!, $address: String!) {
          balances(networkId: $networkId, address: $address) {
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
          address: this.session.address
        }
      },
      /* istanbul ignore next */
      skip() {
        return !this.session.address
      }
    },
    overview: {
      query: gql`
        query OverviewActionModal($networkId: String!, $address: String!) {
          overview(networkId: $networkId, address: $address) {
            accountInformation {
              accountNumber
              sequence
            }
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.networkId,
          address: this.session.address
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.overview || {}
      },
      /* istanbul ignore next */
      skip() {
        return !this.session.address || this.step !== signStep
      }
    },
    gasEstimate: {
      query: gql`
        query NetworkGasEstimates(
          $networkId: String!
          $transactionType: String
        ) {
          networkFees(
            networkId: $networkId
            transactionType: $transactionType
          ) {
            gasEstimate
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.networkId,
          transactionType: this.transactionType
        }
      },
      /* istanbul ignore next */
      update(data) {
        if (data.networkFees) {
          return data.networkFees.gasEstimate
        }
      },
      /* istanbul ignore next */
      skip() {
        return (
          !this.session.address ||
          !this.transactionData ||
          this.step !== feeStep
        )
      }
    },
    $subscribe: {
      userTransactionAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.networkId,
            address: this.session.address
          }
        },
        /* istanbul ignore next */
        skip() {
          return !this.txHash
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
  flex-grow: 1;
  align-self: flex-end;
  flex-direction: column;
  padding: 1.5rem 0 1rem;
}

.action-modal-footer .tm-form-group .tm-form-group__field {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.action-modal-footer .tm-form-group .tm-form-group__field .tertiary {
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
  font-weight: 500;
  font-style: italic;
  color: var(--dim);
  display: inline-block;
  padding: 0.5rem;
}

.form-message.notice {
  padding: 2rem 0.5rem 0.5rem;
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

/* max width of the action modal */
@media screen and (max-width: 564px) {
  .action-modal-footer {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--app-nav);
    padding: 1rem;
    border-top: 1px solid var(--bc);
  }
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
    overflow-x: scroll;
    padding-bottom: 69px;
    padding-top: 4rem;
  }

  .action-modal-footer button {
    width: 100%;
  }

  .action-modal-icon.action-modal-close {
    top: 3rem;
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
