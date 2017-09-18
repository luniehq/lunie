<template lang='pug'>
page(title='Send Coins')
  form-struct(:submit='verifySend')
    form-group(:error='$v.fields.denom.$error'
      field-id='send-denomination' field-label='Denomination')
      field-group#send-denomination.denoms
        btn.denom(
          v-for='balance in wallet.balances'
          @click.native='setDenom(balance.denom, $event)'
          :value="balance.denom.toUpperCase()")
        btn.denom(v-if="wallet.balances.length == 0" value="N/A" disabled)

        // field#send-denomination(
          type="select"
          v-model="fields.denom"
          @input="$v.fields.denom.$touch()"
          placeholder="Denomination"
          required)
      form-msg(name='Denomination', type='required', v-if='!$v.fields.denom.required')

    form-group(:error='$v.fields.address.$error'
      field-id='send-address' field-label='Pay To')
      field-group
        field#send-address(type='text', v-model='fields.address', @input='$v.fields.address.$touch()', placeholder='Address', required='')
      form-msg(name='Address', type='required', v-if='!$v.fields.address.required')
      form-msg(name='Address', type='exactLength', length='40', v-if='!$v.fields.address.minLength || !$v.fields.address.maxLength')
      form-msg(name='Address', type='alphaNum', v-if='!$v.fields.address.alphaNum')

    form-group(:error='$v.fields.amount.$error'
      field-id='send-amount' field-label='Amount')
      field-group
        field#send-amount(type='number', v-model='fields.amount', @input='$v.fields.amount.$touch()', placeholder='Amount', required='')
        field-addon Coins
        btn(value='Max')
      form-msg(name='Amount', type='required', v-if='!$v.fields.amount.required')
      form-msg(name='Amount', type='between', min='1', max='1000000', v-if='!$v.fields.amount.between')

    div(slot='footer')
      // btn(value='Reset', @click.native='resetForm')
      div
      btn(v-if='sending', value='Sending...' disabled)
      btn(v-else='', type='submit', value='Send Now')
</template>

<script>
import { required, between, minLength, maxLength, alphaNum } from 'vuelidate/lib/validators'
import { mapActions, mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldAddon from '../common/NiFieldAddon'
import FieldGroup from '../common/NiFieldGroup'
import FormGroup from '../common/NiFormGroup'
import FormMsg from '@nylira/vue-form-msg'
import FormStruct from '../common/NiFormStruct'
import Page from '../common/NiPage'
import ToolBar from '../common/NiToolBar'
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
    ToolBar
  },
  computed: {
    ...mapGetters(['wallet'])
  },
  methods: {
    setDenom (denom, $event) {
      let denomEls = document.querySelectorAll('.denoms .denom')
      // console.log('denomEls', denomEls)
      Array.from(denomEls).map(el => el.classList.remove('active'))

      let thisDenomEl = $event.target
      // console.log('denom el', thisDenomEl)
      thisDenomEl.classList.add('active')

      this.fields.denom = denom
      // console.log('setting denomination to', this.fields.denom)
    },
    trunc (value) {
      if (value.length > 20) value = this.value.substring(0, 20) + '...'
      return '“' + value + '”'
    },
    resetForm () {
      this.fields.address = ''
      this.fields.amount = null
      this.sending = false
      this.$v.$reset()
    },
    verifySend () {
      this.$v.$touch()
      if (this.$v.$error) return
      this.sending = true
      let amount = +this.fields.amount
      let address = this.fields.address
      let denom = this.fields.denom
      this.walletSend({
        fees: { denom, amount: 0 },
        to: address,
        amount: [{ denom, amount }],
        cb: (err) => {
          this.sending = false
          if (err) {
            this.$store.commit('notifyError', {
              title: 'Error Sending Coins',
              body: `An error occurred while trying to send coins: "${err.message}"`
            })
            return
          }
          this.$store.commit('notifyCustom', {
            title: 'Coins Sent',
            body: `Successfully sent ${amount} ${denom.toUpperCase()} to ${address}`
          })
        }
      })
    },
    ...mapActions(['walletSend'])
  },
  data: () => ({
    fields: {
      address: '',
      amount: null,
      denom: ''
    },
    sending: false
  }),
  validations: {
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
  }
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

#send-address
#send-amount
  mono()
  &::-webkit-input-placeholder
    df()
    color light
  &::-moz-placeholder
    df()
    color light
  &:-ms-input-placeholder
    df()
    color light
  &:-moz-placeholder
    df()
    color light

.denoms
  display flex
  .denom
    margin-right 0.5rem
    &.active
      border-color link
      background lighten(link, 90%)
      color link
    &:last-of-type
      margin-right 0
</style>
