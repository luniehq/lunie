<template>
  <ActionModal
    id="delegation-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="isRedelegation ? 0 : amount"
    :title="isRedelegation ? 'Redelegate' : 'Delegate'"
    class="delegation-modal"
    submission-error-prefix="Delegating failed"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup class="action-modal-form-group">
      <div class="form-message notice">
        <span v-if="!isRedelegation">
          It will take 21 days to unlock your tokens after a delegation and
          there is a risk that some tokens will be lost depending on the
          behaviour of the validator.
        </span>
        <span v-else>
          Voting power and rewards will change instantly upon redelegation —
          your tokens will still be subject to the risks associated with the
          original delegation for the duration of the undelegation period.
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup class="action-modal-form-group" field-id="to" field-label="To">
      <TmField
        id="to"
        v-model="targetValidator.operatorAddress"
        type="text"
        readonly
      />
      <TmFormMsg
        v-if="targetValidator.status === 'INACTIVE' && !isRedelegation"
        :msg="
          `You are about to delegate to an inactive validator (${targetValidator.statusDetailed})`
        "
        type="custom"
        class="tm-form-msg--desc"
      />
      <TmFormMsg
        v-if="targetValidator.status === 'INACTIVE' && isRedelegation"
        :msg="
          `You are about to redelegate to an inactive validator (${targetValidator.statusDetailed})`
        "
        type="custom"
        class="tm-form-msg--desc"
      />
    </TmFormGroup>

    <TmFormGroup
      v-if="fromOptions.length > 1"
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <TmField
        id="from"
        v-model="selectedIndex"
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
      <span class="input-suffix-denom">{{ denom }}</span>
      <TmFieldGroup>
        <TmField
          id="amount"
          v-model="amount"
          v-focus
          class="tm-field-addon"
          type="number"
          placeholder="Amount"
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
        {{
          isRedelegation ? "Available to Redelegate" : "Available to Delegate"
        }}
        :
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
const TmField = () => import("src/components/common/TmField")
const TmFieldGroup = () => import("src/components/common/TmFieldGroup")
const TmBtn = () => import("src/components/common/TmBtn")
const TmFormGroup = () => import("src/components/common/TmFormGroup")
const TmFormMsg = () => import("src/components/common/TmFormMsg")
const ActionModal = () => import("./ActionModal")
const transaction = () => import("../utils/transactionTypes")
import { toMicroDenom } from "src/scripts/common"
import { formatBech32 } from "src/filters"
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
  props: {
    targetValidator: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    amount: 0,
    selectedIndex: 0,
    balance: {
      amount: 0,
      denom: ``
    },
    delegations: [],
    denom: ``
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`, `address`]),
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
          // exclude the validator we are delegating to as a source
          .filter(
            delegation =>
              delegation.validator.operatorAddress !=
              this.targetValidator.operatorAddress
          )
          .map((delegation, index) => {
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
    from() {
      if (!this.session.signedIn) return ``

      return this.fromOptions[this.selectedIndex].address
    },
    isRedelegation() {
      return this.from !== this.address
    },
    transactionData() {
      if (!this.from) return {}

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
          title: `Successful redelegation!`,
          body: `You have successfully redelegated your ${this.denom}s`
        }
      } else {
        return {
          title: `Successful delegation!`,
          body: `You have successfully delegated your ${this.denom}s`
        }
      }
    },
    maxAmount() {
      return this.fromOptions[this.selectedIndex].maximum
    }
  },
  mounted() {
    this.$apollo.queries.balance.refetch()
    this.$apollo.queries.delegations.refetch()
  },
  methods: {
    open(options) {
      if (options && options.redelegation && this.fromOptions.length > 1) {
        this.selectedIndex = 1
      }
      this.$refs.actionModal.open()
    },
    validateForm() {
      this.$v.$touch()

      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.selectedIndex = 0
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
        return !this.address
      },
      variables() {
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
        return !this.address
      },
      variables() {
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
        return {
          networkId: this.network,
          address: this.address
        }
      },
      skip() {
        return !this.address
      },
      query: UserTransactionAdded,
      result({ data }) {
        if (data.userTransactionAdded.success) {
          this.$apollo.queries.delegations.refetch()
        }
      }
    }
  }
}
</script>
