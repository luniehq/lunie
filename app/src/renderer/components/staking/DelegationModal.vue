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
      <tm-field id="to" v-model="to" type="text" readonly />
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
        :title="fromOptions[selectedIndex].address"
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
        v-focus
        id="amount"
        v-model="$v.amount.$model"
        type="number"
        placeholder="Amount"
      />
      <tm-form-msg
        v-if="!$v.amount.between"
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
        v-else-if="!$v.amount.integer"
        name="Amount"
        type="integer"
      />
    </tm-form-group>
  </action-modal>
</template>

<script>
import { mapGetters } from "vuex"
import { required, between, integer } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import TmBtn from "common/TmBtn"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import ActionModal from "common/ActionModal"

export default {
  name: `delegation-modal`,
  components: {
    Modal,
    TmBtn,
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
    amount: ``,
    selectedIndex: 0
  }),
  computed: {
    ...mapGetters([`wallet`, `delegates`]),
    from() {
      return this.fromOptions[this.selectedIndex].address
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
    async submitDelegation(submitType, password) {
      await this.$store.dispatch(`submitDelegation`, {
        validator_addr: this.validator.operator_address,
        amount: String(this.amount),
        submitType,
        password: password
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
        amount: String(this.amount),
        submitType,
        password: password
      })

      this.$store.commit(`notify`, {
        title: `Successful redelegation!`,
        body: `You have successfully redelegated your ${this.denom}s`
      })
    },
    async submitForm(submitType, password) {
      this.sending = true

      if (this.from === this.wallet.address) {
        await this.submitDelegation(submitType, password)
      } else {
        await this.submitRedelegation(submitType, password)
      }

      this.sending = false
    }
  },
  validations() {
    return {
      amount: {
        required,
        integer,
        between: between(1, this.fromOptions[this.selectedIndex].maximum)
      },
      password: {
        required
      }
    }
  }
}
</script>
