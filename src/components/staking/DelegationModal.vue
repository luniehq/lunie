<template>
  <ActionModal
    id="delegation-modal"
    ref="actionModal"
    :submit-fn="submitForm"
    :simulate-fn="simulateForm"
    :validate="validateForm"
    :amount="isRedelegation() ? 0 : amount"
    :title="isRedelegation() ? 'Redelegate' : 'Delegate'"
    class="delegation-modal"
    submission-error-prefix="Delegating failed"
    @close="clear"
  >
    <TmFormGroup class="action-modal-form-group" field-id="to" field-label="To">
      <TmField id="to" v-model="to" type="text" readonly />
    </TmFormGroup>

    <TmFormGroup
      v-if="fromOptions.length > 1"
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <TmField
        id="from"
        v-model="selectedIndex"
        :title="from"
        :options="fromOptions"
        type="select"
      />
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
      <span v-if="!isRedelegation()" class="form-message">
        Available to Delegate:
        {{ getFromBalance() }}
        {{ num.viewDenom(denom) }}s
      </span>
      <span v-else-if="isRedelegation()" class="form-message">
        Available to Redelegate:
        {{ getFromBalance() }}
        {{ num.viewDenom(denom) }}s
      </span>
      <TmFormMsg
        v-if="balance === 0"
        :msg="`doesn't have any ${num.viewDenom(denom)}s`"
        name="Wallet"
        type="custom"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
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
import { between, decimal } from "vuelidate/lib/validators"
import num, { uatoms, atoms, SMALLEST } from "../../scripts/num.js"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import ActionModal from "common/ActionModal"

export default {
  name: `delegation-modal`,
  components: {
    TmField,
    TmFormGroup,
    TmFormMsg,
    ActionModal
  },
  props: {
    fromOptions: {
      type: Array,
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
    selectedIndex: 0,
    num
  }),
  computed: {
    ...mapGetters([`delegates`, `session`, `bondDenom`]),
    balance() {
      if (!this.session.signedIn) return 0

      return this.fromOptions[this.selectedIndex].maximum
    },
    from() {
      if (!this.session.signedIn) return ``

      return this.fromOptions[this.selectedIndex].address
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

      this.selectedIndex = 0
      this.amount = null
    },
    isRedelegation() {
      return this.from !== this.session.address
    },
    getFromBalance() {
      return atoms(this.balance)
    },
    async simulateDelegation() {
      return await this.$store.dispatch(`simulateDelegation`, {
        validator_address: this.validator.operator_address,
        amount: String(uatoms(this.amount))
      })
    },
    async submitDelegation(gasEstimate, gasPrice, password, submitType) {
      await this.$store.dispatch(`submitDelegation`, {
        validator_address: this.validator.operator_address,
        amount: String(uatoms(this.amount)),
        submitType,
        password,
        gas: String(gasEstimate),
        gas_prices: [
          {
            amount: String(uatoms(gasPrice)),
            denom: this.denom
          }
        ]
      })

      this.$store.commit(`notify`, {
        title: `Successful delegation!`,
        body: `You have successfully delegated your ${num.viewDenom(
          this.denom
        )}s`
      })
    },
    async simulateRedelegation() {
      const validatorSrc = this.delegates.delegates.find(
        v => this.from === v.operator_address
      )
      return await this.$store.dispatch(`simulateRedelegation`, {
        validatorSrc,
        validatorDst: this.validator,
        amount: String(uatoms(this.amount))
      })
    },
    async submitRedelegation(gasEstimate, gasPrice, password, submitType) {
      const validatorSrc = this.delegates.delegates.find(
        v => this.from === v.operator_address
      )
      await this.$store.dispatch(`submitRedelegation`, {
        validatorSrc,
        validatorDst: this.validator,
        amount: String(uatoms(this.amount)),
        submitType,
        password,
        gas: String(gasEstimate),
        gas_prices: [
          {
            amount: String(uatoms(gasPrice)),
            denom: this.denom
          }
        ]
      })

      this.$store.commit(`notify`, {
        title: `Successful redelegation!`,
        body: `You have successfully redelegated your ${num.viewDenom(
          this.denom
        )}s`
      })
    },
    async simulateForm() {
      if (this.from === this.session.address) {
        return await this.simulateDelegation()
      } else {
        return await this.simulateRedelegation()
      }
    },
    async submitForm(gasEstimate, gasPrice, password, submitType) {
      if (this.from === this.session.address) {
        await this.submitDelegation(gasEstimate, gasPrice, password, submitType)
      } else {
        await this.submitRedelegation(
          gasEstimate,
          gasPrice,
          password,
          submitType
        )
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
  }
}
</script>
