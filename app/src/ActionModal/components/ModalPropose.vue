<template>
  <ActionModal
    id="modal-propose"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    title="Create Proposal"
    submission-error-prefix="Submitting proposal failed"
    :transaction-type="messageType.SUBMIT_PROPOSAL"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="proposal"
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
        placeholder="0"
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
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${stakingDenom}s to proceed.`"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.min"
        :min="smallestAmount"
        name="Amount"
        type="min"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.maxDecimals"
        name="Amount"
        type="maxDecimals"
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
  decimal,
} from "vuelidate/lib/validators"
import { SMALLEST } from "scripts/num"
import isEmpty from "lodash.isempty"
import trim from "lodash.trim"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import ActionModal from "./ActionModal"
import { messageType } from "../../components/transactions/messageTypes"

const isValid = (type) =>
  type === `Text` || type === `ParameterChange` || type === `SoftwareUpgrade`

const notBlank = (text) => !isEmpty(trim(text))

export default {
  name: `modal-propose`,
  components: {
    ActionModal,
    TmField,
    TmFormGroup,
    TmFormMsg,
  },
  props: {
    denom: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    titleMaxLength: 64,
    descriptionMaxLength: 10000,
    title: ``,
    description: ``,
    type: `Text`,
    amount: null,
    balance: {
      amount: null,
      denom: ``,
    },
    messageType,
    smallestAmount: SMALLEST,
  }),
  computed: {
    ...mapGetters([`network`, `networks`, `stakingDenom`]),
    ...mapGetters({ userAddress: `address` }),
    transactionData() {
      if (
        isNaN(this.amount) ||
        !this.type ||
        !this.title ||
        !this.description ||
        !this.denom
      ) {
        return {}
      }
      return {
        type: messageType.SUBMIT_PROPOSAL,
        proposalTitle: this.title,
        proposalDescription: this.description,
        initialDeposit: {
          amount: this.amount,
          denom: this.denom,
        },
        proposer: {
          name: "",
          address: this.userAddress,
        },
      }
    },
    notifyMessage() {
      return {
        title: `Successful proposal submission!`,
        body: `You have successfully submitted a new ${this.type.toLowerCase()} proposal`,
      }
    },
  },
  validations() {
    return {
      title: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(this.titleMaxLength),
        notBlank,
      },
      description: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(this.descriptionMaxLength),
        notBlank,
      },
      type: {
        isValid,
      },
      amount: {
        required: (x) => !!x && x !== `0`,
        decimal,
        max: (x) => Number(x) <= this.balance.amount,
        min: (x) => Number(x) >= SMALLEST,
        maxDecimals: (x) => {
          if (x) {
            return x.toString().split(".").length > 1
              ? x.toString().split(".")[1].length <= 6
              : true
          } else {
            return false
          }
        },
      },
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
    },
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
      /* istanbul ignore next */
      skip() {
        return (
          !this.userAddress ||
          !this.$refs.actionModal ||
          !this.$refs.actionModal.show
        )
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.userAddress,
          denom: this.denom,
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.balance || { amount: 0 }
      },
    },
  },
}
</script>
<style>
.textarea-large {
  min-height: 200px;
}
</style>
