<template lang='pug'>
page(title='Send')
  div(slot="menu"): tool-bar
  form-struct(:submit="onSubmit")
    part(title='Denomination Options')
      form-group(:error='$v.fields.denom.$error'
        field-id='send-denomination' field-label='Denomination')
        field#send-denomination(
          type="select"
          v-model="fields.denom"
          :options="denominations"
          placeholder="Select token...")
        form-msg(name='Denomination' type='required' v-if='!$v.fields.denom.required')

    part(title='Transaction Details')
      form-group(:error='$v.fields.zoneId.$error'
        v-if="config.devMode"
        field-id='send-zone-id' field-label='Zone ID')
        field#send-zone-id(
          type="select"
          v-model="fields.zoneId"
          :options="zoneIds"
          placeholder="Select zone...")
        form-msg(name='Zone' type='required' v-if='!$v.fields.zoneId.required')
      form-group(:error='$v.fields.address.$error'
        field-id='send-address' field-label='Send To')
        field-group
          field#send-address(
            type='text'
            v-model='fields.address'
            placeholder='Address')
        form-msg(name='Address' type='required' v-if='!$v.fields.address.required')
        form-msg(name='Address' type='exactLength' length='40'
          v-if='!$v.fields.address.minLength || !$v.fields.address.maxLength')
        form-msg(name='Address' type='alphaNum' v-if='!$v.fields.address.alphaNum')

      form-group(:error='$v.fields.amount.$error'
        field-id='send-amount' field-label='Amount')
        field-group
          field#send-amount(
            type='number'
            v-model='fields.amount'
            placeholder='Amount')
        form-msg(name='Amount' type='required' v-if='!$v.fields.amount.required')
        form-msg(name='Amount' type='between' :min='max ? 1 : 0' :max='max'
          v-if='!$v.fields.amount.between')

    div(slot='footer')
      div
      tm-btn(v-if='sending' value='Sending...' disabled color="primary")
      tm-btn(v-else @click='onSubmit' value="Send Tokens" color="primary")
</template>

<script>
import {
  required,
  between,
  minLength,
  maxLength,
  alphaNum
} from "vuelidate/lib/validators"
import { mapActions, mapGetters } from "vuex"
import { TmBtn } from "@tendermint/ui"
import Field from "@nylira/vue-field"
import FieldAddon from "common/NiFieldAddon"
import FieldGroup from "common/NiFieldGroup"
import FormGroup from "common/NiFormGroup"
import FormMsg from "common/NiFormMsg"
import FormStruct from "common/NiFormStruct"
import Page from "common/NiPage"
import Part from "common/NiPart"
import ToolBar from "common/NiToolBar"
export default {
  components: {
    TmBtn,
    Field,
    FieldAddon,
    FieldGroup,
    FormGroup,
    FormMsg,
    FormStruct,
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(["wallet", "lastHeader", "config"]),
    max() {
      let denom = this.wallet.balances.find(b => b.denom === this.denom)
      return (denom && denom.amount) || 0
    },
    denominations() {
      return this.wallet.balances.map(i => ({
        key: i.denom.toUpperCase(),
        value: i.denom
      }))
    },
    zoneIds() {
      return this.wallet.zoneIds.map(z => ({ key: z, value: z }))
    }
  },
  data: () => ({
    fields: {
      address: "",
      amount: null,
      denom: "",
      zoneId: "cosmos-hub-1"
    },
    sending: false
  }),
  methods: {
    resetForm() {
      this.fields.address = ""
      this.fields.amount = null
      this.sending = false
      this.$v.$reset()
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return

      this.sending = true
      let amount = +this.fields.amount
      let address = this.fields.address
      let denom = this.fields.denom
      let zoneId = this.fields.zoneId
      try {
        // if address has a slash, it is IBC address format
        let type
        if (this.lastHeader.chain_id !== zoneId) {
          type = "ibcSend"
          address = `${zoneId}/${address}`
        } else {
          type = "send"
        }
        await this.sendTx({
          type,
          to: address,
          amount: [{ denom, amount }]
        })
        this.sending = false
        this.$store.commit("notify", {
          title: "Successfully Sent",
          body: `Successfully sent ${amount} ${denom.toUpperCase()} to ${address}`
        })
        // resets send transaction form
        this.resetForm()
        // refreshes user transaction history
        this.$store.dispatch("queryWalletHistory")
      } catch (err) {
        this.sending = false
        this.$store.commit("notifyError", {
          title: "Error Sending",
          body: `An error occurred while trying to send: "${err.message}"`
        })
      }
    },
    ...mapActions(["sendTx"])
  },
  props: ["denom"],
  mounted() {
    if (this.denom) {
      this.fields.denom = this.denom
    }
    this.fields.zoneId = this.wallet.zoneIds[0]
  },
  validations() {
    return {
      fields: {
        address: {
          required,
          minLength: minLength(40),
          maxLength: maxLength(40),
          alphaNum: alphaNum
        },
        amount: {
          required,
          between: between(1, this.max)
        },
        denom: { required },
        zoneId: { required }
      }
    }
  },
  watch: {
    // TODO should not be necessary?
    // if the zoneId gets added at a later time
    "wallet.zoneIds": () => {
      this.fields.zoneId = this.wallet.zoneIds[0]
    }
  }
}
</script>
