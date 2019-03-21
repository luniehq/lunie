<template>
  <action-modal
    id="modal-propose"
    ref="actionModal"
    :submit-fn="submitForm"
    :validate="validateForm"
    title="Proposal"
    submission-error-prefix="Submitting proposal failed"
    @close="clear"
  >
    <tm-form-group
      :error="$v.title.$error && $v.title.$invalid"
      class="action-modal-form-group"
      field-id="title"
      field-label="Title"
    >
      <tm-field
        id="title"
        v-model.trim="title"
        v-focus
        type="text"
        placeholder="Proposal title"
      />
      <tm-form-msg
        v-if="$v.title.$error && !$v.title.maxLength"
        :max="$v.title.$params.maxLength.max"
        name="Proposal Title"
        type="maxLength"
      />
      <tm-form-msg
        v-if="$v.title.$error && !$v.title.required"
        name="Proposal Title"
        type="required"
      />
    </tm-form-group>
    <tm-form-group
      :error="$v.description.$error && $v.description.$invalid"
      class="action-modal-form-group"
      field-id="description"
      field-label="Description"
    >
      <tm-field
        id="description"
        v-model.trim="description"
        type="textarea"
        class="textarea-large"
        placeholder="Write your proposal here..."
      />
      <tm-form-msg
        v-if="$v.description.$error && !$v.description.maxLength"
        :max="$v.description.$params.maxLength.max"
        name="Description"
        type="maxLength"
      />
      <tm-form-msg
        v-if="$v.description.$error && !$v.description.required"
        name="Description"
        type="required"
      />
    </tm-form-group>
    <tm-form-group
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ num.viewDenom(denom) }}</span>
      <tm-field
        id="amount"
        v-model="amount"
        type="number"
      />
      <tm-form-msg
        v-if="balance === 0"
        :msg="`doesn't have any ${num.viewDenom(denom)}s`"
        name="Wallet"
        type="custom"
      />
      <tm-form-msg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <tm-form-msg
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numberic"
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
import {
  minLength,
  maxLength,
  required,
  between,
  decimal
} from "vuelidate/lib/validators"
import num, { uatoms, atoms, SMALLEST } from "../../scripts/num.js"
import { isEmpty, trim } from "lodash"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import ActionModal from "common/ActionModal"

const isValid = type =>
  type === `Text` || type === `ParameterChange` || type === `SoftwareUpgrade`

const notBlank = text => !isEmpty(trim(text))

export default {
  name: `modal-propose`,
  components: {
    ActionModal,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  props: {
    denom: {
      type: String,
      required: true
    }
  },
  data: () => ({
    titleMaxLength: 64,
    descriptionMaxLength: 200,
    title: ``,
    description: ``,
    type: `Text`,
    amount: 0,
    num
  }),
  computed: {
    ...mapGetters([`wallet`]),
    balance() {
      // TODO: refactor to get the selected coin when multicoin deposit is enabled
      if (!this.wallet.loading && !!this.wallet.balances.length) {
        const balance = this.wallet.balances.find(
          coin => coin.denom === this.denom
        )
        if (balance) return parseFloat(balance.amount)
      }
      return 0
    }
  },
  validations() {
    return {
      title: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(this.titleMaxLength),
        notBlank
      },
      description: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(this.descriptionMaxLength),
        notBlank
      },
      type: {
        isValid
      },
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

      this.title = ``
      this.description = ``
      this.amount = 0
    },
    async submitForm(submitType, password) {
      await this.$store.dispatch(`submitProposal`, {
        title: this.title,
        description: this.description,
        type: this.type,
        submitType,
        initial_deposit: [
          {
            denom: this.denom,
            amount: String(uatoms(this.amount))
          }
        ],
        password
      })
      this.$store.commit(`notify`, {
        title: `Successful proposal submission!`,
        body: `You have successfully submitted a new ${this.type.toLowerCase()} proposal`
      })
    }
  }
}
</script>
<style>
.textarea-large {
  min-height: 200px;
}
</style>
