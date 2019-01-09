<template>
  <tm-page data-title="Send">
    <template slot="menu-body">
      <tm-balance />
      <tool-bar />
    </template>
    <tm-form-struct :submit="onSubmit">
      <tm-part title="Denomination Options">
        <tm-form-group
          :error="$v.fields.denom.$error"
          field-id="send-denomination"
          field-label="Denomination"
        >
          <tm-field
            id="send-denomination"
            v-model="fields.denom"
            :options="denominations"
            type="select"
            placeholder="Select token..."
          />
          <tm-form-msg
            v-if="!$v.fields.denom.required"
            name="Denomination"
            type="required"
          />
        </tm-form-group>
      </tm-part>
      <tm-part title="Transaction Details">
        <tm-form-group
          :error="$v.fields.address.$error && $v.fields.address.$invalid"
          field-id="send-address"
          field-label="Send To"
        >
          <tm-field-group>
            <tm-field
              id="send-address"
              v-model.trim="fields.address"
              type="text"
              placeholder="Address"
            />
          </tm-field-group>
          <tm-form-msg
            v-if="$v.fields.address.$error && !$v.fields.address.required"
            name="Address"
            type="required"
          />
          <tm-form-msg
            v-else-if="
              fields.address.trim().length > 0 &&
                !$v.fields.address.bech32Validate
            "
            name="Address"
            type="bech32"
          />
        </tm-form-group>
        <tm-form-group
          :error="$v.fields.amount.$error"
          field-id="send-amount"
          field-label="Amount"
        >
          <tm-field-group>
            <tm-field
              id="send-amount"
              :max="max"
              :min="max ? 1 : 0"
              v-model="fields.amount"
              type="number"
              placeholder="Amount"
            />
          </tm-field-group>
          <tm-form-msg
            v-if="!$v.fields.amount.required"
            name="Amount"
            type="required"
          />
          <tm-form-msg
            v-if="!$v.fields.amount.between && fields.amount > 0"
            :max="$v.fields.amount.$params.between.max"
            :min="$v.fields.amount.$params.between.min"
            name="Amount"
            type="between"
          />
        </tm-form-group>
        <p v-if="mockedConnector">
          <span>Try sending to the address "</span
          ><strong style="font-weight: bold"
            >cosmos1p6zajjw6xged056andyhn62lm7axwzyspkzjq0</strong
          ><span
            >", it's a friendly bot which will send the money back to you!</span
          >
        </p>
        <br v-if="mockedConnector" />
        <hr />
      </tm-part>
      <tm-part>
        <tm-form-group
          :error="$v.fields.password.$error"
          field-id="password"
          field-label="Account password"
        >
          <tm-field
            id="password"
            v-model="fields.password"
            :type="showPassword ? `text` : `password`"
            placeholder="password..."
          />
          <tm-form-msg
            v-if="!$v.fields.password.required"
            name="Password"
            type="required"
          />
          <input
            id="showPasswordCheckbox"
            v-model="showPassword"
            type="checkbox"
            @input="togglePassword"
          />
          <label for="showPasswordCheckbox">Show password</label>
        </tm-form-group>
      </tm-part>
      <div slot="footer">
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
          id="send-btn"
          value="Send Tokens"
          color="primary"
          @click="onSubmit"
        />
      </div>
    </tm-form-struct>
    <tm-modal-send-confirmation
      v-if="confirmationPending"
      :amount="fields.amount"
      :recipient="fields.address"
      :denom="fields.denom"
      :connected="connected"
      @approved="onApproved()"
      @canceled="onCancel()"
    />
  </tm-page>
</template>

<script>
import b32 from "scripts/b32"
import { required, between } from "vuelidate/lib/validators"
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
import TmModalSendConfirmation from "wallet/TmModalSendConfirmation"

const isInteger = amount => Number.isInteger(amount)

export default {
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
    TmModalSendConfirmation
  },
  props: {
    denom: {
      type: String,
      default: ``
    }
  },
  data: () => ({
    bech32error: null,
    fields: {
      address: ``,
      amount: 0,
      denom: ``,
      password: ``
    },
    confirmationPending: false,
    sending: false,
    showPassword: false
  }),
  computed: {
    ...mapGetters([
      `wallet`,
      `lastHeader`,
      `config`,
      `mockedConnector`,
      `connected`
    ]),
    max() {
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
      this.fields.denom = this.denom
    }
  },
  methods: {
    resetForm() {
      this.fields.address = ``
      this.fields.amount = null
      this.sending = false
      this.$v.$reset()
    },
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return

      this.confirmationPending = true
    },
    async onApproved() {
      this.confirmationPending = false
      this.sending = true
      let amount = +this.fields.amount
      let address = this.fields.address
      let denom = this.fields.denom
      try {
        let type = `send`
        await this.sendTx({
          type,
          password: this.fields.password,
          to: address,
          amount: [{ denom, amount: amount.toString() }]
        })
        this.sending = false
        this.$store.commit(`notify`, {
          title: `Successfully Sent`,
          body: `Successfully sent ${amount} ${denom} to ${address}`
        })
        // resets send transaction form
        this.resetForm()
      } catch (error) {
        this.sending = false
        this.$store.commit(`notifyError`, {
          title: `Error Sending transaction`,
          body: error.message
        })
      }
    },
    onCancel() {
      this.confirmationPending = false
    },
    bech32Validate(param) {
      try {
        b32.decode(param)
        this.bech32error = null
        return true
      } catch (error) {
        this.bech32error = error.message
        return false
      }
    },
    ...mapActions([`sendTx`])
  },
  validations() {
    return {
      fields: {
        address: {
          required,
          bech32Validate: this.bech32Validate
        },
        amount: {
          required,
          isInteger,
          between: between(this.max ? 1 : 0, this.max)
        },
        denom: { required },
        password: { required }
      }
    }
  }
}
</script>

<style>
.tm-form-footer {
  max-width: width-main-max;
  display: flex;
  justify-content: flex-end;
}
</style>
