<template>
  <action-modal
    id="modal-withdraw-all-rewards"
    ref="actionModal"
    :submit-fn="submitForm"
    :simulate-fn="simulateForm"
    title="Withdraw"
    class="modal-withdraw-rewards"
    submission-error-prefix="Withdrawal failed"
  >
    <tm-form-group
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ num.viewDenom(bondDenom) }}</span>
      <tm-field
        id="amount"
        v-model="totalRewards"
        type="number"
        readonly="readonly"
      />
    </tm-form-group>
  </action-modal>
</template>

<script>
import { mapGetters } from "vuex"
import num, { uatoms, atoms } from "../../scripts/num.js"
import ActionModal from "common/ActionModal"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"

export default {
  name: `modal-withdraw-all-rewards`,
  components: {
    ActionModal,
    TmField,
    TmFormGroup
  },
  data: () => ({
    num
  }),
  computed: {
    ...mapGetters([`bondDenom`, `distribution`, `lastHeader`, `session`]),
    totalRewards({ bondDenom, distribution } = this) {
      const rewards = distribution.totalRewards[bondDenom]
      return (rewards && num.fullDecimals(atoms(rewards))) || 0
    }
  },
  watch: {
    lastHeader: {
      immediate: true,
      handler() {
        if (
          this.session.signedIn &&
          this.$refs.actionModal &&
          this.$refs.actionModal.show
        ) {
          this.$store.dispatch(`getTotalRewards`)
        }
      }
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
        gas: String(gasEstimate),
        gas_prices: [
          {
            amount: String(uatoms(gasPrice)),
            denom: this.bondDenom
          }
        ],
        submitType,
        password
      })

      this.$store.commit(`notify`, {
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn your rewards.`
      })
    }
  }
}
</script>
