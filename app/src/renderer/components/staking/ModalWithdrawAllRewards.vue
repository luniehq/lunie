<template>
  <action-modal
    id="modal-withdraw-all-rewards"
    ref="actionModal"
    :submit-fn="submitForm"
    :validate="isValid"
    title="Withdraw"
    class="modal-withdraw-rewards"
    submission-error-prefix="Withdrawal failed"
  >
    <tm-form-group
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ bondDenom }}</span>
      <tm-field
        id="amount"
        v-model="totalRewards"
        type="number"
        readonly
      />
    </tm-form-group>
  </action-modal>
</template>

<script>
import ClickOutside from "vue-click-outside"
import { mapGetters } from "vuex"
import { atoms } from "../../scripts/num.js"
import ActionModal from "common/ActionModal"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"

export default {
  name: `modal-withdraw-all-rewards`,
  directives: {
    ClickOutside
  },
  components: {
    ActionModal,
    TmField,
    TmFormGroup
  },
  computed: {
    ...mapGetters([`bondDenom`, `distribution`]),
    totalRewards() {
      const { bondDenom, distribution } = this
      return (
        (distribution.totalRewards[bondDenom] &&
					atoms(distribution.totalRewards[bondDenom])) ||
				0
      )
    }
  },
  methods: {
    isValid() {
      return true
    },
    open() {
      this.$refs.actionModal.open()
    },
    async submitForm(submitType, password) {
      await this.$store.dispatch(`withdrawAllRewards`, {
        submitType,
        password
      })

      this.$store.commit(`notify`, {
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn all your unclaimed rewards.`
      })
    }
  }
}
</script>
