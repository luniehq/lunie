<template>
  <action-modal
    id="delegation-modal"
    ref="actionModal"
    :submit-fn="submitForm"
    :validate="validateForm"
    title="Delegate"
    class="delegation-modal"
    submission-error-prefix="Delegating failed"
  >
    <tm-form-group
      class="action-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <tm-field
        id="to"
        v-model="to"
        type="text"
        readonly
      />
    </tm-form-group>

    <tm-form-group
      v-if="fromOptions.length > 1"
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <tm-field
        id="from"
        v-model="selectedIndex"
        :title="from"
        :options="fromOptions"
        type="select"
      />
    </tm-form-group>
    <tm-form-group
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ denom }}</span>
      <tm-field
        id="amount"
        v-model="amount"
        type="number"
        placeholder="Amount"
      />
      <tm-form-msg
        v-if="balance === 0"
        :msg="`doesn't have any ${denom}s`"
        name="Wallet"
        type="custom"
      />
      <tm-form-msg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <tm-form-msg
        v-else-if="$v.amount.$error && !$v.amount.integer"
        name="Amount"
        type="integer"
      />
      <tm-form-msg
        v-else-if="$v.amount.$error && !$v.amount.between"
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
      />
    </tm-form-group>
  </action-modal>
</template>

<script>
import { mapGetters } from "vuex"
import { required, between, integer } from "vuelidate/lib/validators"
import { uatoms } from "../../scripts/num.js"
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
    selectedIndex: 0
  }),
  computed: {
    ...mapGetters([`wallet`, `delegates`, `session`]),
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
    async submitDelegation(submitType, password) {
      await this.$store.dispatch(`submitDelegation`, {
        validator_addr: this.validator.operator_address,
        amount: String(uatoms(this.amount)),
        submitType,
        password
      })

      this.$store.commit(`notify`, {
        title: `Successful delegation!`,
        body: `You have successfully delegated your ${this.denom}s`
      })
    },
    async submitRedelegation(submitType, password) {
      const validatorSrc = this.delegates.delegates.find(
        v => this.from === v.operator_address
      )
      await this.$store.dispatch(`submitRedelegation`, {
        validatorSrc,
        validatorDst: this.validator,
        amount: String(uatoms(this.amount)),
        submitType,
        password
      })

      this.$store.commit(`notify`, {
        title: `Successful redelegation!`,
        body: `You have successfully redelegated your ${this.denom}s`
      })
    },
    async submitForm(submitType, password) {
      if (this.from === this.wallet.address) {
        await this.submitDelegation(submitType, password)
      } else {
        await this.submitRedelegation(submitType, password)
      }
    }
  },
  validations() {
    return {
      amount: {
        required,
        integer,
        between: between(1, this.balance)
      }
    }
  }
}
</script>
