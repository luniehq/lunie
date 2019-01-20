<template>
  <action-modal
    id="delegation-modal"
    ref="actionModal"
    title="Delegate"
    class="delegation-modal"
    @close-action-modal="close"
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
      :error="$v.amount.$dirty && $v.amount.$invalid"
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
        v-if="$v.amount.$dirty && $v.amount.$invalid && !$v.amount.required"
        name="Amount"
        type="required"
      />
      <tm-form-msg
        v-else-if="!$v.amount.integer"
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
    <div class="action-modal-footer">
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
        id="submit-delegation"
        value="Submit Delegation"
        color="primary"
        @click.native="validateForm"
      />
    </div>
  </action-modal>
</template>

<script>
import { mapGetters } from "vuex"
import ClickOutside from "vue-click-outside"
import { required, between, integer } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import TmBtn from "common/TmBtn"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import ActionModal from "common/ActionModal"

export default {
  name: `delegation-modal`,
  directives: {
    ClickOutside
  },
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
    password: ``,
    selectedIndex: 0,
    sending: false
  }),
  computed: {
    ...mapGetters([`wallet`, `connected`]),
    from() {
      return this.fromOptions[this.selectedIndex].address
    }
  },
  methods: {
    close() {
      this.$emit(`update:showDelegationModal`, false)
    },
    resetForm() {
      this.amount = null
      this.password = ``
      this.sending = false
      this.$v.$reset()
    },
    async validateForm() {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        await this.submitForm()
      }
    },
    async submitDelegation() {
      await this.$refs.actionModal.submit(async () => {
        await this.$store.dispatch(`submitDelegation`, {
          validator_addr: this.validator.operator_address,
          amount: String(this.amount),
          password: this.password
        })

        this.$store.commit(`notify`, {
          title: `Successful delegation!`,
          body: `You have successfully delegated your ${this.denom}s`
        })
      }, `Submitting proposal failed`)
    },
    async submitRedelegation() {
      await this.$refs.actionModal.submit(async () => {
        const validatorSrc = this.delegates.delegates.find(
          v => this.from === v.operator_address
        )
        await this.$store.dispatch(`submitRedelegation`, {
          validatorSrc,
          validatorDst: this.validator,
          amount: String(this.amount),
          password: this.password
        })

        this.$store.commit(`notify`, {
          title: `Successful redelegation!`,
          body: `You have successfully redelegated your ${this.denom}s`
        })
      }, `Submitting proposal failed`)
    },
    async submitForm() {
      this.sending = true

      if (this.from === this.wallet.address) {
        await this.submitDelegation()
      } else {
        await this.submitRedelegation()
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
