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
    @close="clear"
    @txIncluded="onSuccess"
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
        @keyup.enter.native="refocusOn"
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
        ref="description"
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
      <span class="input-suffix">{{ denom }}</span>
      <TmField
        id="amount"
        v-model="amount"
        :value="Number(amount)"
        type="number"
        @keyup.enter.native="enterPressed"
      />
      <TmFormMsg
        v-if="balance.amount === 0"
        :msg="`doesn't have any ${denom}s`"
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
import gql from "graphql-tag"
import {
  minLength,
  maxLength,
  required,
  between,
  decimal
} from "vuelidate/lib/validators"
import { uatoms, SMALLEST } from "scripts/num"
import isEmpty from "lodash.isempty"
import trim from "lodash.trim"
const TmField = () => import("common/TmField")
const TmFormGroup = () => import("common/TmFormGroup")
const TmFormMsg = () => import("common/TmFormMsg")
import ActionModal from "./ActionModal"
import { toMicroDenom } from "src/scripts/common"

import transaction from "../utils/transactionTypes"

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
    balance: {
      amount: 0,
      denom: ``
    }
  }),
  computed: {
    ...mapGetters([`network`]),
    ...mapGetters({ userAddress: `address` }),
    transactionData() {
      return {
        type: transaction.SUBMIT_PROPOSAL,
        proposalType: this.type,
        title: this.title,
        description: this.description,
        initialDeposits: [
          {
            amount: uatoms(this.amount),
            denom: toMicroDenom(this.denom)
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
        between: between(SMALLEST, this.balance.amount)
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
    refocusOn() {
      this.$refs.description.$el.focus()
    },
    enterPressed() {
      this.$refs.actionModal.validateChangeStep()
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    }
  },
  apollo: {
    balance: {
      query: gql`
        query BalanceModalPropos(
          $networkId: String!
          $address: String!
          $denom: String!
        ) {
          balance(networkId: $networkId, address: $address, denom: $denom) {
            amount
            denom
          }
        }
      `,
      skip() {
        return !this.userAddress
      },
      variables() {
        return {
          networkId: this.network,
          address: this.userAddress,
          denom: this.denom
        }
      }
    }
  }
}
</script>
<style>
.textarea-large {
  min-height: 200px;
}
</style>
