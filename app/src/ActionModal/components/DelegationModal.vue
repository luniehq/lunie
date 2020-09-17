<template>
  <ActionModal
    id="delegation-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="isRedelegation ? 0 : amount"
    :title="isRedelegation ? 'Restake' : 'Stake'"
    class="delegation-modal"
    submission-error-prefix="Staking failed"
    :transaction-type="isRedelegation ? messageType.RESTAKE : messageType.STAKE"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="delegate"
    :disabled="
      isInElection ||
      (hasNoNominations && Object.keys(targetValidator).length === 0)
    "
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup
      v-if="session.addressRole === `stash`"
      class="action-modal-form-group"
    >
      <div class="form-message notice">
        <span>
          This is a stash account, you can increase the amount to stake but you
          need to sign in with your controller account to set or change your
          validators.
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup
      v-if="session.addressRole === `controller`"
      class="action-modal-form-group"
    >
      <div class="form-message notice">
        <span>
          This is a controller account, you can set or change your validators
          but to increase the amount to stake you need to sign in with your
          stash account.
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup class="action-modal-form-group">
      <div class="form-message notice">
        <span v-if="isInElection">
          There is currently an ongoing election for new validator candidates.
          Stake is not allowed by now.
        </span>
        <span
          v-if="hasNoNominations && Object.keys(targetValidator).length === 0"
        >
          Before staking any tokens you need to select some validators to start
          getting rewards. Select one by going to its profile page and clicking
          on "Select"
        </span>
        <span v-else-if="!isRedelegation && !isNomination">
          It will take {{ undelegationPeriod }} to unlock your tokens after they
          are staked. There is a risk that some tokens will be lost depending on
          the behaviour of the validator you choose.
        </span>
        <span v-else-if="!isNomination && !isUnnomination">
          Voting power and rewards will change instantly upon restaking — but
          your tokens will still be subject to the risks associated with the
          original stake for the duration of the unstaking period.
        </span>
        <span v-else-if="isNomination">
          The validator will appear within your validator set once the next era
          begins.
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup
      v-if="
        Object.keys(targetValidator).length > 0 &&
        session.addressRole !== `stash`
      "
      class="action-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <TmField id="to" :value="enhancedTargetValidator" type="text" readonly />
      <template>
        <TmFormMsg
          v-if="targetValidator.status === 'INACTIVE' && !isRedelegation"
          :msg="`You are about to stake to an inactive validator (${targetValidator.statusDetailed})`"
          type="custom"
          class="tm-form-msg--desc"
        />
        <TmFormMsg
          v-if="targetValidator.status === 'INACTIVE' && isRedelegation"
          :msg="`You are about to restake to an inactive validator (${targetValidator.statusDetailed})`"
          type="custom"
          class="tm-form-msg--desc"
        />
      </template>
    </TmFormGroup>

    <TmFormGroup
      v-if="
        Object.keys(targetValidator).length > 0 &&
        session.addressRole !== `stash`
      "
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <TmField
        id="from"
        v-model="fromSelectedIndex"
        :title="from"
        :options="fromOptions"
        type="select"
      />
    </TmFormGroup>
    <TmFormGroup
      v-if="
        currentNetwork.network_type === `polkadot`
          ? (!isNomination || stakedBalance.total === 0) &&
            session.addressRole !== `controller`
          : true
      "
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      :field-label="`Amount${
        currentNetwork.network_type === 'polkadot' &&
        Object.keys(targetValidator).length > 0 &&
        balance.total > 0 &&
        session.addressRole !== `stash`
          ? ' (Optional)'
          : ''
      }`"
    >
      <span class="input-suffix max-button">{{
        currentNetwork.stakingDenom
      }}</span>
      <TmFieldGroup>
        <TmField
          id="amount"
          v-model="amount"
          v-focus
          placeholder="0"
          class="tm-field-addon"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <TmBtn
          type="button"
          class="secondary addon-max"
          value="Set Max"
          :disabled="session.addressRole === `controller`"
          @click.native="setMaxAmount()"
        />
      </TmFieldGroup>
      <span class="form-message">
        Available to stake:
        {{ maxAmount }}
        {{ currentNetwork.stakingDenom }}s
      </span>
      <TmFormMsg
        v-if="balance.available === '0'"
        :msg="`doesn't have any ${currentNetwork.stakingDenom}s`"
        name="Wallet"
        type="custom"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${currentNetwork.stakingDenom}s to proceed.`"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.min"
        :min="smallestAmount"
        name="Amount"
        type="min"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.maxDecimals"
        name="Amount"
        type="maxDecimals"
      />
      <TmFormMsg
        v-else-if="isMaxAmount() && !isRedelegation"
        msg="You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
        type="custom"
        class="tm-form-msg--desc"
      />
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import { decimal } from "vuelidate/lib/validators"
import gql from "graphql-tag"
import { SMALLEST } from "src/scripts/num"
import TmField from "src/components/common/TmField"
import TmFieldGroup from "src/components/common/TmFieldGroup"
import TmBtn from "src/components/common/TmBtn"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"
import ActionModal from "./ActionModal"
import { messageType } from "../../components/transactions/messageTypes"
import { formatAddress, validatorEntry } from "src/filters"
import { ValidatorFragment, UserTransactionAdded } from "src/gql"

export default {
  name: `delegation-modal`,
  components: {
    TmField,
    TmFieldGroup,
    TmBtn,
    TmFormGroup,
    TmFormMsg,
    ActionModal,
  },
  filters: {
    validatorEntry,
  },
  props: {
    targetValidator: {
      type: Object,
      default: () => ({}),
    },
    isNomination: {
      type: Boolean,
      default: false,
    },
    isUnnomination: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    amount: 0,
    fromSelectedIndex: 0,
    balance: {
      amount: null,
      denom: ``,
    },
    validators: [],
    delegations: [],
    undelegations: [],
    undelegationsLoaded: false,
    messageType,
    smallestAmount: SMALLEST,
    isInElection: false, // Handle election period in Polkadot
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`, `address`, `currentNetwork`]),
    stakedBalance() {
      // balances not loaded yet
      if (!this.balance) {
        return {
          total: 0,
          denom: this.currentNetwork.stakingDenom,
        }
      }
      let stakedAmount =
        Number(this.balance.total) - Number(this.balance.available)
      // substract the already unbonding balance in the case of Substrate networks.
      if (this.undelegationsLoaded && this.undelegations.length > 0) {
        stakedAmount = this.undelegations.reduce(
          (stakedAmount, { amount }) => stakedAmount - Number(amount),
          stakedAmount
        )
      }
      return {
        total: Number(stakedAmount),
        denom: this.currentNetwork.stakingDenom,
      }
    },
    toOptions() {
      return this.validators
        .filter(
          (validator) =>
            validator.operatorAddress === this.targetValidator.operatorAddress
        )
        .map((validator) => {
          return {
            address: validator.operatorAddress,
            key: `${validator.name} - ${formatAddress(
              validator.operatorAddress
            )}`,
            value: 0,
          }
        })
    },
    fromOptions() {
      let options = [
        // from wallet
        {
          address: this.address,
          maximum: Number(this.balance.available),
          key: `My Wallet - ${formatAddress(this.address)}`,
          value: 0,
        },
      ]
      options = options.concat(
        this.delegations
          // exclude target validator
          .filter(
            (delegation) =>
              delegation.validator.operatorAddress !==
              this.targetValidator.operatorAddress
          )
          .map((delegation, index) => {
            return {
              address: delegation.validator.operatorAddress,
              maximum: Number(delegation.amount),
              key: validatorEntry(delegation.validator),
              value: index + 1,
            }
          })
      )

      return options
    },
    from() {
      if (!this.session.signedIn) return ``

      return this.fromOptions[this.fromSelectedIndex].address
    },
    transactionData() {
      if (isNaN(this.amount)) return {}

      if (this.isRedelegation) {
        return {
          type: messageType.RESTAKE,
          from: [this.from],
          to:
            Object.keys(this.targetValidator).length > 0
              ? [this.targetValidator.operatorAddress]
              : "",
          amount: {
            amount: this.amount,
            denom: this.currentNetwork.stakingDenom,
          },
          addressRole: this.session.addressRole,
        }
      } else {
        return {
          type: messageType.STAKE,
          to:
            Object.keys(this.targetValidator).length > 0
              ? [this.targetValidator.operatorAddress]
              : "",
          amount: {
            amount: this.amount,
            denom: this.currentNetwork.stakingDenom,
          },
          addressRole: this.session.addressRole,
        }
      }
    },
    notifyMessage() {
      if (this.isRedelegation) {
        return {
          title: `Successfully restaked!`,
          body: `You have successfully restaked your ${this.currentNetwork.stakingDenom}s`,
        }
      } else {
        return {
          title: `Successfully staked!`,
          body: `You have successfully staked your ${this.currentNetwork.stakingDenom}s`,
        }
      }
    },
    maxAmount() {
      return this.fromOptions[this.fromSelectedIndex].maximum
    },
    isRedelegation() {
      return this.fromSelectedIndex !== 0 && this.fromSelectedIndex !== "0" // where are these 0 strings comming from?
    },
    undelegationPeriod() {
      return this.currentNetwork.lockUpPeriod
    },
    enhancedTargetValidator() {
      return validatorEntry(this.targetValidator)
    },
    hasNoNominations() {
      // TODO: only temporary. Need to create a query to know if the address has any nomination
      return (
        this.currentNetwork.network_type === `polkadot` &&
        this.session.addressRole === `none`
      )
    },
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
      this.$apollo.queries.balance.refetch()
      this.$apollo.queries.delegations.refetch()
    },
    validateForm() {
      this.$v.$touch()
      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()
      this.fromSelectedIndex = 0
      this.amount = 0
    },
    setMaxAmount() {
      this.amount = this.maxAmount
    },
    isMaxAmount() {
      return parseFloat(this.amount) === parseFloat(this.maxAmount)
    },
    enterPressed() {
      this.$refs.actionModal.validateChangeStep()
    },
    onSuccess(event) {
      this.$emit(`success`, event)

      // update registered topics for emails as the validator set changed
      this.$store.dispatch("updateNotificationRegistrations")
      // update the role of the user as it might change after bonding the first time
      if (this.currentNetwork.network_type === "polkadot") {
        this.$store.dispatch("checkAddressRole", {
          address: this.address,
          networkId: this.currentNetwork.id,
        })
      }
    },
  },
  validations() {
    return {
      amount: {
        required: (amount) => {
          // In Polkadot we don't need to bond extra, the user may just want to nominate a new validator
          // stash accounts or new accounts that haven't bonded tokens yet, need to specify an amount to bond
          if (
            this.currentNetwork.network_type === "polkadot" &&
            ["controller", "stash/controller"].includes(
              this.session.addressRole
            )
          ) {
            return true
          }
          return !!amount && amount !== `0`
        },
        decimal,
        max: (x) => Number(x) <= this.maxAmount,
        min: (x) => {
          // see required
          if (
            this.currentNetwork.network_type === "polkadot" &&
            ["controller", "stash/controller"].includes(
              this.session.addressRole
            )
          ) {
            return true
          }
          return Number(x) >= SMALLEST
        },
        maxDecimals: (x) => {
          return x.toString().split(".").length > 1
            ? x.toString().split(".")[1].length <= 6
            : true
        },
      },
    }
  },
  apollo: {
    validators: {
      query: gql`
        query validators($networkId: String!) {
          validators(networkId: $networkId) {
            id
            name
            operatorAddress
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.validators
      },
      /* istanbul ignore next */
      skip() {
        return (
          !this.address ||
          !this.$refs.actionModal ||
          !this.$refs.actionModal.show
        )
      },
    },
    delegations: {
      query: gql`
        query delegations($networkId: String!, $delegatorAddress: String!) {
          delegations(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
          ) {
            id
            amount
            validator {
              id
              operatorAddress
              name
            }
          }
        }
      `,
      /* istanbul ignore next */
      skip() {
        return (
          !this.address ||
          !this.$refs.actionModal ||
          !this.$refs.actionModal.show
        )
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.address,
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.delegations
      },
    },
    balance: {
      query: gql`
        query balance($networkId: String!, $address: String!) {
          balancesV2(networkId: $networkId, address: $address) {
            total
            available
            denom
          }
        }
      `,
      /* istanbul ignore next */
      skip() {
        return (
          !this.address ||
          !this.currentNetwork.stakingDenom ||
          !this.$refs.actionModal ||
          !this.$refs.actionModal.show
        )
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.address,
        }
      },
      /* istanbul ignore next */
      update(data) {
        return (
          data.balancesV2.find(
            ({ denom }) => denom === this.currentNetwork.stakingDenom
          ) || {
            amount: 0,
          }
        )
      },
    },
    undelegations: {
      query() {
        /* istanbul ignore next */
        return gql`
        query undelegations($networkId: String!, $delegatorAddress: String!) {
          undelegations(networkId: $networkId, delegatorAddress: $delegatorAddress) {
            id
            validator {
              ${ValidatorFragment}
            }
            amount
            startHeight
            endTime
          }
        }
      `
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.currentNetwork.id,
          delegatorAddress: this.address,
        }
      },
      /* istanbul ignore next */
      skip() {
        return this.currentNetwork.network_type !== `polkadot` // we only need undelegations for Polkadot networks
      },
      /* istanbul ignore next */
      update(data) {
        this.undelegationsLoaded = true
        return data.undelegations
      },
    },
    $subscribe: {
      userTransactionAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.network,
            address: this.address,
          }
        },
        /* istanbul ignore next */
        skip() {
          return (
            !this.address ||
            !this.$refs.actionModal ||
            !this.$refs.actionModal.show
          )
        },
        query: UserTransactionAdded,
        /* istanbul ignore next */
        result() {
          this.$apollo.queries.balance.refetch()
          this.$apollo.queries.delegations.refetch()
        },
      },
      blockAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.network,
          }
        },
        /* istanbul ignore next */
        query() {
          return gql`
            subscription blockAdded($networkId: String!) {
              blockAdded(networkId: $networkId) {
                data
              }
            }
          `
        },
        /* istanbul ignore next */
        skip() {
          return this.currentNetwork.network_type !== "polkadot"
        },
        /* istanbul ignore next */
        result({ data }) {
          if (data.blockAdded.data) {
            this.isInElection = JSON.parse(data.blockAdded.data).isInElection
          }
        },
      },
    },
  },
}
</script>
