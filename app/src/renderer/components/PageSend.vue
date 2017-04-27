<template>
  <div class="page-send">
    <page-header title="Send"></page-header>
    <form class="form" v-on:submit.prevent.default="verifySend">
      <div class="form-body">

        <div class="form-group" :class="{ 'form-group-error': $v.fields.address.$error }">
          <label for="send-address">Pay To</label>
          <div class="input-group">
            <field
              id="send-address"
              type="text"
              v-model="fields.address"
              @input="$v.fields.address.$touch()"
              placeholder="Address"
              required>
            </field>
          </div>
          <form-msg
            name="Address"
            type="required"
            v-if="!$v.fields.address.required">
          </form-msg>
          <form-msg
            name="Address"
            type="exactLength"
            length="40"
            v-if="!$v.fields.address.minLength || !$v.fields.address.maxLength">
          </form-msg>
          <form-msg
            name="Address"
            type="alphaNum"
            v-if="!$v.fields.address.alphaNum">
          </form-msg>
        </div>

        <div class="form-group" :class="{ 'form-group-error': $v.fields.amount.$error }">
          <label for="send-address">Amount</label>
          <div class="input-group">
            <field
              id="send-amount"
              type="number"
              v-model="fields.amount"
              @input="$v.fields.amount.$touch()"
              placeholder="Amount"
              required>
            </field>
            <div class="input-group-addon">Coins</div>
            <btn value="Max"></btn>
          </div>
          <form-msg
            name="Amount"
            type="required"
            v-if="!$v.fields.amount.required">
          </form-msg>
          <form-msg
            name="Amount"
            type="between"
            min="1"
            max="1000000"
            v-if="!$v.fields.amount.between">
          </form-msg>
        </div>

      </div><!--form-body-->

      <div class="form-footer">
        <btn value="Reset" @click.native="resetForm"></btn>
        <btn class="disabled" v-if="sending" value="Sending..."></btn>
        <btn type="submit" value="Send Now"></btn>
      </div>
    </form>
  </div>
</template>

<script>
import { required, between, minLength, maxLength, alphaNum } from 'vuelidate/lib/validators'
import { mapActions } from 'vuex'
import PageHeader from './PageHeader'
import Field from '@nylira/vue-input'
import Btn from '@nylira/vue-button'
import FormMsg from '@nylira/vue-form-msg'
export default {
  components: {
    PageHeader,
    Field,
    FormMsg,
    Btn
  },
  methods: {
    trunc (value) {
      if (value.length > 20) value = this.value.substring(0, 20) + '...'
      return '“' + value + '”'
    },
    resetForm () {
      this.fields.address = ''
      this.fields.amount = null
      this.$v.$reset()
    },
    verifySend () {
      this.$v.$touch()
      if (this.$v.$error) return
      this.sending = true
      this.send({
        walletId: 'default', // TODO: allow wallet selection
        address: this.fields.address,
        denom: 'mycoin', // TODO: allow denom selection
        amount: +this.fields.amount
      })

      this.$store.commit('notifyCustom', {
        title: `${this.fields.amount} Sent`,
        body: `You've successfully sent coins to ${this.fields.adddress})`
      })
      this.resetForm()
    },
    ...mapActions(['send'])
  },
  data: () => ({
    fields: {
      address: '',
      amount: null
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
      }
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-send
  flex 1
  display flex
  flex-flow column

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
</style>
