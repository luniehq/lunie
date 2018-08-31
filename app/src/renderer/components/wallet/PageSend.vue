<template lang='pug'>
tm-page(title='Send')
  div(slot="menu"): tool-bar
  tm-form-struct(:submit="onSubmit")
    tm-part(title='Denomination Options')
      tm-form-group(:error='$v.fields.denom.$error'
        field-id='send-denomination' field-label='Denomination')
        tm-field#send-denomination(
          type="select"
          v-model="fields.denom"
          :options="denominations"
          placeholder="Select token...")
        tm-form-msg(name='Denomination' type='required' v-if='!$v.fields.denom.required')

    tm-part(title='Transaction Details')
      tm-form-group(:error='$v.fields.zoneId.$error'
        v-if="config.devMode"
        field-id='send-zone-id' field-label='Zone ID')
        tm-field#send-zone-id(
          type="select"
          v-model="fields.zoneId"
          :options="zoneIds"
          placeholder="Select zone...")
        tm-form-msg(name='Zone' type='required' v-if='!$v.fields.zoneId.required')
      tm-form-group(:error='$v.fields.address.$error'
        field-id='send-address' field-label='Send To')
        tm-field-group
          tm-field#send-address(
            type='text'
            v-model='fields.address'
            placeholder='Address')
        tm-form-msg(name='Address' type='required' v-if='!$v.fields.address.required')
        tm-form-msg(name='Address' type='bech32' :body="bech32error" v-else-if='!$v.fields.address.bech32Validate')

      tm-form-group(:error='$v.fields.amount.$error'
        field-id='send-amount' field-label='Amount')
        tm-field-group
          tm-field#send-amount(
            type='number'
            :max="max"
            :min='max ? 1 : 0'
            v-model='fields.amount'
            placeholder='Amount')
        tm-form-msg(name='Amount' type='required' v-if='!$v.fields.amount.required')
        tm-form-msg(name='Amount' type='between' :min='max ? 1 : 0' :max='max'
          v-if='!$v.fields.amount.between')

      p(v-if='mockedConnector')
        span Try sending to the address "
        strong(style="font-weight: bold") cosmosaccaddr1p6zajjw6xged056andyhn62lm7axwzyspkzjq0
        span ", it's a friendly bot which will send the money back to you!
      br(v-if='mockedConnector')

    div(slot='footer')
      tm-btn(v-if='sending' value='Sending...' disabled color="primary")
      tm-btn(v-else-if='!connected' value='Connecting...' disabled color="primary")
      tm-btn(v-else id="send-btn" @click='onSubmit' value="Send Tokens" color="primary")

  tm-modal-send-confirmation(v-if="confirmationPending" @approved="onApproved" @canceled="onCancel" :amount="fields.amount" :recipient="fields.address" :denom="fields.denom")
</template>

<script>
import b32 from "scripts/b32"
import { required, between } from "vuelidate/lib/validators"
import { mapActions, mapGetters } from "vuex"
import {
  TmBtn,
  TmFieldGroup,
  TmFormGroup,
  TmFormStruct,
  TmPage,
  TmPart,
  TmField,
  TmFormMsg
} from "@tendermint/ui"

import FieldAddon from "common/TmFieldAddon"
import ToolBar from "common/TmToolBar"
import TmModalSendConfirmation from "wallet/TmModalSendConfirmation"
export default {
  components: {
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
  computed: {
    ...mapGetters([
      "wallet",
      "lastHeader",
      "config",
      "mockedConnector",
      "connected"
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
    confirmationPending: false,
    sending: false
  }),
  methods: {
    resetForm() {
      this.fields.address = ""
      this.fields.amount = null
      this.sending = false
      this.$v.$reset()
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
          amount: [{ denom, amount: amount.toString() }]
        })
        this.sending = false
        this.$store.commit("notify", {
          title: "Successfully Sent",
          body: `Successfully sent ${amount} ${denom} to ${address}`
        })
        // resets send transaction form
        this.resetForm()
        // refreshes user transaction history
        this.$store.dispatch("getAllTxs")
        // TODO: is this ^^ necessary since it's
        // queried on transaction page mounted anyway?
      } catch (err) {
        this.sending = false
        this.$store.commit("notifyError", {
          title: "Error Sending",
          body: `An error occurred while trying to send: "${err.message}"`
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

<style lang="stylus">
@require '~variables'

.tm-form-footer
  max-width width-main-max
  display flex
  justify-content flex-end
</style>
