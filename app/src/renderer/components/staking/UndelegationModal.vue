<template>
  <action-modal
    id="undelegation-modal"
    ref="actionModal"
    :submit-fn="submitForm"
    :validate="validateForm"
    title="Undelegate"
    class="undelegation-modal"
    submission-error-prefix="Undelegating failed"
  >
    <tm-form-group
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <tm-field id="from" v-model="validator.operator_address" readonly />
    </tm-form-group>
    <tm-form-group
      class="action-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <tm-field id="to" v-model="to" readonly="readonly" />
    </tm-form-group>

    <tm-form-group
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ bondDenom }}</span>
      <tm-field
        v-focus
        id="amount"
        v-model="$v.amount.$model"
        type="number"
        placeholder="Amount"
      />
      <tm-form-msg
        v-if="$v.amount.$error && $v.amount.$invalid && !$v.amount.between"
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
      />
      <tm-form-msg
        v-if="$v.amount.$error && $v.amount.$invalid && !$v.amount.required"
        name="Amount"
        type="required"
      />
      <tm-form-msg
        v-else-if="$v.amount.$error && $v.amount.$invalid && !$v.amount.integer"
        name="Amount"
        type="integer"
      />
    </tm-form-group>
  </action-modal>
</template>

<script>
import ClickOutside from "vue-click-outside"
import { mapGetters } from "vuex"
import { required, between, integer } from "vuelidate/lib/validators"
import ActionModal from "common/ActionModal"
import Modal from "common/TmModal"
import TmBtn from "common/TmBtn"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"

export default {
  name: `undelegation-modal`,
  directives: {
    ClickOutside
  },
  components: {
    ActionModal,
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  props: {
    maximum: {
      type: Number,
      required: true
    },
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
    amount: ``,
    selectedIndex: 0
  }),
  computed: {
    ...mapGetters([`bondDenom`])
  },
  validations() {
    return {
      amount: {
        required,
        integer,
        between: between(1, this.maximum)
      }
    }
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
    async validateForm() {
      this.$v.$touch()

      return !this.$v.$invalid
    },
    async submitForm(submitType, password) {
      await this.$store.dispatch(`submitUnbondingDelegation`, {
        amount: -this.amount,
        validator: this.validator,
        submitType,
        password
      })

      this.$store.commit(`notify`, {
        title: `Successful undelegation!`,
        body: `You have successfully undelegated ${this.amount} ${this.denom}s.`
      })
    }
  }
}
</script>
