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
  >
    <TmFormGroup
      :error="$v.denom.$dirty && $v.denom.$invalid"
      class="action-modal-form-group"
      field-id="send-denomination"
      field-label="Denomination"
    >
      <TmField
        id="send-denomination"
        :value="viewDenom($v.denom.$model)"
        type="text"
        readonly
      />
      <TmFormMsg
        v-if="$v.denom.$error && !$v.denom.required"
        name="Denomination"
        type="required"
      />
    </TmFormGroup>
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
      <span class="input-suffix-denom">{{ viewDenom(denom) }}</span>
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
        v-if="balance === 0"
        :msg="`doesn't have any ${viewDenom(denom)}s`"
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
      <p v-if="isMaxAmount()" class="form-message notice max-notice">
        You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees.
      </p>
      <p v-else class="form-message empty"></p>
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
import b32 from "scripts/b32"
import { required, between, decimal, maxLength } from "vuelidate/lib/validators"
import { uatoms, atoms, viewDenom, SMALLEST } from "src/scripts/num"
import { mapState } from "vuex"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmField from "src/components/common/TmField"
import TmFieldGroup from "src/components/common/TmFieldGroup"
import TmBtn from "src/components/common/TmBtn"
import TmFormMsg from "src/components/common/TmFormMsg"
import ActionModal from "./ActionModal"
import transaction from "../utils/transactionTypes"

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
  data: () => ({
    address: ``,
    amount: null,
    denom: ``,
    memo: defaultMemo,
    max_memo_characters: 256,
    editMemo: false
  }),
  computed: {
    ...mapState([`wallet`]),
    balance() {
      const denom = this.wallet.balances.find(b => b.denom === this.denom)
      return (denom && denom.amount) || 0
    },
    transactionData() {
      return {
        type: transaction.SEND,
        toAddress: this.address,
        amounts: [
          {
            amount: uatoms(+this.amount),
            denom: this.denom
          }
        ],
        memo: this.memo
      }
    },
    notifyMessage() {
      return {
        title: `Successful Send`,
        body: `Successfully sent ${+this.amount} ${viewDenom(this.denom)}s to ${
          this.address
        }`
      }
    }
  },
  methods: {
    viewDenom,
    open(denom) {
      this.denom = denom
      this.$refs.actionModal.open()
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
      this.amount = atoms(this.balance)
    },
    isMaxAmount() {
      return parseFloat(this.amount) === parseFloat(atoms(this.balance))
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
        between: between(SMALLEST, atoms(this.balance))
      },
      denom: { required },
      memo: {
        maxLength: maxLength(this.max_memo_characters)
      }
    }
  }
}
</script>
<style scoped>
#edit-memo-btn {
  margin-top: 1.5rem;
}

.form-message.notice {
  margin: 1rem 0 0 0;
}

.form-message.empty {
  margin: 1rem 0 0 0;
  padding: 1.8rem;
}
</style>
