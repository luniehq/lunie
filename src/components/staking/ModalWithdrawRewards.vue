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
    <span class="form-message notice withdraw-limit">
      You can only withdraw rewards from your top 5 validators in a single
      transaction. This is because of a limitation with the Ledger Nano.
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
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
    async simulateForm() {
      return await this.$store.dispatch(`simulateWithdralRewards`)
    },
    async submitForm(gasEstimate, gasPrice, password, submitType) {
      await this.$store.dispatch(`withdrawRewards`, {
        gas: gasEstimate,
        gasPrice,
        denom: this.denom,
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

<style scope>
.form-message.withdraw-limit {
  white-space: normal;
}
</style>
