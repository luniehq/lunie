<template>
  <ActionModal
    id="modal-withdraw-rewards"
    ref="actionModal"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    title="Withdraw"
    class="modal-withdraw-rewards"
    submission-error-prefix="Withdrawal failed"
    :post-submit="postSubmit"
  >
    <TmFormGroup
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ denom | viewDenom }}</span>
      <TmField id="amount" :value="rewards | atoms | fullDecimals" readonly />
    </TmFormGroup>
    <span v-if="!validatorAddress" class="form-message withdraw-limit">
      Note: Lunie will withdraw only the top 5 rewards in a single transaction
      due to a limitation in the Ledger Nano.
    </span>
  </ActionModal>
</template>

<script>
import { viewDenom, atoms, fullDecimals } from "../../scripts/num.js"
import ActionModal from "common/ActionModal"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"

import transaction from "src/components/ActionManager/transactionTypes"

export default {
  name: `modal-withdraw-rewards`,
  components: {
    ActionModal,
    TmField,
    TmFormGroup
  },
  filters: {
    atoms,
    viewDenom,
    fullDecimals
  },
  props: {
    validatorAddress: {
      type: String,
      required: false,
      default: null
    },
    rewards: {
      type: Number,
      default: 0
    },
    denom: {
      type: String,
      required: true
    }
  },
  computed: {
    transactionData() {
      return {
        type: transaction.WITHDRAW,
        validatorAddress: this.validatorAddress
      }
    },
    notifyMessage() {
      return {
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn your rewards.`
      }
    }
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
    postSubmit(txData) {
      this.$store.dispatch("postWithdrawAllRewards", txData)
    }
  }
}
</script>

<style scope>
.form-message.withdraw-limit {
  white-space: normal;
}
</style>
