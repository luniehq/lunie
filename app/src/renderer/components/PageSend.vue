<template>
  <div class="page-send">
    <page-header title="Send"></page-header>
    <form class="form" v-on:submit.prevent.default="verifySend">
      <div class="form-body">

        <div class="form-group" :class="{ 'form-group-error': $v.fields.address.$error}">
          <label for="send-address">Pay To</label>
          <div class="input-group">
            <field
              id="send-address"
              type="text"
              v-model.trim="fields.address"
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

        <div class="form-group" :class="{ 'form-group-error': $v.fields.amount.$error}">
          <label for="send-address">Amount</label>
          <div class="input-group">
            <field
              id="send-amount"
              type="number"
              v-model.trim="fields.amount"
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
    resetForm () {
      this.fields.address = ''
      this.fields.amount = null
    },
    verifySend () {
      this.$v.$touch()
      if (!this.$v.$error) {
        this.sending = true
        this.send(this.fields.address, this.fields.amount)
        this.resetForm()
      }
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
        minLength: minLength(40),
        maxLength: maxLength(40),
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
