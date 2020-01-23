<template>
  <transition v-if="show" name="slide-fade">
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
            v-else-if="selectedSignMethod === SIGN_METHODS.LEDGER"
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
          <TmDataMsg icon="check" :success="true">
            <div slot="title">{{ notifyMessage.title }}</div>
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
                :disabled="!selectedSignMethod"
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
import { track } from "scripts/google-analytics"
import { UserTransactionAdded } from "src/gql"
import config from "src/../config"
import * as Sentry from "@sentry/browser"

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
    TmDataLoading,
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
    featureFlag: {
      type: String,
      default: ``
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
    gasPrice: (config.default_gas_price / 4).toFixed(9), // as we bump the gas amount by 4 in the API
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
    network: {},
    overview: {},
    isMobileApp: config.mobileApp,
    useTxService: config.enableTxAPI
  }),
  computed: {
    ...mapState([`extension`, `session`]),
    ...mapGetters([`connected`, `isExtensionAccount`]),
    ...mapGetters({ networkId: `network` }),
    checkFeatureAvailable() {
      const action = `action_` + this.featureFlag
      return this.network[action] === true
    },
    requiresSignIn() {
      return (
        !this.session.signedIn ||
        (this.isMobileApp && this.session.sessionType === sessionType.EXPLORE)
      )
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
    prettyIncludedHeight() {
      return prettyInt(this.includedHeight)
    },
    // TODO lets slice this monstrocity
    context() {
      return {
        url: this.network.api_url,
        networkId: this.network.id,
        chainId: this.network.chain_id,
        connected: this.connected,
        userAddress: this.session.address,
        rewards: this.rewards,
        totalRewards: this.overview.totalRewards,
        bondDenom: this.network.stakingDenom,
        isExtensionAccount: this.isExtensionAccount,
        account: this.overview.accountInformation
      }
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
    context: {
      immediate: true,
      handler(context) {
        this.actionManager.setContext(context)
      }
    },
    "$apollo.loading": function(loading) {
      this.loaded = this.loaded || !loading
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
      if (this.session.currrentModalOpen) {
        confirmResult = window.confirm(
          "You are in the middle of creating a transaction. Are you sure you want to cancel this action and start a new one?"
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
      if (config.isMobileApp) noScroll.on()
    },
    close() {
      if (config.isMobileApp) noScroll.off()
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
      await this.actionManager.setMessage(type, properties)
      try {
        if (!this.useTxService) {
          this.gasEstimate = await this.actionManager.simulate(memo)
        } else {
          this.gasEstimate = await this.actionManager.simulateTxAPI(
            this.context,
            type,
            properties,
            memo
          )
        }
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

      const { type, memo, ...properties } = this.transactionData

      const feeProperties = {
        gasEstimate: this.gasEstimate,
        gasPrice: {
          amount: this.gasPrice,
          denom: this.network.stakingDenom
        },
        submitType: this.selectedSignMethod,
        password: this.password
      }

      try {
        let hashResult
        if (!this.useTxService) {
          hashResult = await this.actionManager.send(memo, feeProperties)
        } else {
          await this.$apollo.queries.overview.refetch()
          hashResult = await this.actionManager.sendTxAPI(
            this.context,
            type,
            memo,
            properties,
            feeProperties
          )
        }

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
      this.$apollo.queries.overview.refetch()
    },
    onSendingFailed(error) {
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
            accountInformation {
              accountNumber
              sequence
            }
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
        /* istanbul ignore next */
        return !this.session.address
      }
    },
    network: {
      query: gql`
        query NetworkActionModal($networkId: String!) {
          network(id: $networkId) {
            id
            stakingDenom
            chain_id
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
        /* istanbul ignore next */
        return {
          networkId: this.networkId
        }
      },
      update(data) {
        /* istanbul ignore next */

        return data.network
      }
    },
    $subscribe: {
      userTransactionAdded: {
        variables() {
          /* istanbul ignore next */
          return {
            networkId: this.networkId,
            address: this.session.address
          }
        },
        skip() {
          /* istanbul ignore next */
          return !this.txHash
        },
        query: UserTransactionAdded,
        result({ data }) {
          /* istanbul ignore next */
          const { hash, height, success, log } = data.userTransactionAdded
          /* istanbul ignore next */
          if (hash === this.txHash) {
            /* istanbul ignore next */
            this.includedHeight = height
            /* istanbul ignore next */
            if (success) {
              /* istanbul ignore next */
              this.onTxIncluded()
            } else {
              /* istanbul ignore next */
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
  justify-items: space-between;
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
