<template>
  <ActionModal
    id="modal-deposit"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    title="Deposit"
    class="modal-deposit"
    submission-error-prefix="Depositing failed"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    @close="clear"
  >
    <TmFormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ num.viewDenom(denom) }}</span>
      <TmField id="amount" v-model="amount" type="number" />
      <TmFormMsg
        v-if="balance === 0"
        :msg="`doesn't have any ${num.viewDenom(denom)}s`"
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
        v-else-if="$v.amount.$error && !$v.amount.between"
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
      />
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapGetters } from "vuex"
import num, { uatoms, atoms, SMALLEST } from "src/scripts/num.js"
import { between, decimal } from "vuelidate/lib/validators"
import TmField from "src/components/common/TmField"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"
import ActionModal from "./ActionModal"
import transaction from "../utils/transactionTypes"

export default {
  name: `modal-deposit`,
  components: {
    ActionModal,
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
    num,
    amount: 0
  }),
  computed: {
    ...mapGetters([`wallet`, `bondDenom`]),
    balance() {
      const denom = this.wallet.balances.find(b => b.denom === this.denom)
      return (denom && denom.amount) || 0
    },
    transactionData() {
      return {
        type: transaction.DEPOSIT,
        proposalId: this.proposalId,
        amounts: [
          {
            amount: uatoms(this.amount),
            denom: this.denom
          }
        ]
      }
    },
    notifyMessage() {
      return {
        title: `Successful deposit!`,
        body: `You have successfully deposited your ${num.viewDenom(
          this.denom
        )}s on proposal #${this.proposalId}`
      }
    }
  },
  validations() {
    return {
      amount: {
        required: x => !!x && x !== `0`,
        decimal,
        between: between(SMALLEST, atoms(this.balance))
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
    clear() {
      this.$v.$reset()

      this.amount = 0
    }
  }
}
</script>
