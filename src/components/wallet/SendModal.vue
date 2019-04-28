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
    <TmFormGroup
      :error="$v.memo.$error && $v.memo.$invalid"
      class="action-modal-group"
      field-id="memo"
      field-label="Memo"
    >
      <span class="input-suffix">
        {{ (memo ? " - " : "") + "(Sent via Lunie)" }}
      </span>
      <tm-field
        id="memo"
        v-model="memo"
        type="text"
        placeholder="Add a description..."
      />
      <tm-form-msg
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
import ActionModal from "common/ActionModal"

export default {
  name: `send-modal`,
  components: {
    TmField,
    TmFormGroup,
    TmFormMsg,
    ActionModal
  },
  data: () => ({
    address: ``,
    amount: null,
    denom: ``,
    num,
    memo: null,
    max_memo_characters: 256 - ` + (Sent via Lunie)`.length
  }),
  computed: {
    ...mapGetters([`wallet`]),
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
    },
    async simulateForm() {
      const amount = +this.amount
      const address = this.address
      const denom = this.denom
      const type = `send`

      return await this.$store.dispatch(`simulateTx`, {
        type,
        to: address,
        amount: [{ denom, amount: String(uatoms(amount)) }],
        memo: this.memo
      })
    },
    async submitForm(gasEstimate, gasPrice, password, submitType) {
      const amount = +this.amount
      const address = this.address
      const denom = this.denom
      const type = `send`

      await this.sendTx({
        type,
        gas: String(gasEstimate),
        gas_prices: [
          {
            amount: String(uatoms(gasPrice)),
            denom: this.denom // TODO: should always match staking denom
          }
        ],
        submitType,
        password,
        to: address,
        amount: [{ denom, amount: String(uatoms(amount)) }],
        memo: this.memo
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
        maxLength: maxLength(
          this.max_memo_characters - ` + (Sent via Lunie)`.length
        )
      }
    }
  }
}
</script>
