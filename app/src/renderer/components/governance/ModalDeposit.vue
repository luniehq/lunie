<template>
  <action-modal
    id="modal-deposit"
    ref="actionModal"
    :submit-fn="submitForm"
    :validate="validateForm"
    title="Deposit"
    class="modal-deposit"
    submission-error-prefix="Depositing failed"
  >
    <tm-form-group
      :error="
        $v.amount.$error && $v.amount.$invalid && (amount > 0 || balance === 0)
      "
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ denom }}</span>
      <tm-field v-focus id="amount" v-model="amount" type="number" />
      <tm-form-msg
        v-if="
          $v.amount.$error && !$v.amount.between && amount > 0 && balance > 0
        "
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
      />
      <tm-form-msg
        v-else-if="balance === 0"
        :msg="`doesn't hold any ${denom}s`"
        name="Wallet"
        type="custom"
      />
      <hr />
    </tm-form-group>
  </action-modal>
</template>

<script>
import { mapGetters } from "vuex"
import { required, between } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import TmBtn from "common/TmBtn"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import ActionModal from "common/ActionModal"

const isInteger = amount => Number.isInteger(amount)

export default {
  name: `modal-deposit`,
  components: {
    ActionModal,
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  props: {
    proposalId: {
      type: [Number, String],
      required: true
    },
    proposalTitle: {
      type: String,
      required: true
    },
    denom: {
      type: String,
      required: true
    }
  },
  data: () => ({
    amount: 0
  }),
  computed: {
    ...mapGetters([`wallet`]),
    balance() {
      // TODO: refactor to get the selected coin when multicoin deposit is enabled
      if (!this.wallet.loading && !!this.wallet.balances.length) {
        let balance = this.wallet.balances.find(
          coin => coin.denom === this.denom
        )
        if (balance) return parseFloat(balance.amount)
      }
      return 0
    }
  },
  validations() {
    return {
      amount: {
        required,
        isInteger,
        between: between(1, this.balance)
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
    async submitForm(submitType, password) {
      // TODO: support multiple coins
      await this.$store.dispatch(`submitDeposit`, {
        submitType,
        password,
        proposal_id: this.proposalId,
        amount: [
          {
            amount: String(this.amount),
            denom: this.denom
          }
        ]
      })

      this.$store.commit(`notify`, {
        title: `Successful deposit!`,
        body: `You have successfully deposited your ${
          this.denom
        }s on proposal #${this.proposalId}`
      })
    }
  }
}
</script>
