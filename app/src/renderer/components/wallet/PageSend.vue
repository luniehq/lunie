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
        tm-field-group
          field#send-address(
            type='text'
            v-model='fields.address'
            placeholder='Address')
        form-msg(name='Address' type='required' v-if='!$v.fields.address.required')
        form-msg(name='Address' type='bech32' :body="bech32error" v-else-if='!$v.fields.address.bech32Validate')

      form-group(:error='$v.fields.amount.$error'
        field-id='send-amount' field-label='Amount')
        tm-field-group
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
import b32 from "scripts/b32"
import { required, between } from "vuelidate/lib/validators"
import { mapActions, mapGetters } from "vuex"
import { TmBtn, TmFieldGroup } from "@tendermint/ui"
import Field from "@nylira/vue-field"
import FieldAddon from "common/NiFieldAddon"
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
    TmFieldGroup,
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
    bech32error: null,
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
        let type = "send"
        // TODO reenable when we have IBC
        // if (this.lastHeader.chain_id !== zoneId) {
        //   type = "ibcSend"
        //   address = `${zoneId}/${address}`
        // } else {
        //   type = "send"
        // }
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
          bech32Validate: this.bech32Validate
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
    // TODO ignored while we don't have IBC
    // // if the zoneId gets added at a later time
    // "wallet.zoneIds": () => {
    //   this.fields.zoneId = this.wallet.zoneIds[0]
    // }
  }
}
</script>
