<template>
  <ActionModal
    id="modal-withdraw-rewards"
    ref="actionModal"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    title="Withdraw"
    class="modal-withdraw-rewards"
    submission-error-prefix="Withdrawal failed"
  >
    <span class="form-message notice withdraw-limit">
      Lunie will only withdraw rewards from 5 validators at a time because of a
      limitation with the Ledger Nano S.
    </span>
    <TmFormGroup
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ denom | viewDenom }}</span>
      <TmField id="amount" :value="rewards | atoms | fullDecimals" readonly />
    </TmFormGroup>
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
        type: transaction.WITHDRAW
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
    }
  }
}
</script>

<style scope>
.form-message.withdraw-limit {
  white-space: normal;
}
</style>
