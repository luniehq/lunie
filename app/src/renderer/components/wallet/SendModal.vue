<template>
  <action-modal
    id="send-modal"
    ref="actionModal"
    :submit-fn="submitForm"
    :validate="validateForm"
    title="Send"
    submission-error-prefix="Sending tokens failed"
  >
    <tm-form-group
      :error="$v.denom.$dirty && $v.denom.$invalid"
      class="action-modal-form-group"
      field-id="send-denomination"
      field-label="Denomination"
    >
      <tm-field
        id="send-denomination"
        v-model.number="$v.denom.$model"
        type="text"
        readonly
      />
      <tm-form-msg
        v-if="$v.denom.$error && !$v.denom.required"
        name="Denomination"
        type="required"
      />
    </tm-form-group>

    <tm-form-group
      :error="$v.address.$error && $v.address.$invalid"
      class="action-modal-form-group"
      field-id="send-address"
      field-label="Send To"
    >
      <tm-field
        v-focus
        id="send-address"
        v-model.number="$v.address.$model"
        type="text"
        placeholder="Address"
      />
      <tm-form-msg
        v-if="$v.address.$error && !$v.address.required"
        name="Address"
        type="required"
      />
      <tm-form-msg
        v-else-if="$v.address.$error && !$v.address.bech32Validate"
        :body="bech32error"
        name="Address"
        type="bech32"
      />
    </tm-form-group>
    <tm-form-group
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <tm-field
        id="amount"
        v-model="amount"
        class="tm-field"
        placeholder="Amount"
        type="number"
      />
      <tm-form-msg
        v-if="balance === 0"
        :msg="`doesn't hold any ${denom}s`"
        name="Wallet"
        type="custom"
      />
      <tm-form-msg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
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
import b32 from "scripts/b32"
import { required, between, integer } from "vuelidate/lib/validators"
import { mapActions, mapGetters } from "vuex"
import TmBtn from "common/TmBtn"
import TmFieldGroup from "common/TmFieldGroup"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmPage from "common/TmPage"
import TmPart from "common/TmPart"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import TmBalance from "common/TmBalance"
import FieldAddon from "common/TmFieldAddon"
import ToolBar from "common/ToolBar"
import ActionModal from "common/ActionModal"

export default {
  name: `send-modal`,
  components: {
    TmBalance,
    TmBtn,
    TmField,
    FieldAddon,
    TmFieldGroup,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    TmPage,
    TmPart,
    ToolBar,
    ActionModal
  },
  data: () => ({
    bech32error: null,
    address: ``,
    amount: null,
    denom: ``
  }),
  computed: {
    ...mapGetters([`wallet`]),
    balance() {
      let denom = this.wallet.balances.find(b => b.denom === this.denom)
      return (denom && denom.amount) || 0
    },
    denominations() {
      return this.wallet.balances.map(i => ({
        key: i.denom.toUpperCase(),
        value: i.denom
      }))
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
    async submitForm(submitType, password) {
      const amount = +this.amount
      const address = this.address
      const denom = this.denom
      const type = `send`

      await this.sendTx({
        type,
        submitType,
        password,
        to: address,
        amount: [{ denom, amount: String(amount) }]
      })

      this.$store.commit(`notify`, {
        title: `Successfully Sent`,
        body: `Successfully sent ${amount} ${denom} to ${address}`
      })
    },
    bech32Validate(param) {
      try {
        b32.decode(param)
        this.bech32error = null
      } catch (error) {
        this.bech32error = error.message
      } finally {
        return !this.bech32error
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
        required,
        integer,
        between: between(this.balance ? 1 : 0, this.balance)
      },
      denom: { required }
    }
  }
}
</script>
