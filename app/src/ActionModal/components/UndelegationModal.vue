<template>
  <ActionModal
    id="undelegation-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    :title="isRedelegation ? 'Restake' : 'Unstake'"
    class="undelegation-modal"
    :submission-error-prefix="
      isRedelegation ? 'Restaking failed' : 'Unstaking failed'
    "
    :transaction-type="
      isRedelegation ? messageType.REDELEGATE : messageType.UNDELEGATE
    "
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="undelegate"
    :disabled="session.addressRole === `stash` || isInElection"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup
      v-if="session.addressRole === `stash`"
      class="action-modal-form-group"
    >
      <div class="form-message notice">
        <span>
          This is a stash account, you cannot perform any unstake related
          action. To decrease the amount your stake and change your validators
          you need to sign in with your controller account
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup
      v-if="session.addressRole !== `stash`"
      class="action-modal-form-group"
    >
      <div class="form-message notice">
        <span v-if="isInElection">
          There is currently an ongoing election for new validator candidates.
          Unstake is not allowed by now.
        </span>
        <span v-else-if="!isRedelegation">
          Unstaking takes {{ undelegationPeriod }} to complete and cannot be
          undone. Please make sure you understand the rules of staking.
        </span>
        <span v-else>
          Voting power and rewards will change instantly upon restaking — but
          your tokens will still be subject to the risks associated with the
          original stake for the duration of the unstaking period.
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup
      v-if="isUnnomination && session.addressRole !== `stash`"
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <TmField
        id="from"
        :value="enhancedSourceValidator"
        type="text"
        readonly
      />
    </TmFormGroup>
    <TmFormGroup
      v-if="currentNetwork.network_type !== 'polkadot'"
      class="action-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <TmField
        id="to"
        v-model="toSelectedIndex"
        :options="toOptions"
        type="select"
      />
      <TmFormMsg
        v-if="targetValidator.status === 'INACTIVE' && isRedelegation"
        :msg="`You are about to restake to an inactive validator (${targetValidator.statusDetailed})`"
        type="custom"
        class="tm-form-msg--desc"
      />
    </TmFormGroup>
    <TmFormGroup
      v-if="
        currentNetwork.network_type === `polkadot`
          ? !isUnnomination && session.addressRole !== `stash`
          : true
      "
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix max-button">{{ stakingDenom }}</span>
      <TmFieldGroup>
        <TmField
          id="amount"
          v-model="amount"
          v-focus
          class="tm-field-addon"
          placeholder="0"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <TmBtn
          type="button"
          class="secondary addon-max"
          value="Set Max"
          @click.native="setMaxAmount()"
        />
      </TmFieldGroup>
      <span v-if="maximum > 0" class="form-message">
        Currently staked: {{ maximum }} {{ stakingDenom }}s
      </span>
      <TmFormMsg
        v-if="currentNetwork.network_type === 'cosmos' && maximum === 0"
        :msg="`don't have any ${stakingDenom}s delegated to this validator`"
        name="You"
        type="custom"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${stakingDenom}s to proceed.`"
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
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import gql from "graphql-tag"
import { SMALLEST } from "src/scripts/num"
import { decimal } from "vuelidate/lib/validators"
import ActionModal from "./ActionModal"
import TmField from "src/components/common/TmField"
import TmFieldGroup from "src/components/common/TmFieldGroup"
import TmBtn from "src/components/common/TmBtn"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"
import { formatAddress, validatorEntry } from "src/filters"
import { UserTransactionAdded } from "src/gql"
import { messageType } from "../../components/transactions/messageTypes"

export default {
  name: `undelegation-modal`,
  components: {
    ActionModal,
    TmField,
    TmFieldGroup,
    TmBtn,
    TmFormGroup,
    TmFormMsg,
  },
  filters: {
    validatorEntry,
  },
  props: {
    sourceValidator: {
      type: Object,
      default: () => ({}),
    },
    isUnnomination: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    amount: 0,
    delegations: [],
    validators: [],
    toSelectedIndex: `0`,
    balance: {
      total: 0,
      available: 0,
    },
    messageType,
    smallestAmount: SMALLEST,
    isInElection: false, // Handle election period in Polkadot
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`, `address`, `stakingDenom`, `currentNetwork`]),
    maximum() {
      if (this.currentNetwork.network_type === `polkadot`) {
        const totalStaked = this.balance.total - this.balance.available
        return totalStaked.toFixed(6) || 0
      } else {
        const delegation = this.delegations.find(
          ({ validator }) =>
            validator.operatorAddress === this.sourceValidator.operatorAddress
        )
        return delegation ? Number(delegation.amount) : 0
      }
    },
    transactionData() {
      if (this.isRedelegation) {
        if (
          isNaN(this.amount) ||
          !this.sourceValidator.operatorAddress ||
          !this.toSelectedIndex ||
          !this.stakingDenom
        ) {
          return {}
        }
        return {
          type: messageType.RESTAKE,
          from: [this.sourceValidator.operatorAddress],
          to: [this.toSelectedIndex],
          amount: {
            amount: this.amount,
            denom: this.stakingDenom,
          },
          addressRole: this.session.addressRole,
        }
      } else {
        if (
          isNaN(this.amount) ||
          (!this.sourceValidator.operatorAddress &&
            this.currentNetwork.network_type !== `polkadot`) ||
          !this.stakingDenom
        ) {
          return {}
        }
        return {
          type: messageType.UNSTAKE,
          from:
            this.sourceValidator && this.sourceValidator.operatorAddress
              ? [this.sourceValidator.operatorAddress]
              : null,
          amount: {
            amount: this.amount,
            denom: this.stakingDenom,
          },
          addressRole: this.session.addressRole,
        }
      }
    },
    notifyMessage() {
      if (this.isRedelegation) {
        return {
          title: `Successfully restaked!`,
          body: `You have successfully restaked ${this.amount} ${this.stakingDenom}s.`,
        }
      } else {
        return {
          title: `Successfully unstaked!`,
          body: `You have successfully unstaked ${this.amount} ${this.stakingDenom}s.`,
        }
      }
    },
    fromOptions() {
      let options = []
      options = options.concat(
        this.delegations.map((delegation, index) => {
          return {
            address: delegation.validator.operatorAddress,
            maximum: Number(delegation.amount),
            key: `${delegation.validator.name} - ${formatAddress(
              delegation.validator.operatorAddress
            )}`,
            value: index + 1,
          }
        })
      )
      return options
    },
    toOptions() {
      let options = [
        // from wallet
        {
          address: this.address,
          maximum: Number(this.balance.amount),
          key: `My Wallet - ${formatAddress(this.address)}`,
          value: 0,
        },
      ]
      options = options.concat(
        this.validators
          // exclude the validator we are redelegating from
          .filter(
            (validator) =>
              validator.operatorAddress !== this.sourceValidator.operatorAddress
          )
          .map((validator) => {
            return {
              address: validator.operatorAddress,
              key: validatorEntry(validator),
              value: validator.operatorAddress,
            }
          })
      )
      return options
    },
    targetValidator() {
      return (
        this.validators.find(
          (validator) => validator.operatorAddress === this.toSelectedIndex
        ) || { status: `` }
      )
    },
    isRedelegation() {
      return this.toSelectedIndex !== `0`
    },
    undelegationPeriod() {
      return this.currentNetwork.lockUpPeriod
    },
    enhancedSourceValidator() {
      return validatorEntry(this.sourceValidator)
    },
  },
  validations() {
    return {
      amount: {
        required: (amount) => {
          // In Polkadot we don't need to unbond tokens, the user may just want to unnominate a validator
          // stash accounts can't do anything else but unbond so we make it required
          // none accounts can't access this modal
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
        max: (x) => Number(x) <= this.maximum,
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

      this.amount = 0
    },
    setMaxAmount() {
      this.amount = this.maximum
    },
    enterPressed() {
      this.$refs.actionModal.validateChangeStep()
    },
    onSuccess(event) {
      this.$emit(`success`, event)

      // update registered topics for emails as the validator set changed
      this.$store.dispatch("updateNotificationRegistrations")
    },
  },
  apollo: {
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
              name
              operatorAddress
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
        query Balances($networkId: String!, $address: String!) {
          balancesV2(networkId: $networkId, address: $address) {
            total
            available
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
          address: this.address,
        }
      },
      /* istanbul ignore next */
      update(data) {
        return (
          data.balancesV2.find(({ denom }) => this.stakingDenom) || {
            total: 0,
            available: 0,
          }
        )
      },
    },
    validators: {
      query: gql`
        query validators($networkId: String!) {
          validators(networkId: $networkId) {
            id
            name
            operatorAddress
            status
            statusDetailed
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
        return data.validators || []
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
