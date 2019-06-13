<template>
  <ActionModal
    id="undelegation-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="0"
    title="Undelegate"
    class="undelegation-modal"
    submission-error-prefix="Undelegating failed"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    :post-submit="postSubmit"
    @close="clear"
  >
    <TmFormGroup class="action-modal-form-group">
      <div class="form-message notice">
        <span>
          Undelegations take 21 days to complete and cannot be undone. Please
          make sure you understand the rules of delegation.</span
        >
      </div>
    </TmFormGroup>
    <TmFormGroup
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <TmField id="from" v-model="validator.operator_address" readonly />
    </TmFormGroup>
    <TmFormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ num.viewDenom(denom) }}</span>
      <TmField
        id="amount"
        v-model="amount"
        type="number"
        placeholder="Amount"
      />
      <span v-if="maximum > 0" class="form-message">
        Currently Delegated: {{ maximum }} {{ num.viewDenom(denom) }}s
      </span>
      <TmFormMsg
        v-if="maximum === 0"
        :msg="
          `don't have any ${num.viewDenom(denom)}s delegated to this validator`
        "
        name="You"
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
import num, { uatoms, atoms, SMALLEST } from "../../scripts/num.js"
import { between, decimal } from "vuelidate/lib/validators"
import ActionModal from "common/ActionModal"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import transaction from "src/components/ActionManager/transactionTypes"

export default {
  name: `undelegation-modal`,
  components: {
    ActionModal,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  props: {
    maximum: {
      type: Number,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    validator: {
      type: Object,
      required: true
    },
    denom: {
      type: String,
      required: true
    }
  },
  data: () => ({
    amount: null,
    atoms,
    num
  }),
  computed: {
    ...mapGetters([`liquidAtoms`]),
    transactionData() {
      return {
        type: transaction.UNDELEGATE,
        validator_address: this.validator.operator_address,
        amount: uatoms(this.amount),
        denom: this.denom
      }
    },
    notifyMessage() {
      return {
        title: `Successful undelegation!`,
        body: `You have successfully undelegated ${this.amount} ${num.viewDenom(
          this.denom
        )}s.`
      }
    }
  },
  validations() {
    return {
      amount: {
        required: x => !!x && x !== `0`,
        decimal,
        between: between(SMALLEST, this.maximum)
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

      this.amount = null
    },
    postSubmit(txData) {
      this.$store.dispatch("postSubmitUnbondingDelegation", txData)
    }
  }
}
</script>
