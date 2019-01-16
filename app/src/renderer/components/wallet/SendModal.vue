<template>
  <action-modal
    :submission-error="submissionError"
    title="Send"
    @close-action-modal="close"
  >
    <tm-form-group
      :error="$v.fields.denom.$dirty && $v.fields.denom.$invalid"
      field-id="send-denomination"
      field-label="Denomination"
    >
      <tm-field
        id="send-denomination"
        v-model.number="$v.fields.denom.$model"
        type="text"
        readonly
      />
      <tm-form-msg
        v-if="
          $v.fields.denom.$dirty &&
            $v.fields.denom.$invalid &&
            !$v.fields.denom.required
        "
        name="Denomination"
        type="required"
      />
    </tm-form-group>

    <tm-form-group
      :error="$v.fields.address.$dirty && $v.fields.address.$invalid"
      field-id="send-address"
      field-label="Send To"
    >
      <tm-field
        v-focus
        id="send-address"
        v-model.number="$v.fields.address.$model"
        type="text"
        placeholder="Address"
      />
      <tm-form-msg
        v-if="
          $v.fields.address.$dirty &&
            $v.fields.address.$invalid &&
            !$v.fields.address.required
        "
        name="Address"
        type="required"
      />
      <tm-form-msg
        v-else-if="
          fields.address.trim().length > 0 && !$v.fields.address.bech32Validate
        "
        :body="bech32error"
        name="Address"
        type="bech32"
      />
    </tm-form-group>

    <tm-form-group
      :error="$v.fields.amount.$dirty && $v.fields.amount.$invalid"
      field-id="send-amount"
      field-label="Amount"
    >
      <tm-field
        id="send-amount"
        v-model.number="$v.fields.amount.$model"
        type="number"
        placeholder="Amount"
      />
      <tm-form-msg
        v-if="
          $v.fields.amount.$dirty &&
            $v.fields.amount.$invalid &&
            !$v.fields.amount.required
        "
        name="Amount"
        type="required"
      />
      <tm-form-msg
        v-else-if="!$v.fields.amount.between"
        :max="$v.fields.amount.$params.between.max"
        :min="$v.fields.amount.$params.between.min"
        name="Amount"
        type="between"
      />
      <tm-form-msg
        v-else-if="!$v.fields.amount.integer"
        name="Amount"
        type="integer"
      />
    </tm-form-group>

    <tm-form-group
      :error="
        fields.password.length > 0 &&
          ($v.fields.password.$dirty && $v.fields.password.$invalid)
      "
      field-id="password"
      field-label="Password"
    >
      <tm-field
        id="password"
        v-model="$v.fields.password.$model"
        type="password"
        placeholder="Password"
      />
      <tm-form-msg
        v-if="
          $v.fields.password.$dirty &&
            fields.password.length &&
            $v.fields.password.$invalid &&
            !$v.fields.password.required
        "
        name="Password"
        type="required"
      />
    </tm-form-group>

    <div slot="action-modal-footer">
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
        :disabled="$v.fields.$invalid"
        value="Send Tokens"
        color="primary"
        @click.native="validateForm"
      />
    </div>
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
  props: {
    denom: {
      type: String,
      required: true
    }
  },
  data: () => ({
    bech32error: null,
    fields: {
      address: ``,
      amount: ``,
      denom: ``,
      password: ``
    },
    sending: false,
    submissionError: ``
  }),
  computed: {
    ...mapGetters([`wallet`, `connected`]),
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
    close() {
      this.$emit(`update:showSendModal`, false)
    },
    resetForm() {
      this.fields.address = ``
      this.fields.amount = null
      this.fields.password = ``
      this.sending = false
      this.submissionError = ``
      this.$v.$reset()
    },
    validateForm() {
      this.sending = true
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.submitForm()
      } else {
        this.sending = false
      }
    },
    async submitForm() {
      const amount = +this.fields.amount
      const address = this.fields.address
      const denom = this.fields.denom
      const type = `send`

      try {
        await this.sendTx({
          type,
          password: this.fields.password,
          to: address,
          amount: [{ denom, amount: amount.toString() }]
        })

        this.$store.commit(`notify`, {
          title: `Successfully Sent`,
          body: `Successfully sent ${amount} ${denom} to ${address}`
        })

        this.sending = false
        this.resetForm()
      } catch ({ message }) {
        this.sending = false
        this.submissionError = `Send failed: ${message}.`

        setTimeout(() => {
          this.submissionError = null
        }, 5000)
      }
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
          integer,
          between: between(this.max ? 1 : 0, this.max)
        },
        denom: { required },
        password: { required }
      }
    }
  }
}
</script>
