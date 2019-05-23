<template>
  <ActionModal
    id="modal-withdraw-rewards"
    ref="actionModal"
    :submit-fn="submitForm"
    :simulate-fn="simulateForm"
    title="Withdraw"
    class="modal-withdraw-rewards"
    submission-error-prefix="Withdrawal failed"
  >
    <TmFormGroup
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ denom | viewDenom }}</span>
      <TmField id="amount" :value="rewards | atoms | fullDecimals" readonly />
    </TmFormGroup>
    <span v-if="!validatorAddress" class="form-message">
      Note: Lunie will withdraw only the top 5 rewards in a single transaction
      due to a limitation in the Ledger Nano S.
    </span>
  </ActionModal>
</template>

<script>
import { viewDenom, atoms, fullDecimals } from "../../scripts/num.js"
import ActionModal from "common/ActionModal"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"

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
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
    async simulateForm() {
      return await this.$store.dispatch(`simulateWithdrawAllRewards`)
    },
    async submitForm(gasEstimate, gasPrice, password, submitType) {
      await this.$store.dispatch(`withdrawAllRewards`, {
        gas: gasEstimate,
        gasPrice,
        denom: this.denom,
        validatorAddress: this.validatorAddress,
        password,
        submitType
      })

      this.$store.commit(`notify`, {
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn your rewards.`
      })
    }
  }
}
</script>
