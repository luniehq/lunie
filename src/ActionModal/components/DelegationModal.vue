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
        <span v-if="!isRedelegation">
          It will take {{ undelegationPeriod }} to unlock your tokens after they
          are staked. There is a risk that some tokens will be lost depending on
          the behaviour of the validator you choose.
        </span>
        <span v-else>
          Voting power and rewards will change instantly upon restaking — but
          your tokens will still be subject to the risks associated with the
          original stake for the duration of the unstaking period.
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup
      v-if="session.addressRole !== `stash`"
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
      v-if="session.addressRole !== `stash`"
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
      v-if="session.addressRole !== `controller`"
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      :field-label="`Amount${
        currentNetwork.network_type === 'polkadot' &&
        totalStaked > 0 &&
        session.addressRole !== `stash`
          ? ' (Optional)'
          : ''
      }`"
    >
      <span class="input-suffix max-button">{{ stakingDenom }}</span>
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
        {{ stakingDenom }}s
      </span>
      <TmFormMsg
        v-if="balance.amount === '0'"
        :msg="`doesn't have any ${stakingDenom}s`"
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
import { UserTransactionAdded } from "src/gql"

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
      required: true,
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
    messageType,
    smallestAmount: SMALLEST,
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`, `address`, `stakingDenom`, `currentNetwork`]),
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
          maximum: Number(this.balance.amount),
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
      if (!this.targetValidator.operatorAddress || isNaN(this.amount)) return {}

      if (this.isRedelegation) {
        return {
          type: messageType.RESTAKE,
          from: [this.from],
          to: [this.targetValidator.operatorAddress],
          amount: {
            amount: this.amount,
            denom: this.stakingDenom,
          },
          addressRole: this.session.addressRole,
        }
      } else {
        return {
          type: messageType.STAKE,
          to: [this.targetValidator.operatorAddress],
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
          body: `You have successfully restaked your ${this.stakingDenom}s`,
        }
      } else {
        return {
          title: `Successfully staked!`,
          body: `You have successfully staked your ${this.stakingDenom}s`,
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
      // TODO: get this from API. Should be inside the network object
      if (this.currentNetwork.network_type === "cosmos") {
        return "21 days"
      } else if (this.currentNetwork.network_type === "polkadot") {
        return "7 days"
      } else {
        return `a certain number of time`
      }
    },
    enhancedTargetValidator() {
      return validatorEntry(this.targetValidator)
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
    },
  },
  validations() {
    return {
      amount: {
        required: (x) => (!!x && x !== `0`) || this.session.addressRole === `controller`,
        decimal,
        max: (x) => Number(x) <= this.maxAmount,
        min: (x) =>
          this.currentNetwork.network_type === "polkadot" ||
          Number(x) >= SMALLEST,
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
        return !this.address
      },
    },
    delegations: {
      query: gql`
        query DelegationsDelegationModal(
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
              name
            }
          }
        }
      `,
      /* istanbul ignore next */
      skip() {
        return !this.address
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
        query BalanceDelegationModal(
          $networkId: String!
          $address: String!
          $denom: String!
        ) {
          balance(networkId: $networkId, address: $address, denom: $denom) {
            amount
            denom
          }
        }
      `,
      /* istanbul ignore next */
      skip() {
        return !this.address || !this.stakingDenom
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.address,
          denom: this.stakingDenom,
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.balance || { amount: 0 }
      },
    },
    totalStaked: {
      query: gql`
        query overview($networkId: String!, $address: String!) {
          overview(networkId: $networkId, address: $address) {
            liquidStake
            totalStake
          }
        }
      `,
      /* istanbul ignore next */
      skip() {
        return (
          !this.address ||
          !this.network ||
          // only needed for polkadot to determine if user needs to set an amount
          this.currentNetwork.network_type !== "polkadot"
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
      update({ overview: { totalStake, liquidStake } }) {
        return totalStake - liquidStake
      },
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
        return !this.address
      },
      query: UserTransactionAdded,
      /* istanbul ignore next */
      result() {
        this.$apollo.queries.balance.refetch()
        this.$apollo.queries.delegations.refetch()
      },
    },
  },
}
</script>
