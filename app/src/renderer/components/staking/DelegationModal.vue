<template>
  <action-modal
    id="delegation-modal"
    title="Delegate"
    class="delegation-modal"
    @close-action-modal="close"
    :submission-error="submissionError"
  >
    <tm-form-group
      class="action-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <tm-field id="to" v-model="to" type="text" readonly />
    </tm-form-group>

    <tm-form-group
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <tm-field
        v-if="fromOptions.length > 1"
        id="from"
        v-model="selectedIndex"
        :title="fromOptions[selectedIndex].address"
        :options="fromOptions"
        type="select"
      />
      <tm-field
        v-if="fromOptions.length === 1"
        id="from"
        v-model="fromOptions[selectedIndex].address"
        type="text"
        readonly
      />
    </tm-form-group>

    <tm-form-group
      :error="$v.amount.$dirty && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ bondingDenom }}</span>
      <tm-field
        v-focus
        id="amount"
        :max="fromOptions[selectedIndex].maximum"
        :min="0"
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
        :disabled="$v.$invalid"
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
    }
  },
  data: () => ({
    amount: ``,
    password: ``,
    selectedIndex: 0,
    showPassword: false,
    submissionError: null,
    sending: false
  }),
  computed: {
    ...mapGetters([`bondingDenom`, `wallet`, `connected`])
  },
  methods: {
    close() {
      this.$emit(`update:showDelegationModal`, false)
    },
    resetForm() {
      this.amount = null
      this.password = ``
      this.sending = false
      this.submissionError = ``
      this.$v.$reset()
    },
    validateForm() {
      this.sending = true
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.submitDelegation({
          amount: this.amount,
          from: this.fromOptions[this.selectedIndex].address,
          password: this.password
        })
      } else {
        this.sending = false
      }
    },
    async submitDelegation({ amount, from, password }) {
      const delegatorAddr = this.wallet.address
      let stakingTransactions = {}
      let txTitle,
        txBody,
        txAction = ``

      if (from === delegatorAddr) {
        txTitle = `delegation`
        txBody = `delegated`
        txAction = `delegating`

        stakingTransactions.delegations = [
          {
            atoms: amount,
            validator: this.validator
          }
        ]
      } else {
        txTitle = `redelegation`
        txBody = `redelegated`
        txAction = `redelegating`

        let validatorFrom = this.delegates.delegates.find(
          v => from === v.operator_address
        )

        stakingTransactions.redelegations = [
          {
            atoms: amount,
            validatorSrc: validatorFrom,
            validatorDst: this.validator
          }
        ]
      }

      try {
        await this.$store.dispatch(`submitDelegation`, {
          stakingTransactions,
          password
        })

        this.$store.commit(`notify`, {
          title: `Successful ${txTitle}!`,
          body: `You have successfully ${txBody} your ${this.bondingDenom}s`
        })

        this.sending = false
        this.resetForm()
      } catch ({ message }) {
        this.sending = false
        this.submissionError = `Error submitting delegation: ${message}`

        setTimeout(() => {
          this.submissionError = null
        }, 5000)
      }
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
