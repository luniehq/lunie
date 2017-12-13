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
        form-msg(name='Amount' type='between' min='1' max='1000000'
          v-if='!$v.fields.amount.between')

    div(slot='footer')
      div
      btn(v-if='sending' value='Sending...' disabled)
      btn(v-else @click='onSubmit' value="Send Tokens")
</template>

<script>
import { required, between, minLength, maxLength, alphaNum } from 'vuelidate/lib/validators'
import { mapActions, mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldAddon from 'common/NiFieldAddon'
import FieldGroup from 'common/NiFieldGroup'
import FormGroup from 'common/NiFormGroup'
import FormMsg from '@nylira/vue-form-msg'
import FormStruct from 'common/NiFormStruct'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import ToolBar from 'common/NiToolBar'
export default {
  components: {
    Btn,
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
    ...mapGetters(['wallet']),
    denominations () {
      return this.wallet.balances.map(i =>
        ({ key: i.denom.toUpperCase(), value: i.denom }))
    }
  },
  data: () => ({
    fields: {
      address: '',
      amount: null,
      denom: ''
    },
    sending: false
  }),
  methods: {
    resetForm () {
      this.fields.address = ''
      this.fields.amount = null
      this.sending = false
      this.$v.$reset()
    },
    async onSubmit () {
      this.$v.$touch()
      if (this.$v.$error) return

      this.sending = true
      let amount = +this.fields.amount
      let address = this.fields.address
      let denom = this.fields.denom
      await this.walletSend({
        fees: { denom, amount: 0 },
        to: address,
        amount: [{ denom, amount }],
        cb: (err) => {
          this.sending = false
          if (err) {
            this.$store.commit('notifyError', {
              title: 'Error Sending',
              body: `An error occurred while trying to send: "${err.message}"`
            })
            return
          }
          this.$store.commit('notify', {
            title: 'Successfully Sent',
            body: `Successfully sent ${amount} ${denom.toUpperCase()} to ${address}`
          })
        }
      })
    },
    ...mapActions(['walletSend'])
  },
  mounted () {
    if (this.denominations.length === 1) {
      this.fields.denom = this.denominations[0].value
    }
  },
  validations: () => ({
    fields: {
      address: {
        required,
        minLength: minLength(39),
        maxLength: maxLength(42),
        alphaNum: alphaNum
      },
      amount: {
        required,
        between: between(1, 1000000)
      },
      denom: {
        required
      }
    }
  })
}
</script>
