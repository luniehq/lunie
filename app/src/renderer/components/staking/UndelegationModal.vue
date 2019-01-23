<template>
  <action-modal
    id="undelegation-modal"
    ref="actionModal"
    title="Undelegate"
    class="undelegation-modal"
    @close-action-modal="close"
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

    <tm-form-group
      class="action-modal-form-group"
      field-id="password"
      field-label="Password"
    >
      <tm-field
        id="password"
        v-model="password"
        type="password"
        placeholder="Password"
      />
    </tm-form-group>
    <div slot="action-modal-footer">
      <tm-btn
        v-if="sending"
        value="Sending..."
        disabled="disabled"
        color="primary"
      />
      <tm-btn
        v-else-if="!connected"
        value="Connecting..."
        disabled="disabled"
        color="primary"
      />
      <tm-btn
        v-else
        id="submit-undelegation"
        :disabled="$v.$invalid"
        value="Submit Undelegation"
        color="primary"
        @click.native="validateForm"
      />
    </div>
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
    amount: null,
    password: ``,
    selectedIndex: 0,
    sending: false
  }),
  computed: {
    ...mapGetters([`connected`, `bondDenom`])
  },
  validations() {
    return {
      amount: {
        required,
        integer,
        between: between(1, this.maximum)
      },
      password: {
        required
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showUndelegationModal`, false)
    },
    async validateForm() {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        await this.submitForm()
      }
    },
    async submitForm() {
      this.sending = true

      await this.$refs.actionModal.submit(async () => {
        await this.$store.dispatch(`submitUnbondingDelegation`, {
          amount: -this.amount,
          validator: this.validator,
          password: this.password
        })

        this.$store.commit(`notify`, {
          title: `Successful undelegation!`,
          body: `You have successfully undelegated ${this.amount} ${
            this.denom
          }s.`
        })
      }, `Undelegation failed`)

      this.sending = false
    }
  }
}
</script>
