<template>
  <ActionModal
    id="send-modal"
    ref="actionModal"
    :submit-fn="submitForm"
    :simulate-fn="simulateForm"
    :validate="validateForm"
    :amount="amount"
    title="Send"
    submission-error-prefix="Sending tokens failed"
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
        :value="num.viewDenom($v.denom.$model)"
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
      <TmField
        id="amount"
        v-model="amount"
        class="tm-field"
        placeholder="Amount"
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
    </TmFormGroup>
    <TmBtn
      v-if="editMemo === false"
      id="edit-memo-btn"
      value="Edit Memo"
      :to="''"
      type="link"
      size="sm"
      @click.native="editMemo = true"
    />
    <TmFormGroup
      v-if="editMemo"
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
        placeholder="Add a description..."
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
import num, { uatoms, atoms, SMALLEST } from "../../scripts/num.js"
import { mapActions, mapGetters } from "vuex"
import TmFormGroup from "common/TmFormGroup"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import TmBtn from "common/TmBtn"
import ActionModal from "common/ActionModal"

export default {
  name: `send-modal`,
  components: {
    TmField,
    TmFormGroup,
    TmFormMsg,
    ActionModal,
    TmBtn
  },
  data: () => ({
    address: ``,
    amount: null,
    denom: ``,
    num,
    memo: "(Sent via Lunie)",
    max_memo_characters: 256,
    editMemo: false
  }),
  computed: {
    ...mapGetters([`wallet`, `session`]),
    balance() {
      const denom = this.wallet.balances.find(b => b.denom === this.denom)
      return (denom && denom.amount) || 0
    }
  },
  mounted() {
    if (this.denom) {
      this.denom = this.denom
    }
  },
  methods: {
    ...mapActions([`sendTx`]),
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

      this.address = ``
      this.amount = 0
      this.editMemo = false
      this.memo = "(Sent via Lunie)"
    },
    async simulateForm() {
      const amount = +this.amount
      const address = this.address
      const denom = this.denom
      const type = `MsgSend`

      return await this.$store.dispatch(`simulateTx`, {
        type,
        txArguments: {
          toAddress: address,
          amounts: [{ denom, amount: String(uatoms(amount)) }]
        },
        memo: this.memo
      })
    },
    async submitForm(gasEstimate, gasPrice, password, submitType) {
      const amount = +this.amount
      const address = this.address
      const denom = this.denom
      const type = `MsgSend`

      await this.sendTx({
        type,
        txArguments: {
          toAddress: address,
          amounts: [{ denom, amount: String(uatoms(amount)) }]
        },
        gas: String(gasEstimate),
        gas_prices: [
          {
            amount: String(uatoms(gasPrice)),
            denom: this.denom // TODO: should always match staking denom
          }
        ],
        submitType,
        password,
        memo: this.memo
      })

      const fees = gasEstimate * gasPrice
      // if we send to ourselves, we don't loose tokens
      let liquidityChangeAmount = address === this.session.address ? 0 : amount
      this.$store.commit("updateWalletBalance", {
        amount: this.balance - uatoms(liquidityChangeAmount + fees),
        denom: this.denom
      })

      this.$store.commit(`notify`, {
        title: `Successful Send`,
        body: `Successfully sent ${amount} ${num.viewDenom(
          denom
        )}s to ${address}`
      })
    },
    bech32Validate(param) {
      try {
        b32.decode(param)
        return true
      } catch (error) {
        return false
      }
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
  display: inline-block;
  height: 58px;
  padding: 12px 0;
  box-sizing: content-box;
  font-size: var(--sm);
}
</style>
