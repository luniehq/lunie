<template>
  <ActionModal
    id="modal-propose"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    title="Proposal"
    submission-error-prefix="Submitting proposal failed"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    :post-submit="postSubmit"
    @close="clear"
  >
    <TmFormGroup
      :error="$v.title.$error && $v.title.$invalid"
      class="action-modal-form-group"
      field-id="title"
      field-label="Title"
    >
      <TmField
        id="title"
        v-model.trim="title"
        v-focus
        type="text"
        placeholder="Proposal title"
      />
      <TmFormMsg
        v-if="$v.title.$error && !$v.title.maxLength"
        :max="$v.title.$params.maxLength.max"
        name="Proposal Title"
        type="maxLength"
      />
      <TmFormMsg
        v-if="$v.title.$error && !$v.title.required"
        name="Proposal Title"
        type="required"
      />
    </TmFormGroup>
    <TmFormGroup
      :error="$v.description.$error && $v.description.$invalid"
      class="action-modal-form-group"
      field-id="description"
      field-label="Description"
    >
      <TmField
        id="description"
        v-model.trim="description"
        type="textarea"
        class="textarea-large"
        placeholder="Write your proposal here..."
      />
      <TmFormMsg
        v-if="$v.description.$error && !$v.description.maxLength"
        :max="$v.description.$params.maxLength.max"
        name="Description"
        type="maxLength"
      />
      <TmFormMsg
        v-if="$v.description.$error && !$v.description.required"
        name="Description"
        type="required"
      />
    </TmFormGroup>
    <TmFormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Deposit"
    >
      <span class="input-suffix">{{ num.viewDenom(denom) }}</span>
      <TmField
        id="amount"
        v-model="amount"
        :value="Number(amount)"
        type="number"
      />
      <TmFormMsg
        v-if="balance === 0"
        :msg="`doesn't have any ${num.viewDenom(denom)}s`"
        name="Wallet"
        type="custom"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Deposit"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Deposit"
        type="numberic"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.between"
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Deposit"
        type="between"
      />
    </TmFormGroup>
  </ActionModal>
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
import isEmpty from "lodash.isempty"
import trim from "lodash.trim"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import ActionModal from "common/ActionModal"

import transaction from "src/components/ActionManager/transactionTypes"

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
    ...mapGetters([`wallet`, `bondDenom`]),
    balance() {
      // TODO: refactor to get the selected coin when multicoin deposit is enabled
      if (!this.wallet.loading && !!this.wallet.balances.length) {
        const balance = this.wallet.balances.find(
          coin => coin.denom === this.denom
        )
        if (balance) return parseFloat(balance.amount)
      }
      return 0
    },
    transactionData() {
      return {
        type: transaction.SUBMIT_PROPOSAL,
        proposalType: this.type,
        title: this.title,
        description: this.description,
        initialDeposits: [
          {
            amount: uatoms(this.amount),
            denom: this.denom
          }
        ]
      }
    },
    notifyMessage() {
      return {
        title: `Successful proposal submission!`,
        body: `You have successfully submitted a new ${this.type.toLowerCase()} proposal`
      }
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
    postSubmit(txData) {
      this.$store.dispatch("postSubmitProposal", txData)
    }
  }
}
</script>
<style>
.textarea-large {
  min-height: 200px;
}
</style>
