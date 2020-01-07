<template>
  <ActionModal
    id="undelegation-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="0"
    :title="isRedelegation ? 'Restake' : 'Unstake'"
    class="undelegation-modal"
    :submission-error-prefix="
      isRedelegation ? 'Restaking failed' : 'Unstaking failed'
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
      <span class="input-suffix max-button">{{ denom }}</span>
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
        Currently staked: {{ maximum }} {{ denom }}s
      </span>
      <TmFormMsg
        v-if="maximum === 0"
        :msg="`don't have any ${denom}s delegated to this validator`"
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
        v-else-if="$v.amount.$error && !$v.amount.between"
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
      />
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import gql from "graphql-tag"
import { uatoms, SMALLEST } from "src/scripts/num"
import { between, decimal } from "vuelidate/lib/validators"
import ActionModal from "./ActionModal"
import TmField from "src/components/common/TmField"
import TmFieldGroup from "src/components/common/TmFieldGroup"
import TmBtn from "src/components/common/TmBtn"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"
import transaction from "../utils/transactionTypes"
import { toMicroDenom } from "src/scripts/common"
import { formatBech32, validatorEntry } from "src/filters"

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
    denom: "",
    toSelectedIndex: `0`,
    balance: {
      amount: 0,
      denom: ``
    }
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`, `address`]),
    maximum() {
      const delegation = this.delegations.find(
        ({ validator }) =>
          validator.operatorAddress === this.sourceValidator.operatorAddress
      )
      return delegation ? Number(delegation.amount) : 0
    },
    transactionData() {
      if (!this.sourceValidator.operatorAddress) return {}

      if (this.isRedelegation) {
        return {
          type: transaction.REDELEGATE,
          validatorSourceAddress: this.sourceValidator.operatorAddress,
          validatorDestinationAddress: this.toSelectedIndex,
          amount: uatoms(this.amount),
          denom: toMicroDenom(this.denom)
        }
      } else {
        return {
          type: transaction.UNDELEGATE,
          validatorAddress: this.sourceValidator.operatorAddress,
          amount: uatoms(this.amount),
          denom: toMicroDenom(this.denom)
        }
      }
    },
    notifyMessage() {
      if (this.isRedelegation) {
        return {
          title: `Successfully restaked!`,
          body: `You have successfully restaked ${this.amount} ${this.denom}s.`
        }
      } else {
        return {
          title: `Successfully unstaked!`,
          body: `You have successfully unstaked ${this.amount} ${this.denom}s.`
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
            key: `${delegation.validator.name} - ${formatBech32(
              delegation.validator.operatorAddress,
              false,
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
          key: `My Wallet - ${formatBech32(this.address, false, 20)}`,
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
        between: between(SMALLEST, this.maximum)
      }
    }
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
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
      skip() {
        /* istanbul ignore next */
        return !this.address
      },
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network,
          delegatorAddress: this.address
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.delegations
      }
    },
    denom: {
      query: gql`
        query NetworksUndelegationModal($networkId: String!) {
          network(id: $networkId) {
            id
            stakingDenom
          }
        }
      `,
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.network.stakingDenom
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
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.validators
      }
    }
  }
}
</script>
