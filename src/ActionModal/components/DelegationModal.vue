<template>
  <ActionModal
    id="delegation-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    :title="isRedelegation ? 'Restake' : 'Stake'"
    class="delegation-modal"
    submission-error-prefix="Staking failed"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="delegate"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup class="action-modal-form-group">
      <div class="form-message notice">
        <span v-if="!isRedelegation">
          It will take 21 days to unlock your tokens after they are staked.
          There is a risk that some tokens will be lost depending on the
          behaviour of the validator you choose.
        </span>
        <span v-else>
          Voting power and rewards will change instantly upon restaking — but
          your tokens will still be subject to the risks associated with the
          original stake for the duration of the unstaking period.
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup class="action-modal-form-group" field-id="to" field-label="To">
      <TmField
        id="to"
        :value="targetValidator | validatorEntry"
        type="text"
        readonly
      />
      <TmFormMsg
        v-if="targetValidator.status === 'INACTIVE' && !isRedelegation"
        :msg="
          `You are about to stake to an inactive validator (${targetValidator.statusDetailed})`
        "
        type="custom"
        class="tm-form-msg--desc"
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
          placeholder="0"
          class="tm-field-addon"
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
      <span class="form-message">
        Available to stake:
        {{ maxAmount }}
        {{ denom }}s
      </span>
      <TmFormMsg
        v-if="balance === 0"
        :msg="`doesn't have any ${denom}s`"
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
        v-else-if="$v.amount.$error && !$v.amount.between"
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
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
import { between, decimal } from "vuelidate/lib/validators"
import gql from "graphql-tag"
import { uatoms, SMALLEST } from "src/scripts/num"
import TmField from "src/components/common/TmField"
import TmFieldGroup from "src/components/common/TmFieldGroup"
import TmBtn from "src/components/common/TmBtn"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"
import ActionModal from "./ActionModal"
import transaction from "../utils/transactionTypes"
import { toMicroDenom } from "src/scripts/common"
import { formatBech32, validatorEntry } from "src/filters"
import { UserTransactionAdded } from "src/gql"

export default {
  name: `delegation-modal`,
  components: {
    TmField,
    TmFieldGroup,
    TmBtn,
    TmFormGroup,
    TmFormMsg,
    ActionModal
  },
  filters: {
    validatorEntry
  },
  props: {
    targetValidator: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    amount: null,
    fromSelectedIndex: `0`,
    balance: {
      amount: null,
      denom: ``
    },
    validators: [],
    delegations: [],
    denom: ``
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`, `address`]),
    toOptions() {
      return this.validators
        .filter(
          validator =>
            validator.operatorAddress === this.targetValidator.operatorAddress
        )
        .map(validator => {
          return {
            address: validator.operatorAddress,
            key: `${validator.name} - ${formatBech32(
              validator.operatorAddress,
              false,
              20
            )}`,
            value: 0
          }
        })
    },
    fromOptions() {
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
        this.delegations
          // exclude target validator
          .filter(
            delegation =>
              delegation.validator.operatorAddress !==
              this.targetValidator.operatorAddress
          )
          .map((delegation, index) => {
            return {
              address: delegation.validator.operatorAddress,
              maximum: Number(delegation.amount),
              key: validatorEntry(delegation.validator),
              value: index + 1
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
      if (!this.targetValidator.operatorAddress) return {}

      if (this.isRedelegation) {
        return {
          type: transaction.REDELEGATE,
          validatorSourceAddress: this.from,
          validatorDestinationAddress: this.targetValidator.operatorAddress,
          amount: uatoms(this.amount),
          denom: toMicroDenom(this.denom)
        }
      } else {
        return {
          type: transaction.DELEGATE,
          validatorAddress: this.targetValidator.operatorAddress,
          amount: uatoms(this.amount),
          denom: toMicroDenom(this.denom)
        }
      }
    },
    notifyMessage() {
      if (this.isRedelegation) {
        return {
          title: `Successfully restaked!`,
          body: `You have successfully restaked your ${this.denom}s`
        }
      } else {
        return {
          title: `Successfully staked!`,
          body: `You have successfully staked your ${this.denom}s`
        }
      }
    },
    maxAmount() {
      return this.fromOptions[this.fromSelectedIndex].maximum
    },
    isRedelegation() {
      return this.fromSelectedIndex !== `0`
    }
  },
  mounted() {
    this.$apollo.queries.balance.refetch()
    this.$apollo.queries.delegations.refetch()
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
      this.fromSelectedIndex = 0
      this.amount = null
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
    }
  },
  validations() {
    return {
      amount: {
        required: x => !!x && x !== `0`,
        decimal,
        between: between(SMALLEST, this.maxAmount)
      }
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
      skip() {
        /* istanbul ignore next */
        return !this.address
      },
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network,
          address: this.address,
          denom: this.denom
        }
      }
    },
    denom: {
      query: gql`
        query NetworksDelegationModal($networkId: String!) {
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
    }
  },
  $subscribe: {
    userTransactionAdded: {
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network,
          address: this.address
        }
      },
      skip() {
        /* istanbul ignore next */
        return !this.address
      },
      query: UserTransactionAdded,
      result({ data }) {
        /* istanbul ignore next */
        if (data.userTransactionAdded.success) {
          this.$apollo.queries.delegations.refetch()
        }
      }
    }
  }
}
</script>
