<template>
  <ActionModal
    id="modal-deposit"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    title="Deposit"
    class="modal-deposit"
    submission-error-prefix="Depositing failed"
    :transaction-type="messageType.DEPOSIT"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="deposit"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ denom }}</span>
      <TmField
        id="amount"
        v-model="amount"
        v-focus
        :disabled="currentNetwork.network_type === `polkadot`"
        type="number"
        placeholder="0"
      />
      <TmFormMsg
        v-if="balance.amount === 0"
        :msg="`doesn't have any ${denom}s`"
        name="Wallet"
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
        :msg="`You don't have enough ${denom}s to proceed.`"
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
import { mapGetters } from "vuex"
import BigNumber from "bignumber.js"
import gql from "graphql-tag"
import { SMALLEST } from "src/scripts/num"
import { decimal } from "vuelidate/lib/validators"
import TmField from "src/components/common/TmField"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"
import ActionModal from "./ActionModal"
import { messageType } from "../../components/transactions/messageTypes"

export default {
  name: `modal-deposit`,
  components: {
    ActionModal,
    TmField,
    TmFormGroup,
    TmFormMsg,
  },
  props: {
    proposalId: {
      type: [Number, String],
      required: true,
    },
    proposalTitle: {
      type: String,
      required: true,
    },
    denom: {
      type: String,
      required: true,
    },
    deposits: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    amount: null,
    balance: {
      amount: null,
      denom: ``,
    },
    messageType,
    smallestAmount: SMALLEST,
  }),
  computed: {
    ...mapGetters([`currentNetwork`]),
    ...mapGetters({ userAddress: `address` }),
    transactionData() {
      if (isNaN(this.amount) || !this.proposalId || !this.denom) {
        return {}
      }
      return {
        type: messageType.DEPOSIT,
        proposalId: this.proposalId,
        amount: {
          amount: this.amount,
          denom: this.denom,
        },
        depositsCount: this.deposits.length,
      }
    },
    notifyMessage() {
      return {
        title: `Successful deposit!`,
        body: `You have successfully deposited your ${this.denom}s on proposal #${this.proposalId}`,
      }
    },
  },
  validations() {
    return {
      amount: {
        required: (x) => !!x && x !== `0`,
        decimal,
        max: (x) => Number(x) <= this.balance.amount,
        min: (x) => Number(x) >= SMALLEST,
        maxDecimals: (x) => {
          if (x) {
            return x.toString().split(".").length > 1
              ? x.toString().split(".")[1].length <= 6
              : true
          } else {
            return false
          }
        },
      },
    }
  },
  methods: {
    open() {
      if (this.currentNetwork.network_type === `polkadot`) {
        this.amount = this.deposits[0].amount[0].amount
      }
      this.$refs.actionModal.open()
    },
    validateForm() {
      this.$v.$touch()

      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.amount = 0
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
  },
  apollo: {
    balance: {
      query: gql`
        query BalanceModalDeposit(
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
        return (
          !this.userAddress ||
          !this.$refs.actionModal ||
          !this.$refs.actionModal.show
        )
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.currentNetwork.id,
          address: this.userAddress,
          denom: this.denom,
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.balance || { amount: 0 }
      },
    },
  },
}
</script>
