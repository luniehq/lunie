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
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup class="action-modal-form-group">
      <div class="form-message notice">
        <span v-if="!isRedelegation">
          Unstaking takes 21 days to complete and cannot be undone. Please make
          sure you understand the rules of staking.
        </span>
        <span v-else>
          Voting power and rewards will change instantly upon restaking — but
          your tokens will still be subject to the risks associated with the
          original stake for the duration of the unstaking period.
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <TmField
        id="from"
        :value="sourceValidator | validatorEntry"
        type="text"
        readonly
      />
    </TmFormGroup>
    <TmFormGroup class="action-modal-form-group" field-id="to" field-label="To">
      <TmField
        id="to"
        v-model="toSelectedIndex"
        :options="toOptions"
        type="select"
      />
      <TmFormMsg
        v-if="targetValidator.status === 'INACTIVE' && isRedelegation"
        :msg="
          `You are about to restake to an inactive validator (${targetValidator.statusDetailed})`
        "
        type="custom"
        class="tm-form-msg--desc"
      />
    </TmFormGroup>
    <TmFormGroup
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
        v-if="maximum === 0"
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
import { toMicroUnit, SMALLEST } from "src/scripts/num"
import { decimal } from "vuelidate/lib/validators"
import ActionModal from "./ActionModal"
import TmField from "src/components/common/TmField"
import TmFieldGroup from "src/components/common/TmFieldGroup"
import TmBtn from "src/components/common/TmBtn"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"
import transactionTypes from "../utils/transactionTypes"
import { toMicroDenom } from "src/scripts/common"
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
    TmFormMsg
  },
  filters: {
    validatorEntry
  },
  props: {
    sourceValidator: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    amount: null,
    delegations: [],
    validators: [],
    toSelectedIndex: `0`,
    balance: {
      amount: 0,
      denom: ``
    },
    messageType,
    smallestAmount: SMALLEST
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`, `networks`, `address`, `stakingDenom`]),
    maximum() {
      const delegation = this.delegations.find(
        ({ validator }) =>
          validator.operatorAddress === this.sourceValidator.operatorAddress
      )
      return delegation ? Number(delegation.amount) : 0
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
          type: transactionTypes.REDELEGATE,
          validatorSourceAddress: this.sourceValidator.operatorAddress,
          validatorDestinationAddress: this.toSelectedIndex,
          amount: toMicroUnit(
            this.amount,
            this.stakingDenom,
            this.networks.find(({ id }) => id === this.network)
          ),
          denom: toMicroDenom(this.stakingDenom)
        }
      } else {
        if (
          isNaN(this.amount) ||
          !this.sourceValidator.operatorAddress ||
          !this.stakingDenom
        ) {
          return {}
        }
        return {
          type: transactionTypes.UNDELEGATE,
          validatorAddress: this.sourceValidator.operatorAddress,
          amount: toMicroUnit(
            this.amount,
            this.stakingDenom,
            this.networks.find(({ id }) => id === this.network)
          ),
          denom: toMicroDenom(this.stakingDenom)
        }
      }
    },
    notifyMessage() {
      if (this.isRedelegation) {
        return {
          title: `Successfully restaked!`,
          body: `You have successfully restaked ${this.amount} ${this.stakingDenom}s.`
        }
      } else {
        return {
          title: `Successfully unstaked!`,
          body: `You have successfully unstaked ${this.amount} ${this.stakingDenom}s.`
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
              delegation.validator.operatorAddress,
              20
            )}`,
            value: index + 1
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
          key: `My Wallet - ${formatAddress(this.address, 20)}`,
          value: 0
        }
      ]
      options = options.concat(
        this.validators
          // exclude the validator we are redelegating from
          .filter(
            validator =>
              validator.operatorAddress !== this.sourceValidator.operatorAddress
          )
          .map(validator => {
            return {
              address: validator.operatorAddress,
              key: validatorEntry(validator),
              value: validator.operatorAddress
            }
          })
      )
      return options
    },
    targetValidator() {
      return (
        this.validators.find(
          validator => validator.operatorAddress === this.toSelectedIndex
        ) || { status: `` }
      )
    },
    isRedelegation() {
      return this.toSelectedIndex !== `0`
    }
  },
  validations() {
    return {
      amount: {
        required: x => !!x && x !== `0`,
        decimal,
        max: x => Number(x) <= this.maximum,
        min: x => Number(x) >= SMALLEST,
        maxDecimals: x => {
          return x.toString().split(".").length > 1
            ? x.toString().split(".")[1].length <= 6
            : true
        }
      }
    }
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
      this.$apollo.queries.delegations.refetch()
    },
    validateForm() {
      this.$v.$touch()

      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.amount = null
    },
    setMaxAmount() {
      this.amount = this.maximum
    },
    enterPressed() {
      this.$refs.actionModal.validateChangeStep()
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    }
  },
  apollo: {
    delegations: {
      query: gql`
        query DelegationsUndelegationModal(
          $networkId: String!
          $delegatorAddress: String!
        ) {
          delegations(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
          ) {
            amount
            validator {
              name
              operatorAddress
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
          delegatorAddress: this.address
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.delegations
      }
    },
    balance: {
      query: gql`
        query Balance($networkId: String!, $address: String!, $denom: String!) {
          balance(networkId: $networkId, address: $address, denom: $denom) {
            amount
            denom
          }
        }
      `,
      /* istanbul ignore next */
      skip() {
        return !this.userAddress
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.userAddress,
          denom: this.stakingDenom
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.balance || { amount: 0 }
      }
    },
    validators: {
      query: gql`
        query validators($networkId: String!) {
          validators(networkId: $networkId) {
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
          networkId: this.network
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.validators || []
      }
    },

    $subscribe: {
      userTransactionAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.network,
            address: this.userAddress
          }
        },
        /* istanbul ignore next */
        skip() {
          return !this.userAddress
        },
        query: UserTransactionAdded,
        /* istanbul ignore next */
        result() {
          this.$apollo.queries.delegations.refetch()
        }
      }
    }
  }
}
</script>
