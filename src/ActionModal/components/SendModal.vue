<template>
  <ActionModal
    id="send-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    title="Send"
    submission-error-prefix="Sending tokens failed"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup
      :error="$v.address.$error && $v.address.$invalid"
      class="action-modal-form-group"
      field-id="send-address"
      field-label="Send To"
    >
      <TmField
        id="send-address"
        v-model.number="$v.address.$model"
        v-focus
        type="text"
        placeholder="Address"
        @keyup.enter.native="refocusOnAmount"
      />
      <TmFormMsg
        v-if="$v.address.$error && !$v.address.required"
        name="Address"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.address.$error && !$v.address.bech32Validate"
        name="Address"
        type="bech32"
      />
    </TmFormGroup>
    <TmFormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix max-button">{{ denom }}</span>
      <TmFieldGroup>
        <TmField
          id="amount"
          ref="amount"
          v-model="amount"
          class="tm-field-addon"
          placeholder="Amount"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <TmBtn
          type="button"
          class="secondary addon-max"
          value="Set Max"
          @click.native="setMaxAmount()"
        />
      </TmFieldGroup>
      <TmFormMsg
        v-if="balance.amount === 0"
        :msg="`doesn't have any ${denom}s`"
        name="Wallet"
        type="custom"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.between"
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
      />
      <TmFormMsg
        v-else-if="isMaxAmount()"
        msg="You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
        type="custom"
        class="tm-form-msg--desc max-message"
      />
    </TmFormGroup>
    <TmBtn
      v-if="editMemo === false"
      id="edit-memo-btn"
      value="Edit Memo"
      type="secondary"
      @click.native="showMemo()"
    />
    <TmFormGroup
      v-else
      id="memo"
      :error="$v.memo.$error && $v.memo.$invalid"
      class="action-modal-group"
      field-id="memo"
      field-label="Memo"
    >
      <TmField
        id="memo"
        v-model="memo"
        type="text"
        placeholder="Let everyone know how much you love Lunie"
        @keyup.enter.native="enterPressed"
      />
      <TmFormMsg
        v-if="$v.memo.$error && !$v.memo.maxLength"
        name="Memo"
        type="maxLength"
        :max="max_memo_characters"
      />
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import gql from "graphql-tag"
import b32 from "scripts/b32"
import { required, between, decimal, maxLength } from "vuelidate/lib/validators"
import { uatoms, SMALLEST } from "src/scripts/num"
import { mapGetters } from "vuex"
const TmFormGroup = () => import("src/components/common/TmFormGroup")
const TmField = () => import("src/components/common/TmField")
const TmFieldGroup = () => import("src/components/common/TmFieldGroup")
const TmBtn = () => import("src/components/common/TmBtn")
const TmFormMsg = () => import("src/components/common/TmFormMsg")
const ActionModal = () => import("./ActionModal")
import transaction from "../utils/transactionTypes"
import { toMicroDenom } from "src/scripts/common"

const defaultMemo = "(Sent via Lunie)"

export default {
  name: `send-modal`,
  components: {
    TmField,
    TmFieldGroup,
    TmFormGroup,
    TmFormMsg,
    ActionModal,
    TmBtn
  },
  props: {
    denom: {
      type: String,
      required: true
    }
  },
  data: () => ({
    address: ``,
    amount: null,
    memo: defaultMemo,
    max_memo_characters: 256,
    editMemo: false,
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
        type: transaction.SEND,
        toAddress: this.address,
        amounts: [
          {
            amount: uatoms(+this.amount),
            denom: toMicroDenom(this.denom)
          }
        ],
        memo: this.memo
      }
    },
    notifyMessage() {
      return {
        title: `Successful Send`,
        body: `Successfully sent ${+this.amount} ${this.denom}s to ${
          this.address
        }`
      }
    }
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
    validateForm() {
      this.$v.$touch()

      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.address = undefined
      this.amount = undefined
      this.editMemo = false
      this.memo = defaultMemo
      this.sending = false
    },
    setMaxAmount() {
      this.amount = this.balance.amount
    },
    isMaxAmount() {
      if (this.balance.amount === 0) {
        return false
      } else {
        return parseFloat(this.amount) === parseFloat(this.balance.amount)
      }
    },
    bech32Validate(param) {
      try {
        b32.decode(param)
        return true
      } catch (error) {
        return false
      }
    },
    enterPressed() {
      this.$refs.actionModal.validateChangeStep()
    },
    refocusOnAmount() {
      this.$refs.amount.$el.focus()
    },
    showMemo() {
      this.memo = ``
      this.editMemo = true
    }
  },
  validations() {
    return {
      address: {
        required,
        bech32Validate: this.bech32Validate
      },
      amount: {
        required: x => !!x && x !== `0`,
        decimal,
        between: between(SMALLEST, this.balance.amount)
      },
      denom: { required },
      memo: {
        maxLength: maxLength(this.max_memo_characters)
      }
    }
  },
  apollo: {
    balance: {
      query: gql`
        query BalanceSendModal(
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
<style scoped>
#edit-memo-btn {
  margin-top: 2.4rem;
}
</style>
